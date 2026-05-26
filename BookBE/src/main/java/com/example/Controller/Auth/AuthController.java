package com.example.Controller.Auth;

import java.sql.Connection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.DAO.UserDAO;
import com.example.Entities.User;
import com.example.Service.AuthService;
import com.example.Service.MailService;
import com.example.Util.AuthContext;
import com.example.Util.JwtUtil;
import com.example.Util.PasswordUtil;
import com.example.Util.RequestAuth;
import com.example.dto.AuthResponse;
import com.example.dto.LoginRequest;
import com.example.dto.OtpData;
import com.example.dto.UserProfile;
import jakarta.servlet.http.HttpServletRequest;

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
    @Autowired
    private MailService mailService;

    private Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User body) {

        try (Connection conn = dataSource.getConnection()) {

            UserDAO dao = new UserDAO(conn);

            // 1. check username
            if (dao.usernameExists(body.getUsername())) {
                return ResponseEntity.badRequest().body("Username đã tồn tại");
            }

            // 2. lấy OTP từ storage
            OtpData otpData = otpStorage.get(body.getEmail());

            if (otpData == null) {
                return ResponseEntity.badRequest().body("Vui lòng gửi OTP trước");
            }

            // 3. check hết hạn
            if (System.currentTimeMillis() > otpData.getExpireTime()) {

                otpStorage.remove(body.getEmail());

                return ResponseEntity.badRequest().body("OTP đã hết hạn");
            }

            // 4. check OTP đúng
            if (!otpData.getOtp().equals(body.getOtp())) {
                return ResponseEntity.badRequest().body("OTP không đúng");
            }

            // 5. hash password
            body.setPassword(passwordUtil.hash(body.getPassword()));

            // 6. role mặc định
            body.setRole("USER");

            // 7. insert user
            dao.insertUser(body);

            // 8. xoá OTP sau khi thành công
            otpStorage.remove(body.getEmail());

            // 9. gửi mail
            mailService.sendMail(body.getEmail(), "Đăng ký thành công",
                    "Chào " + body.getUsername() + ", tài khoản của bạn đã được tạo thành công!");

            return ResponseEntity.ok("Đăng ký thành công");

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/register-author")
    public ResponseEntity<?> registerAuthor(@RequestBody User body) {
        try (Connection conn = dataSource.getConnection()) {
            UserDAO dao = new UserDAO(conn);

            if (dao.usernameExists(body.getUsername())) {
                return ResponseEntity.badRequest().body("Username đã tồn tại");
            }

            OtpData otpData = otpStorage.get(body.getEmail());
            if (otpData == null) {
                return ResponseEntity.badRequest().body("Vui lòng gửi OTP trước");
            }
            if (System.currentTimeMillis() > otpData.getExpireTime()) {
                otpStorage.remove(body.getEmail());
                return ResponseEntity.badRequest().body("OTP đã hết hạn");
            }
            if (!otpData.getOtp().equals(body.getOtp())) {
                return ResponseEntity.badRequest().body("OTP không đúng");
            }

            body.setPassword(passwordUtil.hash(body.getPassword()));

            dao.insertAuthor(body); // ← tự tạo ví luôn bên trong

            otpStorage.remove(body.getEmail());

            mailService.sendMail(body.getEmail(), "Đăng ký tác giả thành công",
                    "Chào " + body.getUsername() + ", tài khoản tác giả của bạn đã được tạo!");

            return ResponseEntity.ok("Đăng ký tác giả thành công");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {

        try {

            String email = body.get("email");

            if (email == null || email.isEmpty()) {

                return ResponseEntity.badRequest().body("Email không được để trống");
            }

            // random otp 6 số
            String otp = String.valueOf((int) ((Math.random() * 900000) + 100000));

            // hết hạn 5 phút
            long expireTime = System.currentTimeMillis() + (5 * 60 * 1000);

            // lưu otp
            otpStorage.put(email, new OtpData(otp, expireTime));

            // gửi mail
            mailService.sendMail(email, "Mã OTP đăng ký",
                    "OTP của bạn là: " + otp + "\nCó hiệu lực trong 5 phút.");

            return ResponseEntity.ok("OTP đã được gửi");

        } catch (Exception e) {

            return ResponseEntity.status(500).body("Lỗi gửi OTP: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {

        try {

            System.out.println("=== /me called ===");

            String authHeader = request.getHeader("Authorization");

            System.out.println("AUTH HEADER: " + authHeader);

            AuthContext ctx = RequestAuth.require(request);

            System.out.println("USER ID: " + ctx.getUserId());

            try (Connection conn = dataSource.getConnection()) {

                UserDAO dao = new UserDAO(conn);

                User user = dao.getUserById(ctx.getUserId());

                if (user == null) {
                    return ResponseEntity.status(404).body("User not found");
                }

                return ResponseEntity.ok(AuthService.toProfile(user));
            }

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
