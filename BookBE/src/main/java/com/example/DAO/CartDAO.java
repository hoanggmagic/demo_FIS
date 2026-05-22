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
                    SELECT c.id, c.book_id, b.title, b.author_id, c.quantity, p.price,
                           (c.quantity * p.price) AS subtotal
                    FROM cart c
                    JOIN books b ON c.book_id = b.id
                    JOIN book_prices p ON b.id = p.book_id
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
            cart.add(item);
        }
        return cart;
    }

    // Thêm sách vào giỏ (nếu đã có thì tăng quantity)
    public void addToCart(int userId, int bookId, int quantity) throws SQLException {
        String checkSql = "SELECT id, quantity FROM cart WHERE user_id = ? AND book_id = ?";
        PreparedStatement check = conn.prepareStatement(checkSql);
        check.setInt(1, userId);
        check.setInt(2, bookId);
        ResultSet rs = check.executeQuery();

        if (rs.next()) {
            // Đã có → cập nhật quantity
            int newQty = rs.getInt("quantity") + quantity;
            String updateSql = "UPDATE cart SET quantity = ? WHERE id = ?";
            PreparedStatement update = conn.prepareStatement(updateSql);
            update.setInt(1, newQty);
            update.setInt(2, rs.getInt("id"));
            update.executeUpdate();
        } else {
            // Chưa có → thêm mới
            String insertSql = "INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, ?)";
            PreparedStatement insert = conn.prepareStatement(insertSql);
            insert.setInt(1, userId);
            insert.setInt(2, bookId);
            insert.setInt(3, quantity);
            insert.executeUpdate();
        }
    }

    // Cập nhật số lượng
    public void updateQuantity(int cartItemId, int userId, int quantity) throws SQLException {
        String sql = "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?";
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setInt(1, quantity);
        stmt.setInt(2, cartItemId);
        stmt.setInt(3, userId);
        stmt.executeUpdate();
    }

    // Xóa 1 sách khỏi giỏ
    public void removeFromCart(int cartItemId, int userId) throws SQLException {
        String sql = "DELETE FROM cart WHERE id = ? AND user_id = ?";
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setInt(1, cartItemId);
        stmt.setInt(2, userId);
        stmt.executeUpdate();
    }

    // Xóa toàn bộ giỏ hàng
    public void clearCart(int userId) throws SQLException {
        String sql = "DELETE FROM cart WHERE user_id = ?";
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setInt(1, userId);
        stmt.executeUpdate();
    }
}
