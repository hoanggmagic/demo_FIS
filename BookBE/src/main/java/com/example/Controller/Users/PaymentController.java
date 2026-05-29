package com.example.Controller.Users;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    @Autowired
    private DataSource dataSource;

    @Value("${sepay.apikey}")
    private String sepayApiKey;

    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(@RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // =========================
        // 1. VERIFY API KEY
        // =========================
        if (authHeader == null || !authHeader.equals("Apikey " + sepayApiKey)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {

            // =========================
            // 2. GET CONTENT
            // =========================
            String content = (String) body.get("content");
            if (content == null)
                content = (String) body.get("description");

            System.out.println("🔥 WEBHOOK HIT: " + content);

            if (content == null || !content.contains("don hang")) {
                return ResponseEntity.ok(Map.of("success", true));
            }

            // =========================
            // 3. PARSE ORDER ID
            // =========================
            Pattern pattern = Pattern.compile("don hang\\s*(\\d+)");
            Matcher matcher = pattern.matcher(content);
            if (!matcher.find()) {
                System.out.println("❌ Cannot parse orderId");
                return ResponseEntity.ok(Map.of("success", true));
            }

            int orderId = Integer.parseInt(matcher.group(1));
            System.out.println("✅ Parsed orderId: " + orderId);

            try (Connection conn = dataSource.getConnection()) {
                conn.setAutoCommit(false);

                try {

                    // =========================
                    // 4. GET ORDER INFO (thêm branch_id)
                    // =========================
                    String getOrderSql = """
                                SELECT user_id, branch_id, total_price, status
                                FROM orders
                                WHERE id = ?
                                FOR UPDATE
                            """;

                    int userId = -1;
                    int branchId = -1;
                    BigDecimal totalPrice = BigDecimal.ZERO;
                    String status = "";

                    try (PreparedStatement ps = conn.prepareStatement(getOrderSql)) {
                        ps.setInt(1, orderId);
                        try (ResultSet rs = ps.executeQuery()) {
                            if (!rs.next()) {
                                conn.rollback();
                                return ResponseEntity.ok(Map.of("success", true));
                            }
                            userId = rs.getInt("user_id");
                            branchId = rs.getInt("branch_id");
                            totalPrice = rs.getBigDecimal("total_price");
                            status = rs.getString("status");
                        }
                    }

                    // =========================
                    // 5. IDEMPOTENT CHECK
                    // =========================
                    if (!"PENDING".equals(status)) {
                        System.out.println("⚠ Order already processed");
                        conn.rollback();
                        return ResponseEntity.ok(Map.of("success", true));
                    }

                    // =========================
                    // 6. CALCULATE COMMISSION
                    // =========================
                    BigDecimal authorRate = new BigDecimal("0.68");
                    BigDecimal platformRate = new BigDecimal("0.32");

                    BigDecimal authorIncome =
                            totalPrice.multiply(authorRate).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal platformIncome =
                            totalPrice.multiply(platformRate).setScale(2, RoundingMode.HALF_UP);

                    // =========================
                    // 7. UPDATE ORDER → SUCCESS
                    // =========================
                    String updateOrderSql = """
                                UPDATE orders
                                SET status = 'SUCCESS',
                                    author_income = ?,
                                    platform_income = ?
                                WHERE id = ?
                            """;

                    int updated;
                    try (PreparedStatement ps = conn.prepareStatement(updateOrderSql)) {
                        ps.setBigDecimal(1, authorIncome);
                        ps.setBigDecimal(2, platformIncome);
                        ps.setInt(3, orderId);
                        updated = ps.executeUpdate();
                    }

                    if (updated == 0) {
                        conn.rollback();
                        return ResponseEntity.ok(Map.of("success", true));
                    }
                    System.out.println("✅ Order updated SUCCESS");

                    // =========================
                    // 8. CLEAR CART
                    // =========================
                    try (PreparedStatement ps =
                            conn.prepareStatement("DELETE FROM cart WHERE user_id = ?")) {
                        ps.setInt(1, userId);
                        ps.executeUpdate();
                    }

                    // =========================
                    // 9. TRỪ KHO THEO CHI NHÁNH (đã đổi từ books.quantity → inventories)
                    // ⚠ Kho thực tế nằm ở bảng inventories, không còn ở books.quantity
                    // =========================
                    String updateStockSql = """
                                UPDATE inventories i
                                SET quantity = i.quantity - oi.quantity
                                FROM order_items oi
                                WHERE oi.book_id = i.book_id
                                  AND i.branch_id = ?
                                  AND oi.order_id = ?
                            """;
                    try (PreparedStatement ps = conn.prepareStatement(updateStockSql)) {
                        ps.setInt(1, branchId);
                        ps.setInt(2, orderId);
                        int rows = ps.executeUpdate();
                        System.out.println("📦 Inventory updated rows: " + rows + " (branch "
                                + branchId + ")");
                    }

                    // =========================
                    // 10. UPDATE WALLET (đã đổi từ book_prices → books.price)
                    // ⚠ book_prices không tồn tại, dùng books.price thay thế
                    // =========================
                    String itemSql = """
                                SELECT oi.quantity, oi.price, b.author_id
                                FROM order_items oi
                                JOIN books b ON oi.book_id = b.id
                                WHERE oi.order_id = ?
                            """;

                    String upsertWallet = """
                                INSERT INTO wallets (user_id, balance)
                                VALUES (?, ?)
                                ON CONFLICT (user_id)
                                DO UPDATE SET balance = wallets.balance + EXCLUDED.balance
                            """;

                    try (PreparedStatement ps = conn.prepareStatement(itemSql)) {
                        ps.setInt(1, orderId);
                        try (ResultSet rs = ps.executeQuery()) {
                            while (rs.next()) {
                                int authorId = rs.getInt("author_id");
                                int qty = rs.getInt("quantity");
                                double price = rs.getDouble("price");

                                BigDecimal total = BigDecimal.valueOf(price * qty);
                                BigDecimal authorShare = total.multiply(authorRate).setScale(2,
                                        RoundingMode.HALF_UP);
                                BigDecimal adminShare = total.multiply(platformRate).setScale(2,
                                        RoundingMode.HALF_UP);

                                // Cộng ví tác giả
                                try (PreparedStatement ps2 = conn.prepareStatement(upsertWallet)) {
                                    ps2.setInt(1, authorId);
                                    ps2.setBigDecimal(2, authorShare);
                                    ps2.executeUpdate();
                                }

                                // Cộng ví admin (user_id = 7)
                                try (PreparedStatement ps2 = conn.prepareStatement(upsertWallet)) {
                                    ps2.setInt(1, 7);
                                    ps2.setBigDecimal(2, adminShare);
                                    ps2.executeUpdate();
                                }

                                System.out.println("💰 Author " + authorId + " +" + authorShare);
                                System.out.println("🏦 Admin +" + adminShare);
                            }
                        }
                    }

                    // =========================
                    // 11. COMMIT
                    // =========================
                    conn.commit();
                    System.out.println("🎉 PAYMENT SUCCESS: orderId=" + orderId + " | Total="
                            + totalPrice + " | Author(68%)=" + authorIncome + " | Platform(32%)="
                            + platformIncome);

                } catch (Exception ex) {
                    conn.rollback();
                    throw ex;
                } finally {
                    conn.setAutoCommit(true);
                }
            }

            return ResponseEntity.ok(Map.of("success", true));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage(), "cause",
                            e.getCause() != null ? e.getCause().getMessage() : "null", "class",
                            e.getClass().getSimpleName()));
        }
    }
}
