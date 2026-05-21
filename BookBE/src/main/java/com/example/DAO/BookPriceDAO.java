package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class BookPriceDAO {
    private Connection connection;

    public BookPriceDAO(Connection connection) {
        this.connection = connection;
    }

    // Lấy tất cả giá sách
    public List<String> getAllBookPrices() throws SQLException {
        List<String> prices = new ArrayList<>();
        String query =
                "SELECT b.id, b.title, bp.price FROM books b JOIN book_prices bp ON b.id = bp.book_id ORDER BY bp.price DESC";

        try (Statement stmt = connection.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                String price = String.format("Sách: %s | Giá: %.0f", rs.getString("title"),
                        rs.getDouble("price"));
                prices.add(price);
            }
        }
        return prices;
    }

    // Lấy giá sách theo ID sách
    public double getPriceByBookId(int bookId) throws SQLException {
        String query = "SELECT price FROM book_prices WHERE book_id = ?";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, bookId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("price");
                }
            }
        }
        return 0;
    }

    // Thêm giá cho sách mới
    public void insertBookPrice(int bookId, double price) throws SQLException {
        String query = "INSERT INTO book_prices (book_id, price) VALUES (?, ?)";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, bookId);
            pstmt.setDouble(2, price);
            pstmt.executeUpdate();
            System.out.println("✓ Thêm giá sách ID " + bookId + ": " + price + " VND");
        }
    }

    // Cập nhật giá sách
    public void updateBookPrice(int bookId, double price) throws SQLException {
        String query = "UPDATE book_prices SET price = ? WHERE book_id = ?";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setDouble(1, price);
            pstmt.setInt(2, bookId);
            pstmt.executeUpdate();
            System.out.println("✓ Cập nhật giá sách ID " + bookId + ": " + price + " VND");
        }
    }

    // Lấy sách theo khoảng giá
    public List<String> getBooksByPriceRange(double minPrice, double maxPrice) throws SQLException {
        List<String> books = new ArrayList<>();
        String query =
                "SELECT b.id, b.title, bp.price FROM books b JOIN book_prices bp ON b.id = bp.book_id WHERE bp.price BETWEEN ? AND ? ORDER BY bp.price";

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setDouble(1, minPrice);
            pstmt.setDouble(2, maxPrice);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    String book = String.format("Sách: %s | Giá: %.0f", rs.getString("title"),
                            rs.getDouble("price"));
                    books.add(book);
                }
            }
        }
        return books;
    }

    // Lấy sách rẻ nhất
    public String getCheapestBook() throws SQLException {
        String query =
                "SELECT b.id, b.title, bp.price FROM books b JOIN book_prices bp ON b.id = bp.book_id ORDER BY bp.price ASC LIMIT 1";

        try (Statement stmt = connection.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {
            if (rs.next()) {
                return String.format("Sách rẻ nhất: %s | Giá: %.0f", rs.getString("title"),
                        rs.getDouble("price"));
            }
        }
        return "Không có sách";
    }

    // Lấy sách đắt nhất
    public String getMostExpensiveBook() throws SQLException {
        String query =
                "SELECT b.id, b.title, bp.price FROM books b JOIN book_prices bp ON b.id = bp.book_id ORDER BY bp.price DESC LIMIT 1";

        try (Statement stmt = connection.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {
            if (rs.next()) {
                return String.format("Sách đắt nhất: %s | Giá: %.0f", rs.getString("title"),
                        rs.getDouble("price"));
            }
        }
        return "Không có sách";
    }
}
