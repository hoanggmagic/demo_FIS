package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import com.example.Entities.Book;
import com.example.Entities.Category;
import com.example.Util.AuthContext;

public class BookDAO {
    private final Connection connection;

    public BookDAO(Connection connection) {
        this.connection = connection;
    }

    private static final String QUANTITY_SUBQUERY =
            "COALESCE((SELECT SUM(i.quantity) FROM inventories i WHERE i.book_id = b.id), 0) AS quantity";

    private static final String BASE_SELECT =
            "SELECT b.id, b.title, b.description, b.published_year, " + QUANTITY_SUBQUERY + ", "
                    + "b.author_id, b.status, " + "u.full_name AS author_name, " + "bp.price, "
                    + "c.id AS category_id, " + "c.name AS category_name " + "FROM books b "
                    + "LEFT JOIN users u ON b.author_id = u.id "
                    + "LEFT JOIN book_prices bp ON b.id = bp.book_id "
                    + "LEFT JOIN categories c ON b.category_id = c.id ";

    public List<Book> getAllBooks() throws SQLException {
        List<Book> books = new ArrayList<>();
        String query = BASE_SELECT + "ORDER BY b.id";
        try (Statement stmt = connection.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                books.add(mapBookRow(rs, true));
            }
        }
        return books;
    }

    public Book getBookById(int id) throws SQLException {
        String query = BASE_SELECT + "WHERE b.id = ?";
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
        String query = BASE_SELECT + "WHERE b.title ILIKE ? ORDER BY b.id";
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

    public List<Book> getBooksByCategory(int categoryId, AuthContext ctx) throws SQLException {
        List<Book> books = new ArrayList<>();
        String query = BASE_SELECT + "WHERE (b.category_id = ? "
                + "OR b.category_id IN (SELECT id FROM categories WHERE parent_id = ?)) ";
        if (ctx != null && ctx.isAuthor()) {
            query += "AND b.author_id = ? ";
        }
        query += "ORDER BY b.id";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, categoryId);
            pstmt.setInt(2, categoryId);
            if (ctx != null && ctx.isAuthor()) {
                pstmt.setInt(3, ctx.getUserId());
            }
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    books.add(mapBookRow(rs, true));
                }
            }
        }
        return books;
    }

    public List<Book> searchBooksByCategory(String keyword, Integer categoryId, AuthContext ctx)
            throws SQLException {
        List<Book> books = new ArrayList<>();
        String query = BASE_SELECT + "WHERE (b.category_id = ? "
                + "OR b.category_id IN (SELECT id FROM categories WHERE parent_id = ?)) "
                + "AND b.title ILIKE ? ";
        if (ctx != null && ctx.isAuthor()) {
            query += "AND b.author_id = ? ";
        }
        query += "ORDER BY b.id";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, categoryId);
            pstmt.setInt(2, categoryId);
            pstmt.setString(3, "%" + keyword + "%");
            if (ctx != null && ctx.isAuthor()) {
                pstmt.setInt(4, ctx.getUserId());
            }
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

    public int insertBook(Book book) throws SQLException {
        String query =
                "INSERT INTO books (title, description, published_year, author_id, category_id, status) "
                        + "VALUES (?, ?, ?, ?, ?, COALESCE(?, 'ACTIVE')) RETURNING id";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, book.getTitle());
            pstmt.setString(2, book.getDescription());
            pstmt.setInt(3, book.getPublishedYear());
            pstmt.setInt(4, book.getAuthorId());
            if (book.getCategory() != null) {
                pstmt.setInt(5, book.getCategory().getId());
            } else {
                pstmt.setNull(5, java.sql.Types.INTEGER);
            }
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
                + "author_id = ?, status = COALESCE(?, status), "
                + "category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, book.getTitle());
            pstmt.setString(2, book.getDescription());
            pstmt.setInt(3, book.getPublishedYear());
            pstmt.setInt(4, book.getAuthorId());
            pstmt.setString(5, book.getStatus());
            if (book.getCategory() != null) {
                pstmt.setInt(6, book.getCategory().getId());
            } else {
                pstmt.setNull(6, java.sql.Types.INTEGER);
            }
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
        String query = BASE_SELECT + "ORDER BY b.id";
        try (Statement stmt = connection.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                results.add(String.format("ID: %d | Sách: %s | Tác giả: %s", rs.getInt("id"),
                        rs.getString("title"), rs.getString("author_name")));
            }
        }
        return results;
    }

    private Book mapBookRow(ResultSet rs, boolean withJoins) throws SQLException {
        Book book = new Book(rs.getInt("id"), rs.getString("title"), rs.getInt("published_year"),
                rs.getInt("author_id"));
        book.setDescription(rs.getString("description"));
        book.setQuantity(rs.getInt("quantity")); // ← lấy từ inventories subquery
        book.setStatus(rs.getString("status"));
        if (withJoins) {
            book.setAuthorName(rs.getString("author_name"));
            book.setPrice(rs.getDouble("price"));
            int categoryId = rs.getInt("category_id");
            if (!rs.wasNull()) {
                Category category = new Category();
                category.setId(categoryId);
                category.setName(rs.getString("category_name"));
                book.setCategory(category);
            }
        }
        return book;
    }
}
