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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/inventory")
@CrossOrigin("*")
public class InventoryController {

    @Autowired
    private DataSource dataSource;

    // GET /api/admin/inventory — lấy tất cả tồn kho theo chi nhánh
    @GetMapping
    public ResponseEntity<?> getAll(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            PreparedStatement ps = conn.prepareStatement("""
                        SELECT i.book_id, i.branch_id, i.quantity,
                               b.title as book_title,
                               br.name as branch_name
                        FROM inventories i
                        JOIN books b ON b.id = i.book_id
                        JOIN branches br ON br.id = i.branch_id
                        ORDER BY br.name, b.title
                    """);
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("bookId", rs.getInt("book_id"));
                row.put("branchId", rs.getInt("branch_id"));
                row.put("quantity", rs.getInt("quantity"));
                row.put("bookTitle", rs.getString("book_title"));
                row.put("branchName", rs.getString("branch_name"));
                list.add(row);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // GET /api/admin/inventory/branches — lấy danh sách chi nhánh
    @GetMapping("/branches")
    public ResponseEntity<?> getBranches(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            PreparedStatement ps =
                    conn.prepareStatement("SELECT id, name, address FROM branches ORDER BY id");
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("name", rs.getString("name"));
                row.put("address", rs.getString("address"));
                list.add(row);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // POST /api/admin/inventory — thêm hoặc cập nhật số lượng
    // Body: { bookId, branchId, quantity }
    @PostMapping
    public ResponseEntity<?> upsert(@RequestBody Map<String, Integer> body,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            int bookId = body.get("bookId");
            int branchId = body.get("branchId");
            int quantity = body.get("quantity");

            if (quantity < 0)
                return ResponseEntity.badRequest().body("Số lượng không được âm");

            PreparedStatement ps = conn.prepareStatement("""
                        INSERT INTO inventories (book_id, branch_id, quantity)
                        VALUES (?, ?, ?)
                        ON CONFLICT (book_id, branch_id)
                        DO UPDATE SET quantity = ?
                    """);
            ps.setInt(1, bookId);
            ps.setInt(2, branchId);
            ps.setInt(3, quantity);
            ps.setInt(4, quantity);
            ps.executeUpdate();

            return ResponseEntity.ok("Cập nhật tồn kho thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
