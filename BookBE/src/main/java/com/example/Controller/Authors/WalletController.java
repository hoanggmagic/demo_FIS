package com.example.Controller.Authors;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/author/wallet")
@CrossOrigin("*")
public class WalletController {

    @Autowired
    private DataSource dataSource;

    // Xem số dư
    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            String sql = "SELECT balance FROM wallets WHERE user_id = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ctx.getUserId());
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return ResponseEntity.ok(Map.of("balance", rs.getBigDecimal("balance")));
            }
            return ResponseEntity.ok(Map.of("balance", 0));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // Xem lịch sử giao dịch
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            String sql = """
                        SELECT wt.id, wt.amount, wt.transaction_type, wt.description, wt.created_at
                        FROM wallet_transactions wt
                        JOIN wallets w ON wt.wallet_id = w.id
                        WHERE w.user_id = ?
                        ORDER BY wt.created_at DESC
                    """;
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ctx.getUserId());
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("amount", rs.getBigDecimal("amount"));
                row.put("type", rs.getString("transaction_type"));
                row.put("description", rs.getString("description"));
                row.put("createdAt", rs.getTimestamp("created_at"));
                list.add(row);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // Yêu cầu rút tiền
    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            String bankName = (String) body.get("bankName");
            String accountNumber = (String) body.get("accountNumber");
            String accountHolder = (String) body.get("accountHolder");

            if (amount.compareTo(BigDecimal.valueOf(10000)) < 0) {
                return ResponseEntity.badRequest().body("Số tiền rút tối thiểu 10,000 VND");
            }

            // Kiểm tra số dư
            String checkSql = "SELECT balance FROM wallets WHERE user_id = ?";
            PreparedStatement check = conn.prepareStatement(checkSql);
            check.setInt(1, ctx.getUserId());
            ResultSet rs = check.executeQuery();
            if (!rs.next() || rs.getBigDecimal("balance").compareTo(amount) < 0) {
                return ResponseEntity.badRequest().body("Số dư không đủ!");
            }

            // Trừ ví
            String deductSql = "UPDATE wallets SET balance = balance - ? WHERE user_id = ?";
            PreparedStatement deduct = conn.prepareStatement(deductSql);
            deduct.setBigDecimal(1, amount);
            deduct.setInt(2, ctx.getUserId());
            deduct.executeUpdate();

            // Tạo yêu cầu rút
            String insertSql =
                    """
                                INSERT INTO withdraw_requests (user_id, amount, bank_name, account_number, account_holder, status)
                                VALUES (?, ?, ?, ?, ?, 'PENDING')
                            """;
            PreparedStatement insert = conn.prepareStatement(insertSql);
            insert.setInt(1, ctx.getUserId());
            insert.setBigDecimal(2, amount);
            insert.setString(3, bankName);
            insert.setString(4, accountNumber);
            insert.setString(5, accountHolder);
            insert.executeUpdate();

            return ResponseEntity.ok(Map.of("message", "Yêu cầu rút tiền đã được gửi!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // Xem lịch sử rút tiền
    @GetMapping("/withdraw-history")
    public ResponseEntity<?> getWithdrawHistory(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            String sql =
                    """
                                SELECT id, amount, bank_name, account_number, account_holder, status, created_at
                                FROM withdraw_requests WHERE user_id = ?
                                ORDER BY created_at DESC
                            """;
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, ctx.getUserId());
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", rs.getInt("id"));
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
}
