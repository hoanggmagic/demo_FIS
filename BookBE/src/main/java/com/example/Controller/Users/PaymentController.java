package com.example.Controller.Users;

import java.sql.Connection;
import java.sql.PreparedStatement;
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

    // Sepay gọi về đây khi có tiền vào
    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(@RequestBody Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // 1. Verify API key từ Sepay
        if (authHeader == null || !authHeader.equals("Apikey " + sepayApiKey)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            // 2. Lấy nội dung chuyển khoản — dạng "Thanh toan don hang 123"
            String content = (String) body.get("content");
            if (content == null)
                content = (String) body.get("description");

            System.out.println("SEPAY WEBHOOK: " + body);
            System.out.println("CONTENT: " + content);

            if (content == null || !content.contains("don hang")) {
                return ResponseEntity.ok(Map.of("success", true)); // không phải giao dịch của app
            }

            // 3. Parse orderId từ nội dung
            // Nội dung dạng: "Thanh toan don hang 123"
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


            try (Connection conn = dataSource.getConnection()) {
                // 4. Lấy user_id từ order
                String getOrderSql =
                        "SELECT user_id FROM orders WHERE id = ? AND status = 'PENDING'";
                PreparedStatement getOrder = conn.prepareStatement(getOrderSql);
                getOrder.setInt(1, orderId);
                var rs = getOrder.executeQuery();

                if (!rs.next()) {
                    return ResponseEntity.ok(Map.of("success", true)); // order không tồn tại hoặc
                                                                       // đã xử lý
                }

                int userId = rs.getInt("user_id");

                // 5. Cập nhật status order → SUCCESS
                String updateOrder = "UPDATE orders SET status = 'SUCCESS' WHERE id = ?";
                PreparedStatement updateStmt = conn.prepareStatement(updateOrder);
                updateStmt.setInt(1, orderId);
                updateStmt.executeUpdate();

                // 6. Xóa giỏ hàng
                String clearCart = "DELETE FROM cart WHERE user_id = ?";
                PreparedStatement clearStmt = conn.prepareStatement(clearCart);
                clearStmt.setInt(1, userId);
                clearStmt.executeUpdate();
                String updateStock = """
                            UPDATE books SET quantity = books.quantity - oi.quantity
                            FROM order_items oi
                            WHERE oi.book_id = books.id AND oi.order_id = ?
                        """;
                PreparedStatement updateStockStmt = conn.prepareStatement(updateStock);
                updateStockStmt.setInt(1, orderId);
                updateStockStmt.executeUpdate();
                System.out
                        .println("Order " + orderId + " SUCCESS, cart cleared for user " + userId);
            }

            return ResponseEntity.ok(Map.of("success", true));

        } catch (NumberFormatException e) {
            // Nội dung không có orderId hợp lệ → bỏ qua
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
