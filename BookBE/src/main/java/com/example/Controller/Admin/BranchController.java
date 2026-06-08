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
                    "SELECT id, name, address, phone, status, created_at FROM branches ORDER BY id");
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("name", rs.getString("name"));
                row.put("address", rs.getString("address"));
                row.put("phone", rs.getString("phone"));
                row.put("status", rs.getString("status"));
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

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStatus(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);

            // Lấy status hiện tại
            PreparedStatement getPs =
                    conn.prepareStatement("SELECT status FROM branches WHERE id = ?");
            getPs.setInt(1, id);
            ResultSet rs = getPs.executeQuery();

            if (!rs.next())
                return ResponseEntity.status(404).body("Không tìm thấy chi nhánh");

            String currentStatus = rs.getString("status");
            String newStatus = currentStatus.equals("active") ? "inactive" : "active";

            // Cập nhật sang trạng thái mới
            PreparedStatement updatePs =
                    conn.prepareStatement("UPDATE branches SET status = ? WHERE id = ?");
            updatePs.setString(1, newStatus);
            updatePs.setInt(2, id);
            updatePs.executeUpdate();

            Map<String, Object> res = new HashMap<>();
            res.put("id", id);
            res.put("status", newStatus);
            res.put("message", newStatus.equals("active") ? "Đã kích hoạt chi nhánh!"
                    : "Đã vô hiệu hóa chi nhánh!");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
