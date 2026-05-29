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

    // Lấy giỏ hàng theo userId — thêm branch_id, branch_name
    public List<Map<String, Object>> getCartByUserId(int userId) throws SQLException {
        List<Map<String, Object>> cart = new ArrayList<>();
        String sql = """
                    SELECT c.id, c.book_id, b.title, b.author_id,
                           c.quantity, p.price,
                           (c.quantity * p.price) AS subtotal,
                           b.quantity AS stock,
                           c.branch_id,
                           br.name AS branch_name
                    FROM cart c
                    JOIN books b ON c.book_id = b.id
                    JOIN book_prices p ON b.id = p.book_id
                    LEFT JOIN branches br ON br.id = c.branch_id
                    WHERE c.user_id = ?
                """;
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setInt(1, userId);
        ResultSet rs = stmt.executeQuery();
        while (rs.next()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("cartItemId", rs.getInt("id"));
            item.put("bookId", rs.getInt("book_id"));
            item.put("title", rs.getString("title"));
            item.put("quantity", rs.getInt("quantity"));
            item.put("price", rs.getDouble("price"));
            item.put("subtotal", rs.getDouble("subtotal"));
            item.put("stock", rs.getInt("stock"));
            item.put("branchId", rs.getInt("branch_id"));
            item.put("branchName", rs.getString("branch_name"));
            cart.add(item);
        }
        return cart;
    }

    // Thêm sách vào giỏ (nếu đã có cùng book + branch thì tăng quantity)
    public void addToCart(int userId, int bookId, int quantity, int branchId) throws SQLException {
        String checkSql = """
                    SELECT id, quantity FROM cart
                    WHERE user_id = ? AND book_id = ? AND branch_id = ?
                """;
        PreparedStatement check = conn.prepareStatement(checkSql);
        check.setInt(1, userId);
        check.setInt(2, bookId);
        check.setInt(3, branchId);
        ResultSet rs = check.executeQuery();

        if (rs.next()) {
            // Đã có cùng sách + chi nhánh → tăng quantity
            int newQty = rs.getInt("quantity") + quantity;
            PreparedStatement update =
                    conn.prepareStatement("UPDATE cart SET quantity = ? WHERE id = ?");
            update.setInt(1, newQty);
            update.setInt(2, rs.getInt("id"));
            update.executeUpdate();
        } else {
            // Chưa có → thêm mới
            PreparedStatement insert = conn.prepareStatement(
                    "INSERT INTO cart (user_id, book_id, quantity, branch_id) VALUES (?, ?, ?, ?)");
            insert.setInt(1, userId);
            insert.setInt(2, bookId);
            insert.setInt(3, quantity);
            insert.setInt(4, branchId);
            insert.executeUpdate();
        }
    }

    // Cập nhật số lượng
    public void updateQuantity(int cartItemId, int userId, int quantity) throws SQLException {
        PreparedStatement stmt =
                conn.prepareStatement("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?");
        stmt.setInt(1, quantity);
        stmt.setInt(2, cartItemId);
        stmt.setInt(3, userId);
        stmt.executeUpdate();
    }

    // Xóa 1 sách khỏi giỏ
    public void removeFromCart(int cartItemId, int userId) throws SQLException {
        PreparedStatement stmt =
                conn.prepareStatement("DELETE FROM cart WHERE id = ? AND user_id = ?");
        stmt.setInt(1, cartItemId);
        stmt.setInt(2, userId);
        stmt.executeUpdate();
    }

    // Xóa toàn bộ giỏ hàng
    public void clearCart(int userId) throws SQLException {
        PreparedStatement stmt = conn.prepareStatement("DELETE FROM cart WHERE user_id = ?");
        stmt.setInt(1, userId);
        stmt.executeUpdate();
    }
}
