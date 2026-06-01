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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;


@RestController("adminBranchController")
@RequestMapping("/api/admin/branches")
@CrossOrigin("*")
public class BranchController {

    @Autowired
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<?> getAll(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            PreparedStatement ps = conn.prepareStatement(
                    "SELECT id, name, address, phone, created_at FROM branches ORDER BY id");
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("name", rs.getString("name"));
                row.put("address", rs.getString("address"));
                row.put("phone", rs.getString("phone"));
                row.put("createdAt", rs.getTimestamp("created_at"));
                list.add(row);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String name = body.get("name");
            if (name == null || name.isBlank())
                return ResponseEntity.badRequest().body("Tên chi nhánh không được trống");

            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO branches (name, address, phone) VALUES (?, ?, ?) RETURNING id");
            ps.setString(1, name.trim());
            ps.setString(2, body.getOrDefault("address", ""));
            ps.setString(3, body.getOrDefault("phone", ""));
            ResultSet rs = ps.executeQuery();
            rs.next();

            Map<String, Object> res = new HashMap<>();
            res.put("id", rs.getInt("id"));
            res.put("message", "Thêm chi nhánh thành công!");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String name = body.get("name");
            if (name == null || name.isBlank())
                return ResponseEntity.badRequest().body("Tên chi nhánh không được trống");

            PreparedStatement ps = conn.prepareStatement(
                    "UPDATE branches SET name = ?, address = ?, phone = ? WHERE id = ?");
            ps.setString(1, name.trim());
            ps.setString(2, body.getOrDefault("address", ""));
            ps.setString(3, body.getOrDefault("phone", ""));
            ps.setInt(4, id);
            int rows = ps.executeUpdate();

            if (rows == 0)
                return ResponseEntity.status(404).body("Không tìm thấy chi nhánh");
            return ResponseEntity.ok("Cập nhật thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            // Kiểm tra còn tồn kho không
            PreparedStatement checkPs =
                    conn.prepareStatement("SELECT COUNT(*) FROM inventories WHERE branch_id = ?");
            checkPs.setInt(1, id);
            ResultSet checkRs = checkPs.executeQuery();
            checkRs.next();
            if (checkRs.getInt(1) > 0)
                return ResponseEntity.badRequest().body("Không thể xóa chi nhánh còn tồn kho!");

            PreparedStatement ps = conn.prepareStatement("DELETE FROM branches WHERE id = ?");
            ps.setInt(1, id);
            int rows = ps.executeUpdate();

            if (rows == 0)
                return ResponseEntity.status(404).body("Không tìm thấy chi nhánh");
            return ResponseEntity.ok("Xóa chi nhánh thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
