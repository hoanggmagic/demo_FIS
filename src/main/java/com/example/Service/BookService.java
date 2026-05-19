package com.example.Service;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.List;
import com.example.DAO.AuthorDAO;
import com.example.DAO.BookDAO;
import com.example.DAO.BookPriceDAO;
import com.example.Entities.Author;
import com.example.Entities.Book;

public class BookService {
    private AuthorDAO authorDAO;
    private BookDAO bookDAO;
    private BookPriceDAO priceDAO;

    public BookService(Connection connection) {
        this.authorDAO = new AuthorDAO(connection);
        this.bookDAO = new BookDAO(connection);
        this.priceDAO = new BookPriceDAO(connection);
    }

    private void validatePublishedYear(int publishedYear) throws IllegalArgumentException {
        int currentYear = Calendar.getInstance().get(Calendar.YEAR);
        if (publishedYear > currentYear) {
            throw new IllegalArgumentException(
                    "Năm xuất bản không được vượt quá năm hiện tại: " + currentYear);
        }
    }

    // ===== AUTHOR OPERATIONS =====
    public List<Author> getAllAuthors() throws SQLException {
        return authorDAO.getAllAuthors();
    }

    public Author getAuthorById(int id) throws SQLException {
        return authorDAO.getAuthorById(id);
    }

    public void addAuthor(String name, String nationality) throws SQLException {
        authorDAO.insertAuthor(new Author(0, name, nationality));
    }

    public void updateAuthor(int id, String name, String nationality) throws SQLException {
        authorDAO.updateAuthor(new Author(id, name, nationality));
    }

    public void deleteAuthor(int id) throws SQLException {
        authorDAO.deleteAuthor(id);
    }

    // ===== BOOK OPERATIONS =====
    public List<Book> getAllBooks() throws SQLException {
        return bookDAO.getAllBooks();
    }

    public Book getBookById(int id) throws SQLException {
        return bookDAO.getBookById(id);
    }

    public List<Book> searchBooks(String title) throws SQLException {
        return bookDAO.searchBookByTitle(title);
    }

    public List<String> getBooksWithAuthors() throws SQLException {
        return bookDAO.getAllBooksWithAuthors();
    }

    public void addBook(String title, int publishedYear, int categoryId) throws SQLException {
        validatePublishedYear(publishedYear);
        bookDAO.insertBook(new Book(0, title, publishedYear, categoryId));
    }

    public void updateBook(int id, String title, int publishedYear, int categoryId)
            throws SQLException {
        validatePublishedYear(publishedYear);
        bookDAO.updateBook(new Book(id, title, publishedYear, categoryId));
    }

    public void deleteBook(int id) throws SQLException {
        bookDAO.deleteBook(id);
    }

    // ===== PRICE OPERATIONS =====
    public List<String> getAllPrices() throws SQLException {
        return priceDAO.getAllBookPrices();
    }

    public double getPriceByBookId(int bookId) throws SQLException {
        return priceDAO.getPriceByBookId(bookId);
    }

    public List<String> getBooksByPriceRange(double min, double max) throws SQLException {
        return priceDAO.getBooksByPriceRange(min, max);
    }

    public String getCheapestBook() throws SQLException {
        return priceDAO.getCheapestBook();
    }

    public String getMostExpensiveBook() throws SQLException {
        return priceDAO.getMostExpensiveBook();
    }

    public void updatePrice(int bookId, double price) throws SQLException {
        priceDAO.updateBookPrice(bookId, price);
    }

    // ===== STATISTICS =====
    public void printStatistics() throws SQLException {
        System.out.println("\n========== THỐNG KÊ ==========");
        System.out.println("Tổng tác giả: " + authorDAO.getAllAuthors().size());
        System.out.println("Tổng sách: " + bookDAO.getAllBooks().size());
        System.out.println(priceDAO.getCheapestBook());
        System.out.println(priceDAO.getMostExpensiveBook());
    }
}
