package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import com.example.Entities.Transfer;

public class TransferDAO {
    private Connection conn;

    public TransferDAO(Connection conn) {
        this.conn = conn;
    }

    /**
     * Thực hiện chuyển kho: Trừ kho A -> Cộng kho B -> Ghi nhận phiếu chuyển
     */
    public void executeTransfer(Transfer transfer) throws SQLException {
        // Kiểm tra tính hợp lệ cơ bản
        if (transfer.getQuantity() <= 0) {
            throw new IllegalArgumentException("Số lượng chuyển phải lớn hơn 0");
        }
        if (transfer.getFromBranchId() == transfer.getToBranchId()) {
            throw new IllegalArgumentException("Chi nhánh gửi và nhận không được trùng nhau");
        }

        boolean originalAutoCommit = conn.getAutoCommit();
        try {
            // Tắt auto-commit để bắt đầu một Transaction quản lý đồng bộ
            conn.setAutoCommit(false);

            // 1. Kiểm tra số lượng tồn kho của chi nhánh gửi (from_branch)
            String checkStockSql = "SELECT quantity FROM branch_books WHERE book_id = ? AND branch_id = ?";
            int currentStock = 0;
            try (PreparedStatement stmt = conn.prepareStatement(checkStockSql)) {
                stmt.setInt(1, transfer.getBookId());
                stmt.setInt(2, transfer.getFromBranchId());
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        currentStock = rs.getInt("quantity");
                    } else {
                        throw new SQLException("Sách này không tồn tại trong kho của chi nhánh gửi.");
                    }
                }
            }

            if (currentStock < transfer.getQuantity()) {
                throw new SQLException("Không đủ hàng trong kho! Hiện tại chỉ còn: " + currentStock);
            }

            // 2. TRỪ số lượng ở chi nhánh gửi
            String deductSql = "UPDATE branch_books SET quantity = quantity - ? WHERE book_id = ? AND branch_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(deductSql)) {
                stmt.setInt(1, transfer.getQuantity());
                stmt.setInt(2, transfer.getBookId());
                stmt.setInt(3, transfer.getFromBranchId());
                stmt.executeUpdate();
            }

            // 3. CỘNG số lượng ở chi nhánh nhận (Dùng UPSERT - Nếu chưa có bản ghi thì INSERT, có rồi thì UPDATE)
            String addSql = "INSERT INTO branch_books (book_id, branch_id, quantity) VALUES (?, ?, ?) " +
                            "ON DUPLICATE KEY UPDATE quantity = quantity + ?";
            try (PreparedStatement stmt = conn.prepareStatement(addSql)) {
                stmt.setInt(1, transfer.getBookId());
                stmt.setInt(2, transfer.getToBranchId());
                stmt.setInt(3, transfer.getQuantity());
                stmt.setInt(4, transfer.getQuantity());
                stmt.executeUpdate();
            }

            // 4. Ghi lại thông tin phiếu chuyển vào bảng `transfers`
            String insertTransferSql = "INSERT INTO transfers (book_id, from_branch_id, to_branch_id, quantity, note) VALUES (?, ?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(insertTransferSql)) {
                stmt.setInt(1, transfer.getBookId());
                stmt.setInt(2, transfer.getFromBranchId());
                stmt.setInt(3, transfer.getToBranchId());
                stmt.setInt(4, transfer.getQuantity());
                stmt.setString(5, transfer.getNote());
                stmt.executeUpdate();
            }

            // Mọi thứ hoàn hảo -> Xác nhận lưu thay đổi xuống DB
            conn.commit();

        } catch (SQLException e) {
            // Có bất kỳ lỗi gì xảy ra -> Khôi phục lại trạng thái ban đầu của dữ liệu
            conn.rollback();
            throw e;
        } finally {
            // Trả lại trạng thái auto-commit mặc định
            conn.setAutoCommit(originalAutoCommit);
        }
    }

    /**
     * Lấy danh sách lịch sử chuyển kho (Có JOIN bảng để điền dữ liệu vào các trường @Transient)
     */
    public List<Transfer> getAllTransfers() throws SQLException {
        List<Transfer> list = new ArrayList<>();
        String sql = "SELECT t.*, b.title AS book_title, b1.name AS from_branch_name, b2.name AS to_branch_name " +
                     "FROM transfers t " +
                     "JOIN books b ON t.book_id = b.id " +
                     "JOIN branches b1 ON t.from_branch_id = b1.id " +
                     "JOIN branches b2 ON t.to_branch_id = b2.id " +
                     "ORDER BY t.created_at DESC";

        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Transfer t = new Transfer();
                t.setId(rs.getInt("id"));
                t.setBookId(rs.getInt("book_id"));
                t.setFromBranchId(rs.getInt("from_branch_id"));
                t.setToBranchId(rs.getInt("to_branch_id"));
                t.setQuantity(rs.getInt("quantity"));
                t.setNote(rs.getString("note"));
                t.setCreatedAt(rs.getTimestamp("created_at"));
                
                // Gán dữ liệu cho các trường @Transient hiển thị ở giao diện Frontend
                t.setBookTitle(rs.getString("book_title"));
                t.setFromBranchName(rs.getString("from_branch_name"));
                t.setToBranchName(rs.getString("to_branch_name"));
                
                list.add(t);
            }
        }
        return list;
    }
}