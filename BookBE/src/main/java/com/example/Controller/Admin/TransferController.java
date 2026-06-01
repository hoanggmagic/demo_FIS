package com.example.Controller.Admin;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
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
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/transfers")
@CrossOrigin("*")
public class TransferController {

    @Autowired
    private DataSource dataSource;

    // GET — lịch sử điều chuyển
    @GetMapping
    public ResponseEntity<?> getAll(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            PreparedStatement ps = conn.prepareStatement("""
                        SELECT t.id, t.book_id, t.from_branch_id, t.to_branch_id,
                               t.quantity, t.note, t.created_at,
                               b.title as book_title,
                               br1.name as from_branch_name,
                               br2.name as to_branch_name
                        FROM transfers t
                        JOIN books b ON b.id = t.book_id
                        JOIN branches br1 ON br1.id = t.from_branch_id
                        JOIN branches br2 ON br2.id = t.to_branch_id
                        ORDER BY t.created_at DESC
                    """);
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("bookId", rs.getInt("book_id"));
                row.put("bookTitle", rs.getString("book_title"));
                row.put("fromBranchId", rs.getInt("from_branch_id"));
                row.put("fromBranchName", rs.getString("from_branch_name"));
                row.put("toBranchId", rs.getInt("to_branch_id"));
                row.put("toBranchName", rs.getString("to_branch_name"));
                row.put("quantity", rs.getInt("quantity"));
                row.put("note", rs.getString("note"));
                row.put("createdAt", rs.getTimestamp("created_at"));
                list.add(row);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // POST — tạo phiếu điều chuyển
    // Body: { bookId, fromBranchId, toBranchId, quantity, note }
    @PostMapping
    public ResponseEntity<?> transfer(@RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);

            int bookId = (int) body.get("bookId");
            int fromBranchId = (int) body.get("fromBranchId");
            int toBranchId = (int) body.get("toBranchId");
            int quantity = (int) body.get("quantity");
            String note = (String) body.getOrDefault("note", "");

            if (fromBranchId == toBranchId)
                return ResponseEntity.badRequest()
                        .body("Chi nhánh nguồn và đích không được giống nhau");
            if (quantity <= 0)
                return ResponseEntity.badRequest().body("Số lượng phải lớn hơn 0");

            conn.setAutoCommit(false);
            try {
                // 1. Kiểm tra tồn kho chi nhánh nguồn
                PreparedStatement checkPs = conn.prepareStatement(
                        "SELECT quantity FROM inventories WHERE book_id = ? AND branch_id = ?");
                checkPs.setInt(1, bookId);
                checkPs.setInt(2, fromBranchId);
                ResultSet checkRs = checkPs.executeQuery();
                if (!checkRs.next() || checkRs.getInt("quantity") < quantity) {
                    conn.rollback();
                    return ResponseEntity.badRequest()
                            .body("Chi nhánh nguồn không đủ hàng để điều chuyển");
                }

                // 2. Trừ kho chi nhánh nguồn
                PreparedStatement deductPs = conn.prepareStatement("""
                            UPDATE inventories SET quantity = quantity - ?
                            WHERE book_id = ? AND branch_id = ?
                        """);
                deductPs.setInt(1, quantity);
                deductPs.setInt(2, bookId);
                deductPs.setInt(3, fromBranchId);
                deductPs.executeUpdate();

                // 3. Cộng kho chi nhánh đích (upsert)
                PreparedStatement addPs = conn.prepareStatement("""
                            INSERT INTO inventories (book_id, branch_id, quantity)
                            VALUES (?, ?, ?)
                            ON CONFLICT (book_id, branch_id)
                            DO UPDATE SET quantity = inventories.quantity + ?
                        """);
                addPs.setInt(1, bookId);
                addPs.setInt(2, toBranchId);
                addPs.setInt(3, quantity);
                addPs.setInt(4, quantity);
                addPs.executeUpdate();

                // 4. Ghi log phiếu điều chuyển
                PreparedStatement logPs = conn.prepareStatement(
                        """
                                    INSERT INTO transfers (book_id, from_branch_id, to_branch_id, quantity, note)
                                    VALUES (?, ?, ?, ?, ?)
                                """);
                logPs.setInt(1, bookId);
                logPs.setInt(2, fromBranchId);
                logPs.setInt(3, toBranchId);
                logPs.setInt(4, quantity);
                logPs.setString(5, note);
                logPs.executeUpdate();

                conn.commit();

                Map<String, Object> res = new HashMap<>();
                res.put("message", "Điều chuyển thành công!");
                res.put("bookId", bookId);
                res.put("fromBranchId", fromBranchId);
                res.put("toBranchId", toBranchId);
                res.put("quantity", quantity);
                return ResponseEntity.ok(res);

            } catch (Exception ex) {
                conn.rollback();
                throw ex;
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
