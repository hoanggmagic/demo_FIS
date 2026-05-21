package com.example.Controller.Authors;

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
import com.example.Entities.Author;
import com.example.Entities.User;
import com.example.Service.UserService;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import com.example.dto.ChangePasswordRequest;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/author/profile")
@CrossOrigin(origins = "*")
public class AuthorProfileController {

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

            Author author = dao.getAuthorById(ctx.getUserId());

            if (author == null) {
                return ResponseEntity.badRequest().body("Không tìm thấy author");
            }

            return ResponseEntity.ok(author);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // =========================
    // UPDATE PROFILE
    // =========================
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Author author, HttpServletRequest request) {

        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);

            author.setId(ctx.getUserId());

            UserDAO dao = new UserDAO(conn);
            dao.updateAuthor(author);

            return ResponseEntity.ok("Cập nhật profile thành công!");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // =========================
    // CHANGE PASSWORD (FIXED)
    // =========================
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req,
            HttpServletRequest request) {

        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);

            UserDAO dao = new UserDAO(conn);
            User user = dao.getUserById(ctx.getUserId()); // ← dùng getUserById có sẵn

            if (user == null) {
                return ResponseEntity.badRequest().body("User không tồn tại");
            }

            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Mật khẩu hiện tại không đúng");
            }

            // Update password trực tiếp qua SQL
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
