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

    // Thêm method getBooksByCategory sau getAllBooks()
    public List<Book> searchBooksByCategory(String keyword, Integer categoryId, AuthContext ctx)
            throws SQLException {

        List<Book> books = new ArrayList<>();

        String query = "SELECT b.id, b.title, b.description, b.published_year, "
                + "b.quantity, b.author_id, b.status, " + "u.full_name AS author_name, "
                + "bp.price, " + "c.id AS category_id, " + "c.name AS category_name "
                + "FROM books b " + "LEFT JOIN users u ON b.author_id = u.id "
                + "LEFT JOIN book_prices bp ON b.id = bp.book_id "
                + "LEFT JOIN categories c ON b.category_id = c.id " + "WHERE (b.category_id = ? "
                + "OR b.category_id IN ( " + "    SELECT id FROM categories WHERE parent_id = ? "
                + ")) " + "AND b.title ILIKE ? ";

        // Author chỉ xem sách mình
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

    public List<Book> getAllBooks() throws SQLException {
        List<Book> books = new ArrayList<>();

        String query = "SELECT b.id, b.title, b.description, b.published_year, b.quantity, "
                + "b.author_id, b.status, " + "u.full_name AS author_name, " + "bp.price, "
                + "c.id AS category_id, " + "c.name AS category_name " + "FROM books b "
                + "LEFT JOIN users u ON b.author_id = u.id "
                + "LEFT JOIN book_prices bp ON b.id = bp.book_id "
                + "LEFT JOIN categories c ON b.category_id = c.id " + "ORDER BY b.id";

        try (Statement stmt = connection.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                books.add(mapBookRow(rs, true));
            }
        }

        return books;
    }

    public List<Book> getBooksByCategory(int categoryId, AuthContext ctx) throws SQLException {

        List<Book> books = new ArrayList<>();

        String query = "SELECT b.id, b.title, b.description, b.published_year, "
                + "b.quantity, b.author_id, b.status, " + "u.full_name AS author_name, "
                + "bp.price, " + "c.id AS category_id, " + "c.name AS category_name "
                + "FROM books b " + "LEFT JOIN users u ON b.author_id = u.id "
                + "LEFT JOIN book_prices bp ON b.id = bp.book_id "
                + "LEFT JOIN categories c ON b.category_id = c.id " + "WHERE (b.category_id = ? "
                + "OR b.category_id IN ( " + "    SELECT id FROM categories WHERE parent_id = ? "
                + ")) ";

        // Author chỉ xem sách của mình
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

    public Book getBookById(int id) throws SQLException {
        String query = "SELECT b.id, b.title, b.description, b.published_year, b.quantity, "
                + "b.author_id, b.status, u.full_name AS author_name, bp.price, "
                + "c.id AS category_id, c.name AS category_name " // ← thêm
                + "FROM books b " + "LEFT JOIN users u ON b.author_id = u.id "
                + "LEFT JOIN book_prices bp ON b.id = bp.book_id "
                + "LEFT JOIN categories c ON b.category_id = c.id " // ← thêm
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
                + "b.author_id, b.status, " + "u.full_name AS author_name, " + "bp.price, "
                + "c.id AS category_id, " + "c.name AS category_name " + "FROM books b "
                + "LEFT JOIN users u ON b.author_id = u.id "
                + "LEFT JOIN book_prices bp ON b.id = bp.book_id "
                + "LEFT JOIN categories c ON b.category_id = c.id " + "WHERE b.title ILIKE ? "
                + "ORDER BY b.id";

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

        String query =
                "INSERT INTO books (title, description, published_year, quantity, author_id, category_id, status) "
                        + "VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, 'ACTIVE')) RETURNING id";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {

            pstmt.setString(1, book.getTitle());
            pstmt.setString(2, book.getDescription());
            pstmt.setInt(3, book.getPublishedYear());
            pstmt.setInt(4, book.getQuantity());
            pstmt.setInt(5, book.getAuthorId());

            // category_id
            if (book.getCategory() != null) {
                pstmt.setInt(6, book.getCategory().getId());
            } else {
                pstmt.setNull(6, java.sql.Types.INTEGER);
            }

            // status
            pstmt.setString(7, book.getStatus() != null ? book.getStatus() : "ACTIVE");

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
                + "category_id = ?, " // ← thêm
                + "updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, book.getTitle());
            pstmt.setString(2, book.getDescription());
            pstmt.setInt(3, book.getPublishedYear());
            pstmt.setInt(4, book.getQuantity());
            pstmt.setInt(5, book.getAuthorId());
            pstmt.setString(6, book.getStatus());
            // category_id
            if (book.getCategory() != null) {
                pstmt.setInt(7, book.getCategory().getId());
            } else {
                pstmt.setNull(7, java.sql.Types.INTEGER);
            }
            pstmt.setInt(8, book.getId()); // ← đổi từ 7 thành 8
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
        book.setQuantity(rs.getInt("quantity"));
        book.setStatus(rs.getString("status"));

        if (withJoins) {

            book.setAuthorName(rs.getString("author_name"));
            book.setPrice(rs.getDouble("price"));

            // CATEGORY
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
