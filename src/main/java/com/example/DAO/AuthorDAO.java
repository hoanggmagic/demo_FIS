package com.example.DAO;

import com.example.Entities.Author;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AuthorDAO {
    private Connection connection;

    public AuthorDAO(Connection connection) {
        this.connection = connection;
    }

    // Lấy tất cả tác giả
    public List<Author> getAllAuthors() throws SQLException {
        List<Author> authors = new ArrayList<>();
        String query = "SELECT id, author_name, nationality FROM authors";
        
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                Author author = new Author(
                    rs.getInt("id"),
                    rs.getString("author_name"),
                    rs.getString("nationality")
                );
                authors.add(author);
            }
        }
        return authors;
    }

    // Lấy tác giả theo ID
    public Author getAuthorById(int id) throws SQLException {
        String query = "SELECT id, author_name, nationality FROM authors WHERE id = ?";
        
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return new Author(
                        rs.getInt("id"),
                        rs.getString("author_name"),
                        rs.getString("nationality")
                    );
                }
            }
        }
        return null;
    }

    // Thêm tác giả mới
    public void insertAuthor(Author author) throws SQLException {
        String query = "INSERT INTO authors (author_name, nationality) VALUES (?, ?)";
        
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, author.getAuthorName());
            pstmt.setString(2, author.getNationality());
            pstmt.executeUpdate();
            System.out.println("✓ Thêm tác giả: " + author.getAuthorName());
        }
    }

    // Cập nhật tác giả
    public void updateAuthor(Author author) throws SQLException {
        String query = "UPDATE authors SET author_name = ?, nationality = ? WHERE id = ?";
        
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, author.getAuthorName());
            pstmt.setString(2, author.getNationality());
            pstmt.setInt(3, author.getId());
            pstmt.executeUpdate();
            System.out.println("✓ Cập nhật tác giả: " + author.getAuthorName());
        }
    }

    // Xóa tác giả
    public void deleteAuthor(int id) throws SQLException {
        String query = "DELETE FROM authors WHERE id = ?";
        
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            System.out.println("✓ Xóa tác giả ID: " + id);
        }
    }
}
