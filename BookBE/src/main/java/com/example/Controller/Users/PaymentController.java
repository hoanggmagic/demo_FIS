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
import com.example.Service.OrderService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    @Autowired
    private DataSource dataSource;

    @Value("${sepay.apikey}")
    private String sepayApiKey;
    @Autowired
    private OrderService orderService;

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
                    // 8. CLEAR CART - chỉ xóa những sách đã thanh toán
                    System.out.println("🔍 Bắt đầu xóa cart | userId=" + userId + " | orderId="
                            + orderId + " | branchId=" + branchId);
                    String clearCartSql = """
                            DELETE FROM cart
                            WHERE user_id = ?
                            AND book_id IN (
                                SELECT book_id FROM order_items WHERE order_id = ?
                            )
                            AND branch_id = ?
                            """;
                    try (PreparedStatement ps = conn.prepareStatement(clearCartSql)) {
                        ps.setInt(1, userId);
                        ps.setInt(2, orderId);
                        ps.setInt(3, branchId);
                        int deleted = ps.executeUpdate();
                        System.out.println("🛒 Đã xóa " + deleted + " item | userId=" + userId
                                + " | branchId=" + branchId);
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
                    // =========================
                    // 10. UPDATE WALLET
                    // =========================
                    String itemSql = """
                            SELECT
                                oi.quantity,
                                oi.price,
                                oi.book_id,
                                b.title,
                                b.author_id
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

                    String insertTx =
                            """
                                    INSERT INTO wallet_transactions
                                    (wallet_id, user_id, book_id, order_id, amount, transaction_type, description, created_at)
                                    SELECT w.id, ?, ?, ?, ?, 'INCOME', ?, NOW()
                                    FROM wallets w
                                    WHERE w.user_id = ?
                                    """;

                    try (PreparedStatement ps = conn.prepareStatement(itemSql)) {
                        ps.setInt(1, orderId);
                        try (ResultSet rs = ps.executeQuery()) {
                            while (rs.next()) {
                                int authorId = rs.getInt("author_id");
                                int qty = rs.getInt("quantity");
                                int bookId = rs.getInt("book_id"); // 👈 THÊM
                                String title = rs.getString("title"); // 👈 THÊM
                                double price = rs.getDouble("price");

                                BigDecimal total = BigDecimal.valueOf(price * qty);
                                BigDecimal authorShare = total.multiply(authorRate).setScale(2,
                                        RoundingMode.HALF_UP);
                                BigDecimal adminShare = total.multiply(platformRate).setScale(2,
                                        RoundingMode.HALF_UP);

                                // Insert wallet_transaction cho tác giả (có đủ user_id + book_id)
                                try (PreparedStatement txPs = conn.prepareStatement(insertTx)) {
                                    txPs.setInt(1, authorId); // user_id
                                    txPs.setInt(2, bookId); // book_id 👈 THÊM
                                    txPs.setInt(3, orderId); // order_id
                                    txPs.setBigDecimal(4, authorShare); // amount
                                    txPs.setString(5, "Doanh thu sách: " + title + " (x" + qty
                                            + ") - order #" + orderId);
                                    txPs.setInt(6, authorId); // WHERE w.user_id = ?
                                    txPs.executeUpdate();
                                }

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

                                System.out.println("💰 Author " + authorId + " +" + authorShare
                                        + " | Book: " + title);
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
