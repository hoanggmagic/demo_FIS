package com.example.Controller.Admin;

import java.math.BigDecimal;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.Service.MailService;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/wallet")
@CrossOrigin("*")
public class AdminWalletController {

    @Autowired
    private DataSource dataSource;
    @Autowired
    private MailService mailService;

    // Xem số dư ví admin
    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String sql = "SELECT balance FROM wallets WHERE user_id = 7";
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return ResponseEntity.ok(Map.of("balance", rs.getBigDecimal("balance")));
            }
            return ResponseEntity.ok(Map.of("balance", 0));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // Xem tất cả yêu cầu rút tiền
    @GetMapping("/withdraw-requests")
    public ResponseEntity<?> getRequests(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String sql = """
                        SELECT wr.id, u.username, u.full_name, wr.amount,
                               wr.bank_name, wr.account_number, wr.account_holder,
                               wr.status, wr.created_at
                        FROM withdraw_requests wr
                        JOIN users u ON wr.user_id = u.id
                        ORDER BY wr.created_at DESC
                    """;
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("username", rs.getString("username"));
                row.put("fullName", rs.getString("full_name"));
                row.put("amount", rs.getBigDecimal("amount"));
                row.put("bankName", rs.getString("bank_name"));
                row.put("accountNumber", rs.getString("account_number"));
                row.put("accountHolder", rs.getString("account_holder"));
                row.put("status", rs.getString("status"));
                row.put("createdAt", rs.getTimestamp("created_at"));
                list.add(row);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // Duyệt yêu cầu
    @PutMapping("/withdraw-requests/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);

            // Lấy thông tin yêu cầu + email author
            String getSql = """
                        SELECT wr.amount, wr.bank_name, wr.account_number, wr.account_holder,
                               u.email, u.full_name
                        FROM withdraw_requests wr
                        JOIN users u ON wr.user_id = u.id
                        WHERE wr.id = ? AND wr.status = 'PENDING'
                    """;
            PreparedStatement get = conn.prepareStatement(getSql);
            get.setInt(1, id);
            ResultSet rs = get.executeQuery();
            if (!rs.next())
                return ResponseEntity.badRequest().body("Không tìm thấy yêu cầu!");

            BigDecimal amount = rs.getBigDecimal("amount");
            String bankName = rs.getString("bank_name");
            String accountNumber = rs.getString("account_number");
            String accountHolder = rs.getString("account_holder");
            String email = rs.getString("email");
            String fullName = rs.getString("full_name");
            // Cập nhật status
            String updateSql = "UPDATE withdraw_requests SET status = 'APPROVED' WHERE id = ?";
            PreparedStatement update = conn.prepareStatement(updateSql);
            update.setInt(1, id);
            update.executeUpdate();

            // Gửi mail thông báo
            String mailContent = String.format(
                    "Xin chào %s,\n\n" + "Yêu cầu rút tiền của bạn đã được duyệt!\n\n"
                            + "Chi tiết:\n" + "  Số tiền: %s VND\n" + "  Ngân hàng: %s\n"
                            + "  Số tài khoản: %s\n" + "  Chủ tài khoản: %s\n\n"
                            + "Tiền sẽ được chuyển trong vòng 24 giờ làm việc.\n\n"
                            + "Trân trọng,\n📚 Treetopix System",
                    fullName, amount.toPlainString(), bankName, accountNumber, accountHolder);
            mailService.sendMail(email, "✅ Yêu cầu rút tiền đã được duyệt", mailContent);

            return ResponseEntity.ok(Map.of("message", "Đã duyệt và gửi thông báo!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // Từ chối → hoàn tiền lại ví author
    @PutMapping("/withdraw-requests/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);

            String getSql =
                    "SELECT user_id, amount FROM withdraw_requests WHERE id = ? AND status = 'PENDING'";
            PreparedStatement get = conn.prepareStatement(getSql);
            get.setInt(1, id);
            ResultSet rs = get.executeQuery();
            if (!rs.next())
                return ResponseEntity.badRequest().body("Không tìm thấy yêu cầu!");

            int userId = rs.getInt("user_id");
            BigDecimal amount = rs.getBigDecimal("amount");

            // Hoàn tiền lại ví author
            String refundSql = "UPDATE wallets SET balance = balance + ? WHERE user_id = ?";
            PreparedStatement refund = conn.prepareStatement(refundSql);
            refund.setBigDecimal(1, amount);
            refund.setInt(2, userId);
            refund.executeUpdate();

            // Cập nhật status
            String updateSql = "UPDATE withdraw_requests SET status = 'REJECTED' WHERE id = ?";
            PreparedStatement update = conn.prepareStatement(updateSql);
            update.setInt(1, id);
            update.executeUpdate();

            return ResponseEntity.ok(Map.of("message", "Đã từ chối và hoàn tiền!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
