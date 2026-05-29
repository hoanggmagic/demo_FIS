package com.example.Controller.Users;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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

            int finalBranchId =
                    (req.getBranchId() != null && req.getBranchId() > 0) ? req.getBranchId() : 1;

            // 1. Kiểm tra tồn kho từng sách tại chi nhánh
            for (OrderRequest.Item item : req.getItems()) {
                PreparedStatement ps = conn.prepareStatement(
                        "SELECT quantity FROM inventories WHERE book_id = ? AND branch_id = ?");
                ps.setInt(1, item.getBookId());
                ps.setInt(2, finalBranchId);
                ResultSet rs = ps.executeQuery();
                if (!rs.next() || rs.getInt("quantity") < item.getQty()) {
                    // Tìm chi nhánh khác có hàng
                    PreparedStatement altPs = conn.prepareStatement("""
                                SELECT i.branch_id, i.quantity, b.name as branch_name
                                FROM inventories i
                                JOIN branches b ON b.id = i.branch_id
                                WHERE i.book_id = ? AND i.quantity >= ?
                            """);
                    altPs.setInt(1, item.getBookId());
                    altPs.setInt(2, item.getQty());
                    ResultSet altRs = altPs.executeQuery();
                    List<Map<String, Object>> alternatives = new ArrayList<>();
                    while (altRs.next()) {
                        Map<String, Object> alt = new HashMap<>();
                        alt.put("branchId", altRs.getInt("branch_id"));
                        alt.put("branchName", altRs.getString("branch_name"));
                        alt.put("quantity", altRs.getInt("quantity"));
                        alternatives.add(alt);
                    }
                    Map<String, Object> errRes = new HashMap<>();
                    errRes.put("error",
                            "Sách ID " + item.getBookId() + " không đủ hàng tại chi nhánh này");
                    errRes.put("alternatives", alternatives);
                    return ResponseEntity.status(400).body(errRes);
                }
            }

            // 2. Tính tổng tiền từ book_prices
            double totalPrice = 0;
            Map<Integer, Double> priceMap = new HashMap<>(); // cache giá để dùng lại bước 4
            for (OrderRequest.Item item : req.getItems()) {
                PreparedStatement ps =
                        conn.prepareStatement("SELECT price FROM book_prices WHERE book_id = ?");
                ps.setInt(1, item.getBookId());
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    double p = rs.getDouble("price");
                    priceMap.put(item.getBookId(), p);
                    totalPrice += p * item.getQty();
                    System.out.println("📗 book_id=" + item.getBookId() + " price=" + p + " qty="
                            + item.getQty());
                } else {
                    System.out.println("❌ Không tìm thấy giá cho book_id=" + item.getBookId());
                    return ResponseEntity.status(400)
                            .body("Sách ID " + item.getBookId() + " chưa có giá trong hệ thống");
                }
            }
            System.out.println("💵 totalPrice=" + totalPrice);

            // 3. Insert order
            PreparedStatement orderStmt = conn.prepareStatement(
                    """
                                INSERT INTO orders (user_id, branch_id, total_price, author_income, platform_income, status)
                                VALUES (?, ?, ?, ?, ?, 'PENDING')
                                RETURNING id
                            """);
            orderStmt.setInt(1, userId);
            orderStmt.setInt(2, finalBranchId);
            orderStmt.setDouble(3, totalPrice);
            orderStmt.setDouble(4, totalPrice * 0.68);
            orderStmt.setDouble(5, totalPrice * 0.32);
            ResultSet orderRs = orderStmt.executeQuery();
            orderRs.next();
            int orderId = orderRs.getInt("id");
            System.out.println("✅ Created order id=" + orderId);

            // 4. Insert order_items + trừ kho
            for (OrderRequest.Item item : req.getItems()) {
                double bookPrice = priceMap.get(item.getBookId());

                // Insert order_item với giá đã lấy từ priceMap
                PreparedStatement itemStmt = conn.prepareStatement(
                        "INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)");
                itemStmt.setInt(1, orderId);
                itemStmt.setInt(2, item.getBookId());
                itemStmt.setInt(3, item.getQty());
                itemStmt.setDouble(4, bookPrice);
                itemStmt.executeUpdate();

                // Trừ kho tại chi nhánh
                PreparedStatement deductStmt = conn.prepareStatement("""
                            UPDATE inventories
                            SET quantity = quantity - ?
                            WHERE book_id = ? AND branch_id = ?
                        """);
                deductStmt.setInt(1, item.getQty());
                deductStmt.setInt(2, item.getBookId());
                deductStmt.setInt(3, finalBranchId);
                deductStmt.executeUpdate();
            }

            Map<String, Object> res = new HashMap<>();
            res.put("orderId", orderId);
            res.put("status", "PENDING");
            res.put("totalPrice", totalPrice);
            res.put("branchId", finalBranchId);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getOrderStatus(@PathVariable int orderId) {
        try (Connection conn = dataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("SELECT status FROM orders WHERE id = ?");
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

    @GetMapping
    public ResponseEntity<?> getOrderHistory(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            int userId = ctx.getUserId();
            PreparedStatement ps = conn.prepareStatement("""
                        SELECT o.id, o.total_price, o.status, o.created_at,
                               br.name as branch_name
                        FROM orders o
                        LEFT JOIN branches br ON br.id = o.branch_id
                        WHERE o.user_id = ?
                        ORDER BY o.created_at DESC
                    """);
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> orders = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> order = new HashMap<>();
                order.put("id", rs.getInt("id"));
                order.put("totalPrice", rs.getDouble("total_price"));
                order.put("status", rs.getString("status"));
                order.put("createdAt", rs.getTimestamp("created_at"));
                order.put("branchName", rs.getString("branch_name"));
                orders.add(order);
            }
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
