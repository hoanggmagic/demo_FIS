package com.example.Controller.Users;

import java.sql.Connection;
import java.sql.PreparedStatement;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.DAO.UserDAO;
import com.example.Entities.User;
import com.example.Service.UserService;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import com.example.dto.ChangePasswordRequest;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/user/profile")
@CrossOrigin(origins = "*")
public class UserProfileController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =========================
    // GET PROFILE
    // =========================
    @GetMapping
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);

            UserDAO dao = new UserDAO(conn);
            User user = dao.getUserById(ctx.getUserId());

            if (user == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy user");
            }

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // =========================
    // UPDATE PROFILE (chỉ name)
    // =========================
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody User userUpdate,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);

            // Chỉ cho phép update name
            String sql = "UPDATE users SET full_name = ?, nationality = ? WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, userUpdate.getFullName());
                ps.setString(2, userUpdate.getNationality()); // 🆕
                ps.setInt(3, ctx.getUserId());
                ps.executeUpdate();
            }

            return ResponseEntity.ok("Cập nhật profile thành công!");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // =========================
    // CHANGE PASSWORD
    // =========================
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);

            UserDAO dao = new UserDAO(conn);
            User user = dao.getUserById(ctx.getUserId());

            if (user == null) {
                return ResponseEntity.badRequest().body("User không tồn tại");
            }

            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Mật khẩu hiện tại không đúng");
            }

            String newHashed = passwordEncoder.encode(req.getNewPassword());
            String sql = "UPDATE users SET password = ? WHERE id = ?";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, newHashed);
                ps.setInt(2, ctx.getUserId());
                ps.executeUpdate();
            }

            return ResponseEntity.ok("Đổi mật khẩu thành công");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
