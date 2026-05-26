package com.example.Controller.Users;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import com.example.dto.OrderRequest;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private DataSource dataSource;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest req,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            int userId = ctx.getUserId();

            // 1. Tính tổng tiền
            double totalPrice = 0;
            for (OrderRequest.Item item : req.getItems()) {
                String priceSql = "SELECT price FROM book_prices WHERE book_id = ?";
                PreparedStatement ps = conn.prepareStatement(priceSql);
                ps.setInt(1, item.getBookId());
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    totalPrice += rs.getDouble("price") * item.getQty();
                }
            }

            // 2. Insert order
            String orderSql =
                    """
                                INSERT INTO orders (user_id, total_price, author_income, platform_income, status)
                                VALUES (?, ?, ?, ?, 'PENDING')
                                RETURNING id
                            """;
            PreparedStatement orderStmt = conn.prepareStatement(orderSql);
            orderStmt.setInt(1, userId);
            orderStmt.setDouble(2, totalPrice);
            orderStmt.setDouble(3, totalPrice * 0.7);
            orderStmt.setDouble(4, totalPrice * 0.3);
            ResultSet orderRs = orderStmt.executeQuery();
            orderRs.next();
            int orderId = orderRs.getInt("id");

            // 3. Insert order_items
            for (OrderRequest.Item item : req.getItems()) {
                String itemSql = """
                            INSERT INTO order_items (order_id, book_id, quantity, price)
                            SELECT ?, ?, ?, price FROM book_prices WHERE book_id = ?
                        """;
                PreparedStatement itemStmt = conn.prepareStatement(itemSql);
                itemStmt.setInt(1, orderId);
                itemStmt.setInt(2, item.getBookId());
                itemStmt.setInt(3, item.getQty());
                itemStmt.setInt(4, item.getBookId());
                itemStmt.executeUpdate();
            }

            Map<String, Object> res = new HashMap<>();
            res.put("orderId", orderId);
            res.put("status", "PENDING");
            res.put("totalPrice", totalPrice);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            e.printStackTrace(); // ← in ra terminal
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getOrderStatus(@PathVariable int orderId) {
        try (Connection conn = dataSource.getConnection()) {
            String sql = "SELECT status FROM orders WHERE id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, orderId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Map<String, Object> res = new HashMap<>();
                res.put("orderId", orderId);
                res.put("status", rs.getString("status"));
                return ResponseEntity.ok(res);
            }
            return ResponseEntity.status(404).body("Order not found");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
