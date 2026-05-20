package com.example.Controller;

import com.example.DAO.UserDAO;
import com.example.Entities.User;
import com.example.Service.AuthService;
import com.example.Util.AuthContext;
import com.example.Util.JwtUtil;
import com.example.Util.PasswordUtil;
import com.example.Util.RequestAuth;
import com.example.dto.AuthResponse;
import com.example.dto.LoginRequest;
import com.example.dto.UserProfile;
import jakarta.servlet.http.HttpServletRequest;
import java.sql.Connection;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordUtil passwordUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest body) {
        try (Connection conn = dataSource.getConnection()) {
            AuthService authService = new AuthService(conn, passwordUtil);
            User user = authService.login(body.getUsername(), body.getPassword());
            String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
            UserProfile profile = AuthService.toProfile(user);
            return ResponseEntity.ok(new AuthResponse(token, profile));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfile> me(HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);
            try (Connection conn = dataSource.getConnection()) {
                UserDAO dao = new UserDAO(conn);
                User user = dao.getUserById(ctx.getUserId());
                if (user == null) {
                    return ResponseEntity.status(404).build();
                }
                return ResponseEntity.ok(AuthService.toProfile(user));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
