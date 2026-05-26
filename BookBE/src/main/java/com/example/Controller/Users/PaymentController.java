package com.example.Controller.Users;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Map;
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

        // 1. Verify API key từ Sepay
        if (authHeader == null || !authHeader.equals("Apikey " + sepayApiKey)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            // 2. Lấy nội dung chuyển khoản
            String content = (String) body.get("content");
            if (content == null) {
                content = (String) body.get("description");
            }

            System.out.println("SEPAY WEBHOOK: " + body);
            System.out.println("CONTENT: " + content);

            if (content == null || !content.contains("don hang")) {
                return ResponseEntity.ok(Map.of("success", true));
            }

            // 3. Parse orderId từ nội dung
            int orderId = -1;
            String[] parts = content.trim().split("\\s+");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equalsIgnoreCase("hang") && i + 1 < parts.length) {
                    try {
                        orderId = Integer.parseInt(parts[i + 1]);
                        break;
                    } catch (NumberFormatException ignored) {
                    }
                }
            }
            if (orderId == -1) {
                return ResponseEntity.ok(Map.of("success", true));
            }

            // Mở kết nối Database
            try (Connection conn = dataSource.getConnection()) {

                // Bật chế độ quản lý Transaction bằng tay để đảm bảo tính toàn vẹn dữ liệu
                conn.setAutoCommit(false);

                try {
                    // 4. Lấy dữ liệu chuẩn từ bảng orders (Đổi total_amount thành total_price theo
                    // Entity)
                    String getOrderSql =
                            "SELECT user_id, total_price FROM orders WHERE id = ? AND status = 'PENDING' FOR UPDATE";

                    int userId = -1;
                    BigDecimal totalPrice = BigDecimal.ZERO;

                    try (PreparedStatement getOrder = conn.prepareStatement(getOrderSql)) {
                        getOrder.setInt(1, orderId);
                        try (ResultSet rs = getOrder.executeQuery()) {
                            if (!rs.next()) {
                                conn.rollback();
                                return ResponseEntity.ok(Map.of("success", true));
                            }
                            userId = rs.getInt("user_id");
                            totalPrice = rs.getBigDecimal("total_price"); // Lấy tổng tiền đơn hàng
                                                                          // kiểu BigDecimal
                        }
                    }

                    // 5. LOGIC CHIA % HOA HỒNG (Ví dụ: Tác giả hưởng 80%, Nền tảng hưởng 20%)
                    // Sử dụng RoundingMode.HALF_UP để làm tròn số tiền chuẩn trong tài chính công
                    // ty
                    BigDecimal authorRate = new BigDecimal("0.68");
                    BigDecimal platformRate = new BigDecimal("0.32");

                    BigDecimal authorIncome =
                            totalPrice.multiply(authorRate).setScale(2, RoundingMode.HALF_UP);
                    BigDecimal platformIncome =
                            totalPrice.multiply(platformRate).setScale(2, RoundingMode.HALF_UP);

                    // 6. Cập nhật status order → SUCCESS và điền tiền đã chia vào các cột income
                    // tương ứng
                    String updateOrder = """
                                UPDATE orders
                                SET status = 'SUCCESS', author_income = ?, platform_income = ?
                                WHERE id = ?
                            """;
                    try (PreparedStatement updateStmt = conn.prepareStatement(updateOrder)) {
                        updateStmt.setBigDecimal(1, authorIncome);
                        updateStmt.setBigDecimal(2, platformIncome);
                        updateStmt.setInt(3, orderId);
                        updateStmt.executeUpdate();
                    }

                    // 7. Xóa giỏ hàng của user
                    String clearCart = "DELETE FROM cart WHERE user_id = ?";
                    try (PreparedStatement clearStmt = conn.prepareStatement(clearCart)) {
                        clearStmt.setInt(1, userId);
                        clearStmt.executeUpdate();
                    }

                    // 8. Trừ số lượng sách trong kho
                    String updateStock = """
                                UPDATE books SET quantity = books.quantity - oi.quantity
                                FROM order_items oi
                                WHERE oi.book_id = books.id AND oi.order_id = ?
                            """;
                    try (PreparedStatement updateStockStmt = conn.prepareStatement(updateStock)) {
                        updateStockStmt.setInt(1, orderId);
                        updateStockStmt.executeUpdate();
                    }
                    // 9. Cộng tiền vào ví author và admin
                    String getItemsSql = """
                                SELECT oi.quantity, p.price, b.author_id
                                FROM order_items oi
                                JOIN books b ON oi.book_id = b.id
                                JOIN book_prices p ON p.book_id = b.id
                                WHERE oi.order_id = ?
                            """;
                    try (PreparedStatement getItems = conn.prepareStatement(getItemsSql)) {
                        getItems.setInt(1, orderId);
                        try (ResultSet itemsRs = getItems.executeQuery()) {
                            while (itemsRs.next()) {
                                int authorId = itemsRs.getInt("author_id");
                                double price = itemsRs.getDouble("price");
                                int qty = itemsRs.getInt("quantity");
                                double total = price * qty;

                                BigDecimal authorShare = BigDecimal.valueOf(total * 0.68)
                                        .setScale(2, RoundingMode.HALF_UP);
                                BigDecimal adminShare = BigDecimal.valueOf(total * 0.32).setScale(2,
                                        RoundingMode.HALF_UP);

                                String upsertWallet =
                                        """
                                                    INSERT INTO wallets (user_id, balance)
                                                    VALUES (?, ?)
                                                    ON CONFLICT (user_id) DO UPDATE SET balance = wallets.balance + EXCLUDED.balance
                                                """;

                                // Cộng ví author
                                try (PreparedStatement authorWallet =
                                        conn.prepareStatement(upsertWallet)) {
                                    authorWallet.setInt(1, authorId);
                                    authorWallet.setBigDecimal(2, authorShare);
                                    authorWallet.executeUpdate();
                                }

                                // Cộng ví admin (user_id = 1)
                                try (PreparedStatement adminWallet =
                                        conn.prepareStatement(upsertWallet)) {
                                    adminWallet.setInt(1, 7);
                                    adminWallet.setBigDecimal(2, adminShare);
                                    adminWallet.executeUpdate();
                                }

                                System.out.println("Cộng ví author " + authorId + ": +"
                                        + authorShare + " VND");
                                System.out.println("Cộng ví admin: +" + adminShare + " VND");
                            }
                        }
                    }
                    // Nếu chạy tới đây mượt mà không lỗi -> Xác nhận lưu vĩnh viễn vào DB
                    conn.commit();
                    System.out.println("Đơn hàng " + orderId + " xử lý thành công!");
                    System.out.println("Tổng: " + totalPrice + " | Tác giả (68%): " + authorIncome
                            + " | Hệ thống (32%): " + platformIncome);

                } catch (Exception ex) {
                    // Nếu bất kỳ dòng lệnh nào ở trên lỗi -> Hủy bỏ (Rollback) toàn bộ quá trình,
                    // tránh sai lệch tiền kho
                    conn.rollback();
                    throw ex;
                } finally {
                    conn.setAutoCommit(true);
                }
            }

            return ResponseEntity.ok(Map.of("success", true));

        } catch (NumberFormatException e) {
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}
