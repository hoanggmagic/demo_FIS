package com.example.Controller.Admin;

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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin("*")
public class AdminOrderController {

    @Autowired
    private DataSource dataSource;

    @GetMapping
public ResponseEntity<?> getAll(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String from,
        @RequestParam(required = false) String to,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        HttpServletRequest request) {
    try (Connection conn = dataSource.getConnection()) {
        RequestAuth.require(request);

        String where = " WHERE 1=1";
        List<Object> params = new ArrayList<>();

        if (status != null && !status.isEmpty()) {
            where += " AND o.status = ?";
            params.add(status);
        }
        if (from != null && !from.isEmpty()) {
            where += " AND o.created_at >= ?";
            params.add(from);
        }
        if (to != null && !to.isEmpty()) {
            where += " AND o.created_at <= ?";
            params.add(to + " 23:59:59");
        }

        String baseFrom = """
                FROM orders o
                LEFT JOIN users u ON u.id = o.user_id
                LEFT JOIN branches br ON br.id = o.branch_id
                """;

        // Count
        PreparedStatement countPs = conn.prepareStatement(
                "SELECT COUNT(*) " + baseFrom + where);
        for (int i = 0; i < params.size(); i++)
            countPs.setObject(i + 1, params.get(i));
        ResultSet countRs = countPs.executeQuery();
        countRs.next();
        long total = countRs.getLong(1);
        int totalPages = (int) Math.ceil((double) total / size);

        // Data
        String dataSql = """
                SELECT o.id, o.user_id, o.total_price, o.status, o.created_at,
                       u.full_name as user_name, u.username,
                       br.name as branch_name
                """ + baseFrom + where + " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";

        PreparedStatement ps = conn.prepareStatement(dataSql);
        for (int i = 0; i < params.size(); i++)
            ps.setObject(i + 1, params.get(i));
        ps.setInt(params.size() + 1, size);
        ps.setInt(params.size() + 2, page * size);

        ResultSet rs = ps.executeQuery();
        List<Map<String, Object>> list = new ArrayList<>();
        while (rs.next()) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", rs.getInt("id"));
            row.put("userId", rs.getInt("user_id"));
            row.put("userName", rs.getString("user_name"));
            row.put("username", rs.getString("username"));
            row.put("totalPrice", rs.getDouble("total_price"));
            row.put("status", rs.getString("status"));
            row.put("createdAt", rs.getTimestamp("created_at"));
            row.put("branchName", rs.getString("branch_name"));
            list.add(row);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("content", list);
        result.put("totalElements", total);
        result.put("totalPages", totalPages);
        result.put("page", page);
        result.put("size", size);
        return ResponseEntity.ok(result);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
    }
}

    // GET /api/admin/orders/{id}/items — lấy chi tiết đơn hàng
    @GetMapping("/{id}/items")
    public ResponseEntity<?> getItems(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            PreparedStatement ps = conn.prepareStatement("""
                        SELECT oi.book_id, oi.quantity, oi.price,
                               b.title as book_title
                        FROM order_items oi
                        JOIN books b ON b.id = oi.book_id
                        WHERE oi.order_id = ?
                    """);
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("bookId", rs.getInt("book_id"));
                row.put("bookTitle", rs.getString("book_title"));
                row.put("quantity", rs.getInt("quantity"));
                row.put("price", rs.getDouble("price"));
                list.add(row);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // PUT /api/admin/orders/{id}/status — cập nhật trạng thái
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int id,
            @RequestBody Map<String, String> body, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String newStatus = body.get("status");
            if (newStatus == null || newStatus.isEmpty())
                return ResponseEntity.badRequest().body("Thiếu status");

            PreparedStatement ps =
                    conn.prepareStatement("UPDATE orders SET status = ? WHERE id = ?");
            ps.setString(1, newStatus);
            ps.setInt(2, id);
            int rows = ps.executeUpdate();
            if (rows == 0)
                return ResponseEntity.status(404).body("Không tìm thấy đơn hàng");
            return ResponseEntity.ok("Cập nhật trạng thái thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
