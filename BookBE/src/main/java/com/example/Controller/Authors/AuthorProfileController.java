package com.example.Controller.Authors;

import java.sql.Connection;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> updateProfile(@RequestBody Author author,
                                          HttpServletRequest request) {

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
                                           Authentication authentication) {

        try {
            String email = authentication.getName();

            // ⚠️ FIX: dùng repository style qua service đúng thiết kế
            User user = userService.getAllUsers()
                    .stream()
                    .filter(u -> u.getEmail().equals(email))
                    .findFirst()
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest().body("User không tồn tại");
            }

            // check password
            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Current password incorrect");
            }

            // update password
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));

            // ⚠️ FIX QUAN TRỌNG: không dùng save()
            userService.updateUser(user.getId(), user);

            return ResponseEntity.ok("Password changed successfully");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}