package com.example.Controller.Admin;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.Util.PasswordUtil;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private DataSource dataSource;
    @Autowired
    private PasswordUtil passwordUtil;

    @GetMapping
    public ResponseEntity<?> getUsers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String keyword, HttpServletRequest request) {

        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);

            String like = "%" + keyword + "%";

            // Count total
            String countSql = """
                    SELECT COUNT(*) FROM users
                    WHERE role = 'USER'
                    AND (? = '' OR username LIKE ? OR email LIKE ? OR full_name LIKE ?)
                    """;
            PreparedStatement countPs = conn.prepareStatement(countSql);
            countPs.setString(1, keyword);
            countPs.setString(2, like);
            countPs.setString(3, like);
            countPs.setString(4, like);
            ResultSet countRs = countPs.executeQuery();
            countRs.next();
            long total = countRs.getLong(1);
            int totalPages = (int) Math.ceil((double) total / size);

            // Get paged data
            String sql = """
                    SELECT id, username, email, full_name, role, is_active, created_at
                    FROM users
                    WHERE role = 'USER'
                    AND (? = '' OR username LIKE ? OR email LIKE ? OR full_name LIKE ?)
                    ORDER BY id DESC
                    LIMIT ? OFFSET ?
                    """;
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, keyword);
            ps.setString(2, like);
            ps.setString(3, like);
            ps.setString(4, like);
            ps.setInt(5, size);
            ps.setInt(6, page * size);

            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("username", rs.getString("username"));
                row.put("email", rs.getString("email"));
                row.put("fullName", rs.getString("full_name"));
                row.put("role", rs.getString("role"));
                row.put("active", rs.getBoolean("is_active"));
                row.put("createdAt", rs.getTimestamp("created_at"));
                list.add(row);
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("content", list);
            result.put("totalElements", total);
            result.put("totalPages", totalPages);
            result.put("page", page);
            result.put("size", size);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable int id, @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);

            String sql = """
                    UPDATE users SET email = ?, full_name = ?
                    WHERE id = ?
                    """;
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, body.get("email"));
            ps.setString(2, body.get("fullName"));
            ps.setInt(3, id);

            int rows = ps.executeUpdate();
            if (rows == 0)
                return ResponseEntity.badRequest().body("Không tìm thấy user");

            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);

            PreparedStatement get =
                    conn.prepareStatement("SELECT is_active FROM users WHERE id = ?");
            get.setInt(1, id);
            ResultSet rs = get.executeQuery();
            if (!rs.next())
                return ResponseEntity.notFound().build();

            boolean current = rs.getBoolean("is_active");

            PreparedStatement update =
                    conn.prepareStatement("UPDATE users SET is_active = ? WHERE id = ?");
            update.setBoolean(1, !current);
            update.setInt(2, id);
            update.executeUpdate();

            return ResponseEntity.ok(
                    Map.of("active", !current, "message", !current ? "Đã mở khóa!" : "Đã khóa!"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);

            PreparedStatement ps =
                    conn.prepareStatement("DELETE FROM users WHERE id = ? AND role = 'USER'");
            ps.setInt(1, id);
            int rows = ps.executeUpdate();

            if (rows == 0)
                return ResponseEntity.badRequest().body("Không thể xóa!");

            return ResponseEntity.ok(Map.of("message", "Đã xóa!"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
