package com.example.DAO;

import com.example.Entities.Book;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class BookDAO {
    private final Connection connection;

    public BookDAO(Connection connection) {
        this.connection = connection;
    }

    public List<Book> getBooksByAuthorId(int authorId) throws SQLException {
        List<Book> books = new ArrayList<>();
        String query = "SELECT b.id, b.title, b.description, b.published_year, b.quantity, "
                + "b.author_id, b.status, u.full_name AS author_name, bp.price "
                + "FROM books b "
                + "LEFT JOIN users u ON b.author_id = u.id "
                + "LEFT JOIN book_prices bp ON b.id = bp.book_id "
                + "WHERE b.author_id = ? ORDER BY b.id";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, authorId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    books.add(mapBookRow(rs, true));
                }
            }
        }
        return books;
    }

    public boolean isOwnedByAuthor(int bookId, int authorId) throws SQLException {
        String query = "SELECT 1 FROM books WHERE id = ? AND author_id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, bookId);
            pstmt.setInt(2, authorId);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        }
    }

    public List<Book> getAllBooks() throws SQLException {
        List<Book> books = new ArrayList<>();
        String query = "SELECT b.id, b.title, b.description, b.published_year, b.quantity, "
                + "b.author_id, b.status, u.full_name AS author_name, bp.price "
                + "FROM books b "
                + "LEFT JOIN users u ON b.author_id = u.id "
                + "LEFT JOIN book_prices bp ON b.id = bp.book_id "
                + "ORDER BY b.id";

        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                books.add(mapBookRow(rs, true));
            }
        }
        return books;
    }

    public Book getBookById(int id) throws SQLException {
        String query = "SELECT b.id, b.title, b.description, b.published_year, b.quantity, "
                + "b.author_id, b.status, u.full_name AS author_name, bp.price "
                + "FROM books b "
                + "LEFT JOIN users u ON b.author_id = u.id "
                + "LEFT JOIN book_prices bp ON b.id = bp.book_id "
                + "WHERE b.id = ?";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapBookRow(rs, true);
                }
            }
        }
        return null;
    }

    public List<Book> searchBookByTitle(String title) throws SQLException {
        List<Book> books = new ArrayList<>();
        String query = "SELECT b.id, b.title, b.description, b.published_year, b.quantity, "
                + "b.author_id, b.status, u.full_name AS author_name, bp.price "
                + "FROM books b "
                + "LEFT JOIN users u ON b.author_id = u.id "
                + "LEFT JOIN book_prices bp ON b.id = bp.book_id "
                + "WHERE b.title ILIKE ? ORDER BY b.id";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, "%" + title + "%");
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    books.add(mapBookRow(rs, true));
                }
            }
        }
        return books;
    }

    public int insertBook(Book book) throws SQLException {
        String query = "INSERT INTO books (title, description, published_year, quantity, author_id, status) "
                + "VALUES (?, ?, ?, ?, ?, COALESCE(?, 'ACTIVE')) RETURNING id";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, book.getTitle());
            pstmt.setString(2, book.getDescription());
            pstmt.setInt(3, book.getPublishedYear());
            pstmt.setInt(4, book.getQuantity());
            pstmt.setInt(5, book.getAuthorId());
            pstmt.setString(6, book.getStatus() != null ? book.getStatus() : "ACTIVE");

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }
        throw new SQLException("Không lấy được id sách vừa thêm");
    }

    public void updateBook(Book book) throws SQLException {
        String query = "UPDATE books SET title = ?, description = ?, published_year = ?, "
                + "quantity = ?, author_id = ?, status = COALESCE(?, status), "
                + "updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, book.getTitle());
            pstmt.setString(2, book.getDescription());
            pstmt.setInt(3, book.getPublishedYear());
            pstmt.setInt(4, book.getQuantity());
            pstmt.setInt(5, book.getAuthorId());
            pstmt.setString(6, book.getStatus());
            pstmt.setInt(7, book.getId());
            pstmt.executeUpdate();
        }
    }

    public void deleteBook(int id) throws SQLException {
        String query = "DELETE FROM books WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            pstmt.executeUpdate();
        }
    }

    public List<String> getAllBooksWithAuthors() throws SQLException {
        List<String> results = new ArrayList<>();
        String query = "SELECT b.id, b.title, u.full_name AS author_name "
                + "FROM books b JOIN users u ON b.author_id = u.id WHERE u.role = 'AUTHOR'";

        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                results.add(String.format("ID: %d | Sách: %s | Tác giả: %s",
                        rs.getInt("id"),
                        rs.getString("title"),
                        rs.getString("author_name")));
            }
        }
        return results;
    }

    private Book mapBookRow(ResultSet rs, boolean withJoins) throws SQLException {
        Book book = new Book(
                rs.getInt("id"),
                rs.getString("title"),
                rs.getInt("published_year"),
                rs.getInt("author_id"));
        book.setDescription(rs.getString("description"));
        book.setQuantity(rs.getInt("quantity"));
        book.setStatus(rs.getString("status"));
        if (withJoins) {
            book.setAuthorName(rs.getString("author_name"));
            book.setPrice(rs.getDouble("price"));
        }
        return book;
    }
}
