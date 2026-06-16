package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class CartDAO {

    private Connection conn;

    public CartDAO(Connection conn) {
        this.conn = conn;
    }

    // Lấy giỏ hàng theo userId
    public List<Map<String, Object>> getCartByUserId(int userId) throws SQLException {
        List<Map<String, Object>> cart = new ArrayList<>();
        String sql = """
                SELECT c.id,
                       c.book_id,
                       b.title,
                       b.author_id,
                       b.status AS book_status,
                       c.quantity,
                       p.original_price,
                       COALESCE(NULLIF(p.sale_price, 0), p.original_price) AS final_price,
                       c.quantity * COALESCE(NULLIF(p.sale_price, 0), p.original_price) AS subtotal,
                       COALESCE(i.quantity, 0) AS stock,
                       c.branch_id,
                       br.name AS branch_name,
                       br.status AS branch_status
                FROM cart c
                JOIN books b ON c.book_id = b.id
                JOIN book_prices p ON b.id = p.book_id
                LEFT JOIN branches br ON br.id = c.branch_id
                LEFT JOIN inventories i ON i.book_id = c.book_id AND i.branch_id = c.branch_id
                WHERE c.user_id = ?
                """;
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("cartItemId", rs.getInt("id"));
                    item.put("bookId", rs.getInt("book_id"));
                    item.put("title", rs.getString("title"));
                    item.put("quantity", rs.getInt("quantity"));
                    item.put("price", rs.getDouble("final_price"));
                    item.put("originalPrice", rs.getDouble("original_price"));
                    item.put("subtotal", rs.getDouble("subtotal"));
                    item.put("stock", rs.getInt("stock"));
                    item.put("branchId", rs.getInt("branch_id"));
                    item.put("branchName", rs.getString("branch_name"));
                    item.put("branchStatus", rs.getString("branch_status"));
                    item.put("bookStatus", rs.getString("book_status"));
                    cart.add(item);
                }
            }
        }
        return cart;
    }

    public void addToCart(int userId, int bookId, int quantity, int branchId) throws SQLException {
        String checkSql =
                "SELECT id, quantity FROM cart WHERE user_id = ? AND book_id = ? AND branch_id = ?";
        // SỬA ①: try-with-resources cho cả hai statement
        try (PreparedStatement check = conn.prepareStatement(checkSql)) {
            check.setInt(1, userId);
            check.setInt(2, bookId);
            check.setInt(3, branchId);
            try (ResultSet rs = check.executeQuery()) {
                if (rs.next()) {
                    int newQty = rs.getInt("quantity") + quantity;
                    try (PreparedStatement update =
                            conn.prepareStatement("UPDATE cart SET quantity = ? WHERE id = ?")) {
                        update.setInt(1, newQty);
                        update.setInt(2, rs.getInt("id"));
                        update.executeUpdate();
                    }
                } else {
                    try (PreparedStatement insert = conn.prepareStatement(
                            "INSERT INTO cart (user_id, book_id, quantity, branch_id) VALUES (?, ?, ?, ?)")) {
                        insert.setInt(1, userId);
                        insert.setInt(2, bookId);
                        insert.setInt(3, quantity);
                        insert.setInt(4, branchId); // SỬA ④: branchId luôn được set rõ ràng
                        insert.executeUpdate();
                    }
                }
            }
        }
    }

    // Áp dụng try-with-resources tương tự cho updateQuantity, removeFromCart, clearCart
    public void updateQuantity(int cartItemId, int userId, int quantity) throws SQLException {
        try (PreparedStatement stmt = conn
                .prepareStatement("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?")) {
            stmt.setInt(1, quantity);
            stmt.setInt(2, cartItemId);
            stmt.setInt(3, userId);
            stmt.executeUpdate();
        }
    }

    public void removeFromCart(int cartItemId, int userId) throws SQLException {
        try (PreparedStatement stmt =
                conn.prepareStatement("DELETE FROM cart WHERE id = ? AND user_id = ?")) {
            stmt.setInt(1, cartItemId);
            stmt.setInt(2, userId);
            stmt.executeUpdate();
        }
    }

    public void clearCart(int userId) throws SQLException {
        try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM cart WHERE user_id = ?")) {
            stmt.setInt(1, userId);
            stmt.executeUpdate();
        }
    }

    public boolean hasInactiveBooks(int userId) throws SQLException {
        String sql = """
                SELECT COUNT(*) AS cnt
                FROM cart c
                JOIN books b ON c.book_id = b.id
                WHERE c.user_id = ? AND b.status != 'ACTIVE'
                """;
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next())
                    return rs.getInt("cnt") > 0;
            }
        }
        return false;
    }

    public void updateBranch(int cartItemId, int userId, int newBranchId) throws SQLException {
        // Lấy thông tin item hiện tại
        int bookId, quantity;
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT book_id, quantity FROM cart WHERE id = ? AND user_id = ?")) {
            ps.setInt(1, cartItemId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next())
                    throw new SQLException("Không tìm thấy sản phẩm trong giỏ");
                bookId = rs.getInt("book_id");
                quantity = rs.getInt("quantity");
            }
        }

        // Tồn kho ở chi nhánh mới
        int stock = 0;
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT quantity FROM inventories WHERE book_id = ? AND branch_id = ?")) {
            ps.setInt(1, bookId);
            ps.setInt(2, newBranchId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next())
                    stock = rs.getInt("quantity");
            }
        }
        int finalQty = Math.min(quantity, Math.max(stock, 0));

        // Kiểm tra đã có dòng cùng book_id + branch_id mới chưa
        Integer existingId = null;
        int existingQty = 0;
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT id, quantity FROM cart WHERE user_id = ? AND book_id = ? AND branch_id = ? AND id != ?")) {
            ps.setInt(1, userId);
            ps.setInt(2, bookId);
            ps.setInt(3, newBranchId);
            ps.setInt(4, cartItemId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    existingId = rs.getInt("id");
                    existingQty = rs.getInt("quantity");
                }
            }
        }

        if (existingId != null) {
            // Gộp vào dòng đã tồn tại, giới hạn theo tồn kho, xóa dòng cũ
            int mergedQty = Math.min(existingQty + finalQty, Math.max(stock, 0));
            try (PreparedStatement update =
                    conn.prepareStatement("UPDATE cart SET quantity = ? WHERE id = ?")) {
                update.setInt(1, mergedQty);
                update.setInt(2, existingId);
                update.executeUpdate();
            }
            try (PreparedStatement delete =
                    conn.prepareStatement("DELETE FROM cart WHERE id = ?")) {
                delete.setInt(1, cartItemId);
                delete.executeUpdate();
            }
        } else {
            // Không trùng, đổi branch + cập nhật quantity cho item hiện tại
            try (PreparedStatement update = conn.prepareStatement(
                    "UPDATE cart SET branch_id = ?, quantity = ? WHERE id = ? AND user_id = ?")) {
                update.setInt(1, newBranchId);
                update.setInt(2, Math.max(finalQty, 1));
                update.setInt(3, cartItemId);
                update.setInt(4, userId);
                update.executeUpdate();
            }
        }
    }

}
