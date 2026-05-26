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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.DAO.UserDAO;
import com.example.Entities.User;
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

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            UserDAO dao = new UserDAO(conn);
            if (dao.usernameExists(body.get("username"))) {
                return ResponseEntity.badRequest().body("Username đã tồn tại!");
            }
            User user = new User();
            user.setUsername(body.get("username"));
            user.setEmail(body.get("email"));
            user.setFullName(body.get("fullName"));
            user.setPassword(passwordUtil.hash(body.get("password")));
            user.setRole("USER");
            dao.insertUser(user);
            return ResponseEntity.ok(Map.of("message", "Tạo user thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // Cập nhật user
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable int id, @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        try (Connection conn = dataSource.getConnection()) {

            RequestAuth.require(request);

            String sql = """
                    UPDATE users
                    SET email = ?, full_name = ?
                    WHERE id = ?
                    """;

            PreparedStatement ps = conn.prepareStatement(sql);

            ps.setString(1, body.get("email"));
            ps.setString(2, body.get("fullName"));
            ps.setInt(3, id);

            int rows = ps.executeUpdate();

            if (rows == 0) {
                return ResponseEntity.badRequest().body("Không tìm thấy user");
            }

            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // Danh sách user
    @GetMapping
    public ResponseEntity<?> getUsers(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String sql = """
                        SELECT id, username, email, full_name, role, is_active, created_at
                        FROM users ORDER BY id DESC
                    """;
            PreparedStatement ps = conn.prepareStatement(sql);
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
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // Khóa/mở khóa
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String getSql = "SELECT is_active FROM users WHERE id = ?";
            PreparedStatement get = conn.prepareStatement(getSql);
            get.setInt(1, id);
            ResultSet rs = get.executeQuery();
            if (!rs.next())
                return ResponseEntity.notFound().build();
            boolean current = rs.getBoolean("is_active");
            String updateSql = "UPDATE users SET is_active = ? WHERE id = ?";
            PreparedStatement update = conn.prepareStatement(updateSql);
            update.setBoolean(1, !current);
            update.setInt(2, id);
            update.executeUpdate();
            return ResponseEntity.ok(
                    Map.of("active", !current, "message", !current ? "Đã mở khóa!" : "Đã khóa!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }


    // Xóa user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String sql = "DELETE FROM users WHERE id = ? AND role = 'USER'";
            PreparedStatement ps = conn.prepareStatement(sql);
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
