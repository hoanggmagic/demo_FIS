package com.example.DAO;

import com.example.Entities.Book;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BookDAO {
    private Connection connection;

    public BookDAO(Connection connection) {
        this.connection = connection;
    }

    // Lấy tất cả sách
    public List<Book> getAllBooks() throws SQLException {
        List<Book> books = new ArrayList<>();
        String query = "SELECT id, title, published_year, author_id FROM books";
        
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                Book book = new Book(
                    rs.getInt("id"),
                    rs.getString("title"),
                    rs.getInt("published_year"),
                    rs.getInt("author_id")
                );
                books.add(book);
            }
        }
        return books;
    }

    // Lấy sách theo ID
    public Book getBookById(int id) throws SQLException {
        String query = "SELECT id, title, published_year, author_id FROM books WHERE id = ?";
        
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return new Book(
                        rs.getInt("id"),
                        rs.getString("title"),
                        rs.getInt("published_year"),
                        rs.getInt("author_id")
                    );
                }
            }
        }
        return null;
    }

    // Lấy sách theo tiêu đề (tìm kiếm)
    public List<Book> searchBookByTitle(String title) throws SQLException {
        List<Book> books = new ArrayList<>();
        String query = "SELECT id, title, published_year, author_id FROM books WHERE title ILIKE ?";
        
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, "%" + title + "%");
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Book book = new Book(
                        rs.getInt("id"),
                        rs.getString("title"),
                        rs.getInt("published_year"),
                        rs.getInt("author_id")
                    );
                    books.add(book);
                }
            }
        }
        return books;
    }

    // Thêm sách mới
    public void insertBook(Book book) throws SQLException {
        String query = "INSERT INTO books (title, published_year, author_id) VALUES (?, ?, ?)";
        
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, book.getTitle());
            pstmt.setInt(2, book.getPublishedYear());
            pstmt.setInt(3, book.getAuthorId());
            pstmt.executeUpdate();
            System.out.println("✓ Thêm sách: " + book.getTitle());
        }
    }

    // Cập nhật sách
    public void updateBook(Book book) throws SQLException {
        String query = "UPDATE books SET title = ?, published_year = ?, author_id = ? WHERE id = ?";
        
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, book.getTitle());
            pstmt.setInt(2, book.getPublishedYear());
            pstmt.setInt(3, book.getAuthorId());
            pstmt.setInt(4, book.getId());
            pstmt.executeUpdate();
            System.out.println("✓ Cập nhật sách: " + book.getTitle());
        }
    }

    // Xóa sách
    public void deleteBook(int id) throws SQLException {
        String query = "DELETE FROM books WHERE id = ?";
        
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            pstmt.executeUpdate();
            System.out.println("✓ Xóa sách ID: " + id);
        }
    }

    // Lấy tất cả sách kèm tác giả
    public List<String> getAllBooksWithAuthors() throws SQLException {
        List<String> results = new ArrayList<>();
        String query = "SELECT b.id, b.title, a.author_name FROM books b " +
                       "JOIN authors a ON b.author_id = a.id";
        
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                String result = String.format("ID: %d | Sách: %s | Tác giả: %s",
                    rs.getInt("id"),
                    rs.getString("title"),
                    rs.getString("author_name")
                );
                results.add(result);
            }
        }
        return results;
    }
}
