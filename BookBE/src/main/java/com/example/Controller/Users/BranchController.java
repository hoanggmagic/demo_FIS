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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class BranchController {

    @Autowired
    private DataSource dataSource;

    // GET /api/user/branches
    // Lấy danh sách tất cả chi nhánh
    @GetMapping("/branches")
    public ResponseEntity<?> getAllBranches() {
        try (Connection conn = dataSource.getConnection()) {
            PreparedStatement ps = conn
                    .prepareStatement("SELECT id, name, address, phone FROM branches ORDER BY id");
            ResultSet rs = ps.executeQuery();

            List<Map<String, Object>> branches = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> b = new HashMap<>();
                b.put("id", rs.getInt("id"));
                b.put("name", rs.getString("name"));
                b.put("address", rs.getString("address"));
                b.put("phone", rs.getString("phone"));
                branches.add(b);
            }
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // GET /api/user/books/{bookId}/stock
    // Lấy tồn kho của 1 sách theo từng chi nhánh
    // Response: [{ branchId, branchName, address, phone, quantity }]
    @GetMapping("/books/{bookId}/stock")
    public ResponseEntity<?> getStockByBook(@PathVariable int bookId) {
        try (Connection conn = dataSource.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("""
                        SELECT b.id as branch_id, b.name as branch_name,
                               b.address, b.phone,
                               COALESCE(i.quantity, 0) as quantity
                        FROM branches b
                        LEFT JOIN inventories i
                               ON i.branch_id = b.id AND i.book_id = ?
                        ORDER BY b.id
                    """);
            ps.setInt(1, bookId);
            ResultSet rs = ps.executeQuery();

            List<Map<String, Object>> stock = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("branchId", rs.getInt("branch_id"));
                row.put("branchName", rs.getString("branch_name"));
                row.put("address", rs.getString("address"));
                row.put("phone", rs.getString("phone"));
                row.put("quantity", rs.getInt("quantity"));
                stock.add(row);
            }
            return ResponseEntity.ok(stock);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
