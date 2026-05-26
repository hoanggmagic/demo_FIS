package com.example.Controller.Users;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.DAO.UserDAO;
import com.example.Entities.User;
import com.example.Service.MailService;
import com.example.Service.UserService;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import com.example.dto.ChangePasswordRequest;
import com.example.dto.OtpData;
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
    @Autowired
    private MailService mailService;
    private Map<String, OtpData> otpStorage = new HashMap<>();

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

    // =================================================
    // UPDATE PROFILE (Sửa tại Controller - Giữ nguyên DAO)
    // =================================================
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

    // =========================
    // CHANGE PASSWORD
    // =========================
    @PostMapping("/send-reset-otp")
    public ResponseEntity<?> sendResetOtp(HttpServletRequest request) {

        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);

            UserDAO dao = new UserDAO(conn);
            User user = dao.getUserById(ctx.getUserId());

            if (user == null) {
                return ResponseEntity.badRequest().body("User không tồn tại");
            }

            String email = user.getEmail(); // ✅ LẤY TỪ DB

            String otp = String.valueOf((int) (Math.random() * 900000 + 100000));
            long expireTime = System.currentTimeMillis() + (5 * 60 * 1000);

            otpStorage.put(email, new OtpData(otp, expireTime));

            mailService.sendMail(email, "OTP Reset Password", "OTP của bạn: " + otp + " (5 phút)");

            return ResponseEntity.ok("OTP đã gửi");

        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // =================================================
    // VERIFY OTP
    // =================================================
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body("Thiếu dữ liệu");
        }

        OtpData data = otpStorage.get(email);

        if (data == null) {
            return ResponseEntity.badRequest().body("OTP không tồn tại");
        }

        if (System.currentTimeMillis() > data.getExpireTime()) {
            return ResponseEntity.badRequest().body("OTP đã hết hạn");
        }

        if (!data.getOtp().equals(otp)) {
            return ResponseEntity.badRequest().body("OTP không đúng");
        }

        return ResponseEntity.ok("OTP hợp lệ");
    }

    // =================================================
    // CHANGE PASSWORD (WITH OTP)
    // =================================================
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

            // check mật khẩu cũ
            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Sai mật khẩu hiện tại");
            }

            // check OTP
            OtpData otpData = otpStorage.get(user.getEmail());

            if (otpData == null || System.currentTimeMillis() > otpData.getExpireTime()
                    || !otpData.getOtp().equals(req.getOtp())) {

                return ResponseEntity.badRequest().body("OTP không hợp lệ");
            }

            // update password
            String newPass = passwordEncoder.encode(req.getNewPassword());

            try (PreparedStatement ps =
                    conn.prepareStatement("UPDATE users SET password=? WHERE id=?")) {

                ps.setString(1, newPass);
                ps.setInt(2, ctx.getUserId());
                ps.executeUpdate();
            }

            otpStorage.remove(user.getEmail());

            return ResponseEntity.ok("Đổi mật khẩu thành công");

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
