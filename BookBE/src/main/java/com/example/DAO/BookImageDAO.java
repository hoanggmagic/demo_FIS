package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class BookImageDAO {

    private final Connection connection;

    public BookImageDAO(Connection connection) {
        this.connection = connection;
    }

    // insert 1 ảnh
    public void insertImage(int bookId, String url) throws SQLException {
        String sql = "INSERT INTO book_images(book_id, image_url) VALUES (?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, bookId);
            ps.setString(2, url);
            ps.executeUpdate();
        }
    }

    // lấy list ảnh theo book
    public List<String> getImagesByBookId(int bookId) throws SQLException {
        List<String> list = new ArrayList<>();

        String sql = "SELECT image_url FROM book_images WHERE book_id = ?";

        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, bookId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(rs.getString("image_url"));
            }
        }
        return list;
    }

    public void deleteByBookId(int bookId) throws SQLException {
        String sql = "DELETE FROM book_images WHERE book_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, bookId);
            ps.executeUpdate();
        }
    }
}
