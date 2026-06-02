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
import com.example.Repository.WalletTransactionRepository;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/author/wallet")
@CrossOrigin("*")
public class WalletController {

    @Autowired
    private DataSource dataSource;
    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

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

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            int currentUserId = ctx.getUserId();

            // Câu SQL gốc lấy hết để đối chiếu, không dùng WHERE chặt chẽ nữa
            String sql =
                    """
                                SELECT
                                    wt.id, wt.amount, wt.transaction_type, wt.description, wt.created_at, wt.book_id, wt.user_id,
                                    b.title AS book_name, b.author_id
                                FROM wallet_transactions wt
                                LEFT JOIN books b ON wt.book_id = b.id
                                ORDER BY wt.created_at DESC
                            """;

            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();

            List<Map<String, Object>> list = new ArrayList<>();

            // Map tạm để gom nhóm sách: Key = bookId, Value = Thống kê sách
            Map<Integer, Map<String, Object>> bookGroupMap = new LinkedHashMap<>();

            while (rs.next()) {
                int dbUserId = rs.getInt("user_id");
                int dbAuthorId = rs.getInt("author_id");
                String type = rs.getString("transaction_type");
                int bookId = rs.getInt("book_id");

                // KIỂM TRA ĐIỀU KIỆN 1: Nếu là giao dịch bán sách của tác giả này
                if ("INCOME".equals(type) && bookId > 0 && dbAuthorId == currentUserId) {
                    String bookName = rs.getString("book_name");
                    BigDecimal amount = rs.getBigDecimal("amount");

                    if (!bookGroupMap.containsKey(bookId)) {
                        Map<String, Object> group = new LinkedHashMap<>();
                        group.put("type", "INCOME");
                        group.put("bookName", bookName);
                        group.put("description", "Doanh thu tích lũy sách: " + bookName);
                        group.put("quantity", 1);
                        group.put("amount", amount);
                        group.put("createdAt", rs.getTimestamp("created_at"));
                        bookGroupMap.put(bookId, group);
                    } else {
                        Map<String, Object> group = bookGroupMap.get(bookId);
                        int currentQty = (int) group.get("quantity");
                        BigDecimal currentAmt = (BigDecimal) group.get("amount");

                        group.put("quantity", currentQty + 1);
                        group.put("amount", currentAmt.add(amount));
                    }
                }
                // KIỂM TRA ĐIỀU KIỆN 2: Nếu là giao dịch rút tiền của chính user này
                else if ("WITHDRAW".equals(type) && dbUserId == currentUserId) {
                    Map<String, Object> withdrawRow = new LinkedHashMap<>();
                    withdrawRow.put("type", "WITHDRAW");
                    withdrawRow.put("bookName", null);
                    withdrawRow.put("description", "Yêu cầu rút tiền");
                    withdrawRow.put("quantity", 1);
                    withdrawRow.put("amount", rs.getBigDecimal("amount"));
                    withdrawRow.put("createdAt", rs.getTimestamp("created_at"));
                    list.add(withdrawRow);
                }
            }

            // Đẩy tất cả sách đã gom nhóm vào danh sách trả về
            list.addAll(bookGroupMap.values());

            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi Debug: " + e.getMessage());
        }
    }

    @GetMapping("/income")
    public ResponseEntity<?> getIncome(HttpServletRequest request) {

        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);

            // 1. Tổng doanh thu
            String totalSql = """
                        SELECT COALESCE(SUM(amount), 0) as total
                        FROM wallet_transactions wt
                        JOIN wallets w ON wt.wallet_id = w.id
                        WHERE w.user_id = ? AND wt.transaction_type = 'INCOME'
                    """;

            BigDecimal total = BigDecimal.ZERO;

            try (PreparedStatement ps = conn.prepareStatement(totalSql)) {
                ps.setInt(1, ctx.getUserId());
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    total = rs.getBigDecimal("total");
                }
            }

            // 2. Danh sách giao dịch
            String listSql = """
                        SELECT
                            wt.amount,
                            wt.description,
                            wt.created_at
                        FROM wallet_transactions wt
                        JOIN wallets w ON wt.wallet_id = w.id
                        WHERE w.user_id = ? AND wt.transaction_type = 'INCOME'
                        ORDER BY wt.created_at DESC
                    """;

            List<Map<String, Object>> list = new ArrayList<>();

            try (PreparedStatement ps = conn.prepareStatement(listSql)) {
                ps.setInt(1, ctx.getUserId());
                ResultSet rs = ps.executeQuery();

                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("amount", rs.getBigDecimal("amount"));
                    row.put("description", rs.getString("description"));
                    row.put("createdAt", rs.getTimestamp("created_at"));
                    list.add(row);
                }
            }

            return ResponseEntity.ok(Map.of("total", total, "transactions", list));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // Danh sách doanh thu chi tiết (từng giao dịch)
    @GetMapping("/income/detail")
    public ResponseEntity<?> getIncomeDetail(HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);
            List<Object[]> rows = walletTransactionRepository.findIncomeByUserId(ctx.getUserId());

            List<Map<String, Object>> result = new ArrayList<>();
            for (Object[] row : rows) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", row[0]);
                map.put("amount", row[1]);
                map.put("description", row[2]);
                map.put("createdAt", row[3]);
                map.put("orderId", row[4]);
                map.put("bookId", row[5]);
                map.put("bookTitle", row[6]);
                result.add(map);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // Tổng doanh thu gom theo từng sách
    @GetMapping("/income/by-book")
    public ResponseEntity<?> getIncomeByBook(HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);
            List<Object[]> rows =
                    walletTransactionRepository.findIncomeGroupByBook(ctx.getUserId());

            List<Map<String, Object>> result = new ArrayList<>();
            for (Object[] row : rows) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("bookId", row[0]);
                map.put("bookTitle", row[1]);
                map.put("totalIncome", row[2]);
                map.put("totalOrders", row[3]);
                result.add(map);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
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

            if (amount.compareTo(BigDecimal.valueOf(50000)) < 0) {
                return ResponseEntity.badRequest().body("Số tiền rút tối thiểu 50,000 VND");
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
