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

            // 0. Kiểm tra sách INACTIVE trong đơn hàng
            for (OrderRequest.Item item : req.getItems()) {
                try (PreparedStatement ps =
                        conn.prepareStatement("SELECT status, title FROM books WHERE id = ?")) {
                    ps.setInt(1, item.getBookId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next() && !"ACTIVE".equals(rs.getString("status"))) {
                            return ResponseEntity.status(400).body("Sách \"" + rs.getString("title")
                                    + "\" đã ngừng phát hành, vui lòng xóa khỏi giỏ hàng trước khi thanh toán");
                        }
                    }
                }
            }

            // 1. Kiểm tra tồn kho
            for (OrderRequest.Item item : req.getItems()) {
                try (PreparedStatement ps = conn.prepareStatement(
                        "SELECT quantity FROM inventories WHERE book_id = ? AND branch_id = ?")) {
                    ps.setInt(1, item.getBookId());
                    ps.setInt(2, finalBranchId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next() || rs.getInt("quantity") < item.getQty()) {
                            try (PreparedStatement altPs = conn.prepareStatement("""
                                    SELECT i.branch_id, i.quantity, b.name as branch_name
                                    FROM inventories i
                                    JOIN branches b ON b.id = i.branch_id
                                    WHERE i.book_id = ? AND i.quantity >= ?
                                    """)) {
                                altPs.setInt(1, item.getBookId());
                                altPs.setInt(2, item.getQty());
                                try (ResultSet altRs = altPs.executeQuery()) {
                                    List<Map<String, Object>> alternatives = new ArrayList<>();
                                    while (altRs.next()) {
                                        Map<String, Object> alt = new HashMap<>();
                                        alt.put("branchId", altRs.getInt("branch_id"));
                                        alt.put("branchName", altRs.getString("branch_name"));
                                        alt.put("quantity", altRs.getInt("quantity"));
                                        alternatives.add(alt);
                                    }
                                    Map<String, Object> errRes = new HashMap<>();
                                    errRes.put("error", "Sách ID " + item.getBookId()
                                            + " không đủ hàng tại chi nhánh này");
                                    errRes.put("alternatives", alternatives);
                                    return ResponseEntity.status(400).body(errRes);
                                }
                            }
                        }
                    }
                }
            }

            // 2. Tính tổng tiền từ book_prices
            double totalPrice = 0;
            Map<Integer, Double> priceMap = new HashMap<>();
            for (OrderRequest.Item item : req.getItems()) {
                try (PreparedStatement ps = conn.prepareStatement("""
                        SELECT
                            CASE
                                WHEN sale_price > 0
                                    AND sale_start IS NOT NULL
                                    AND sale_end IS NOT NULL
                                    AND NOW() BETWEEN sale_start AND sale_end
                                THEN sale_price
                                ELSE original_price
                            END AS price
                        FROM book_prices
                        WHERE book_id = ?
                        """)) {
                    ps.setInt(1, item.getBookId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            double p = rs.getDouble("price");
                            priceMap.put(item.getBookId(), p);
                            totalPrice += p * item.getQty();
                        } else {
                            return ResponseEntity.status(400).body(
                                    "Sách ID " + item.getBookId() + " chưa có giá trong hệ thống");
                        }
                    }
                }
            }

            // 3. Insert order
            int orderId;
            try (PreparedStatement orderStmt = conn.prepareStatement("""
                    INSERT INTO orders (
                        user_id, branch_id, total_price, author_income, platform_income,
                        status, delivery_type, receiver_name, receiver_phone, delivery_address
                    )
                    VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)
                    RETURNING id
                    """)) {
                orderStmt.setInt(1, userId);
                orderStmt.setInt(2, finalBranchId);
                orderStmt.setDouble(3, totalPrice);
                orderStmt.setDouble(4, totalPrice * 0.68);
                orderStmt.setDouble(5, totalPrice * 0.32);
                orderStmt.setString(6, req.getDeliveryType());
                orderStmt.setString(7, req.getReceiverName());
                orderStmt.setString(8, req.getReceiverPhone());
                orderStmt.setString(9, req.getDeliveryAddress());
                try (ResultSet orderRs = orderStmt.executeQuery()) {
                    orderRs.next();
                    orderId = orderRs.getInt("id");
                }
            }

            // 4. Insert order_items + trừ kho
            for (OrderRequest.Item item : req.getItems()) {
                double bookPrice = priceMap.get(item.getBookId());

                try (PreparedStatement itemStmt = conn.prepareStatement(
                        "INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)")) {
                    itemStmt.setInt(1, orderId);
                    itemStmt.setInt(2, item.getBookId());
                    itemStmt.setInt(3, item.getQty());
                    itemStmt.setDouble(4, bookPrice);
                    itemStmt.executeUpdate();
                }

                // Trừ kho
                try (PreparedStatement stockStmt = conn.prepareStatement(
                        "UPDATE inventories SET quantity = quantity - ? WHERE book_id = ? AND branch_id = ?")) {
                    stockStmt.setInt(1, item.getQty());
                    stockStmt.setInt(2, item.getBookId());
                    stockStmt.setInt(3, finalBranchId);
                    stockStmt.executeUpdate();
                }
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
            try (PreparedStatement ps =
                    conn.prepareStatement("SELECT status FROM orders WHERE id = ?")) {
                ps.setInt(1, orderId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        Map<String, Object> res = new HashMap<>();
                        res.put("orderId", orderId);
                        res.put("status", rs.getString("status"));
                        return ResponseEntity.ok(res);
                    }
                }
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
            try (PreparedStatement ps = conn.prepareStatement("""
                    SELECT o.id, o.total_price, o.status, o.created_at,
                           br.name as branch_name
                    FROM orders o
                    LEFT JOIN branches br ON br.id = o.branch_id
                    WHERE o.user_id = ?
                    ORDER BY o.created_at DESC
                    """)) {
                ps.setInt(1, userId);
                try (ResultSet rs = ps.executeQuery()) {
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
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
