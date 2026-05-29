package com.example.Service;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import com.example.DAO.BookDAO;
import com.example.DAO.BookPriceDAO;
import com.example.DAO.UserDAO;
import com.example.Entities.Author;
import com.example.Entities.Book;
import com.example.Entities.User;
import com.example.Util.AuthContext;
import com.example.Util.PasswordUtil;
import com.example.dto.AuthorRequest;
import com.example.dto.BookDTO;

public class BookService {

    private final UserDAO userDAO;
    private final BookDAO bookDAO;
    private final BookPriceDAO priceDAO;
    private final PasswordUtil passwordUtil;

    private BookDTO toDTO(Book book) {

        BookDTO dto = new BookDTO();

        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setDescription(book.getDescription());
        dto.setPublishedYear(book.getPublishedYear());
        dto.setQuantity(book.getQuantity());
        dto.setPrice(book.getPrice());
        dto.setStatus(book.getStatus());

        dto.setAuthorId(book.getAuthorId());
        dto.setAuthorName(book.getAuthorName());

        // CATEGORY
        if (book.getCategory() != null) {
            dto.setCategoryId(book.getCategory().getId());
            dto.setCategoryName(book.getCategory().getName());
        }

        return dto;
    }

    public BookService(Connection connection, PasswordUtil passwordUtil) {

        this.userDAO = new UserDAO(connection);
        this.bookDAO = new BookDAO(connection);
        this.priceDAO = new BookPriceDAO(connection);
        this.passwordUtil = passwordUtil;
    }

    public BookService(Connection connection) {
        this(connection, null);
    }

    private void validatePublishedYear(int publishedYear) {

        int currentYear = Calendar.getInstance().get(Calendar.YEAR);

        if (publishedYear > currentYear) {

            throw new IllegalArgumentException(
                    "Năm xuất bản không được vượt quá năm hiện tại: " + currentYear);
        }
    }

    // =========================================================
    // AUTHOR
    // =========================================================

    public List<Author> getAuthorsForContext(AuthContext ctx) throws SQLException {

        if (ctx.isAdmin()) {
            return userDAO.getAllAuthors();
        }

        if (ctx.isAuthor()) {

            Author self = userDAO.getAuthorById(ctx.getUserId());

            return self != null ? List.of(self) : List.of();
        }

        return userDAO.getActiveAuthors();
    }

    public Author getAuthorById(int id, AuthContext ctx) throws SQLException {

        Author author = userDAO.getAuthorById(id);

        if (author == null) {
            return null;
        }

        if (ctx.isAuthor() && ctx.getUserId() != id) {

            throw new IllegalArgumentException("Không có quyền xem tác giả này");
        }

        return author;
    }

    public void createAuthor(AuthorRequest req, AuthContext ctx) throws SQLException {

        if (!ctx.isAdmin()) {

            throw new IllegalArgumentException("Chỉ ADMIN được tạo tác giả");
        }

        if (req.getUsername() == null || req.getUsername().isBlank()) {

            throw new IllegalArgumentException("Username không được trống");
        }

        if (req.getPassword() == null || req.getPassword().length() < 6) {

            throw new IllegalArgumentException("Mật khẩu tối thiểu 6 ký tự");
        }

        if (userDAO.usernameExists(req.getUsername())) {

            throw new IllegalArgumentException("Username đã tồn tại");
        }

        User user = new User();

        user.setUsername(req.getUsername().trim());

        user.setEmail(req.getEmail() != null ? req.getEmail().trim()
                : req.getUsername() + "@platform.local");

        user.setPassword(passwordUtil.hash(req.getPassword()));

        user.setFullName(req.getName());

        user.setNationality(req.getNationality());

        user.setBiography(req.getBiography());

        userDAO.insertAuthor(user);
    }

    public void updateAuthor(int id, Author author, AuthContext ctx) throws SQLException {

        if (ctx.isAuthor() && ctx.getUserId() != id) {

            throw new IllegalArgumentException("Chỉ được sửa hồ sơ của mình");
        }

        if (!ctx.isAdmin() && !ctx.isAuthor()) {

            throw new IllegalArgumentException("Không có quyền");
        }

        author.setId(id);

        userDAO.updateAuthor(author);
    }

    public boolean deleteAuthor(int id, AuthContext ctx) throws SQLException {

        if (!ctx.isAdmin()) {
            throw new IllegalArgumentException("Chỉ ADMIN được vô hiệu hóa tác giả");
        }

        User user = userDAO.findById(id);

        if (user == null) {
            throw new IllegalArgumentException("Không tìm thấy user");
        }

        boolean newStatus = !user.isActive();

        userDAO.updateStatus(id, newStatus);

        return newStatus;
    }

    public void addAuthorDemo(String fullName, String nationality) throws SQLException {

        User user = new User();

        String username = "author_" + System.currentTimeMillis();

        user.setUsername(username);

        user.setEmail(username + "@platform.local");

        String rawPass = "author123";

        user.setPassword(passwordUtil != null ? passwordUtil.hash(rawPass) : rawPass);

        user.setFullName(fullName);

        user.setNationality(nationality);

        userDAO.insertAuthor(user);
    }

    // =========================================================
    // BOOK
    // =========================================================

    public List<Book> getBooksForContext(AuthContext ctx) throws SQLException {
        return bookDAO.getAllBooks();
    }
   public List<Book> searchBooksByCategory(
        String keyword,
        Integer categoryId,
        AuthContext ctx) throws SQLException {

    return bookDAO.searchBooksByCategory(keyword, categoryId, ctx);
}

    public Book getBookById(int id, AuthContext ctx) throws SQLException {

        Book book = bookDAO.getBookById(id);

        if (book == null) {
            return null;
        }

        assertCanAccessBook(book, ctx);

        return book;
    }

    public void addBook(Book book, double price, AuthContext ctx) throws SQLException {

        validatePublishedYear(book.getPublishedYear());

        int authorId = book.getAuthorId();

        if (ctx.isAuthor()) {

            authorId = ctx.getUserId();

            book.setAuthorId(authorId);

        } else if (!ctx.isAdmin()) {

            throw new IllegalArgumentException("Không có quyền thêm sách");
        }

        if (authorId <= 0 || !userDAO.isAuthor(authorId)) {

            throw new IllegalArgumentException("Tác giả không hợp lệ");
        }

        if (price <= 0) {

            throw new IllegalArgumentException("Giá sách phải lớn hơn 0");
        }

        if (book.getStatus() == null) {

            book.setStatus("ACTIVE");
        }

        book.setQuantity(Math.max(book.getQuantity(), 0));

        int bookId = bookDAO.insertBook(book);

        priceDAO.insertBookPrice(bookId, price);
    }

    public void updateBook(int id, Book book, Double price, AuthContext ctx) throws SQLException {

        validatePublishedYear(book.getPublishedYear());

        Book existing = bookDAO.getBookById(id);

        if (existing == null) {

            throw new IllegalArgumentException("Không tìm thấy sách");
        }

        assertCanModifyBook(existing, ctx);

        if (ctx.isAuthor()) {

            book.setAuthorId(ctx.getUserId());

        } else if (ctx.isAdmin()) {

            if (book.getAuthorId() <= 0 || !userDAO.isAuthor(book.getAuthorId())) {

                throw new IllegalArgumentException("Tác giả không hợp lệ");
            }
        }

        book.setId(id);

        if (book.getDescription() == null) {

            book.setDescription(existing.getDescription());
        }

        if (book.getStatus() == null) {

            book.setStatus(existing.getStatus());
        }

        bookDAO.updateBook(book);

        if (price != null && price > 0) {

            if (priceDAO.getPriceByBookId(id) > 0) {

                priceDAO.updateBookPrice(id, price);

            } else {

                priceDAO.insertBookPrice(id, price);
            }
        }
    }

    public void deleteBook(int id, AuthContext ctx) throws SQLException {

        Book existing = bookDAO.getBookById(id);

        if (existing == null) {

            throw new IllegalArgumentException("Không tìm thấy sách");
        }

        assertCanModifyBook(existing, ctx);

        bookDAO.deleteBook(id);
    }

    private void assertCanAccessBook(Book book, AuthContext ctx) {

        if (ctx.isAuthor() && book.getAuthorId() != ctx.getUserId()) {

            throw new IllegalArgumentException("Không có quyền xem sách này");
        }
    }

    private void assertCanModifyBook(Book book, AuthContext ctx) {

        if (ctx.isAdmin()) {
            return;
        }

        if (ctx.isAuthor() && book.getAuthorId() == ctx.getUserId()) {

            return;
        }

        throw new IllegalArgumentException("Không có quyền sửa/xóa sách này");
    }

    public List<Book> searchBooks(String title) throws SQLException {

        return bookDAO.searchBookByTitle(title);
    }

    public List<Book> getBooksByCategory(int categoryId, AuthContext ctx) throws SQLException {
        return bookDAO.getBooksByCategory(categoryId, ctx);
    }
    // =========================================================
    // PRICE
    // =========================================================

    public void updatePrice(int bookId, double price) throws SQLException {

        if (price <= 0) {

            throw new IllegalArgumentException("Giá phải lớn hơn 0");
        }

        if (priceDAO.getPriceByBookId(bookId) > 0) {

            priceDAO.updateBookPrice(bookId, price);

        } else {

            priceDAO.insertBookPrice(bookId, price);
        }
    }

    public String getCheapestBook() throws SQLException {

        return priceDAO.getCheapestBook();
    }

    public String getMostExpensiveBook() throws SQLException {

        return priceDAO.getMostExpensiveBook();
    }

    public List<String> getAllPrices() {

        return List.of("Chức năng xem giá đang phát triển");
    }

    public List<String> getBooksByPriceRange(double min, double max) {

        return List.of("Chức năng lọc giá đang phát triển");
    }


    // =========================================================
    // STATISTICS
    // =========================================================

    public void printStatistics() throws SQLException {

        System.out.println("\n========== THỐNG KÊ ==========");

        System.out.println("Tổng tác giả: " + userDAO.getAllAuthors().size());

        System.out.println("Tổng sách: " + bookDAO.getAllBooks().size());

        System.out.println(priceDAO.getCheapestBook());

        System.out.println(priceDAO.getMostExpensiveBook());
    }

    // =========================================================
    // COMPATIBLE METHODS
    // =========================================================

    public List<Author> getAllAuthors() throws SQLException {

        return userDAO.getAllAuthors();
    }

    public List<Book> getAllBooks() throws SQLException {

        return bookDAO.getAllBooks();
    }

    public List<String> getBooksWithAuthors() throws SQLException {

        return List.of("Chức năng đang phát triển");
    }

    public List<BookDTO> getBooksForContextDTO(AuthContext ctx) {
        try {
            List<Book> books = getBooksForContext(ctx);

            List<BookDTO> result = new ArrayList<>();

            for (Book b : books) {
                result.add(toDTO(b));
            }

            return result;

        } catch (SQLException e) {
            throw new RuntimeException("DB error: " + e.getMessage(), e);
        }
    }

    public BookDTO getBookByIdDTO(int id, AuthContext ctx) throws SQLException {

        Book book = bookDAO.getBookById(id);

        if (book == null) {
            return null;
        }

        assertCanAccessBook(book, ctx);

        return toDTO(book);
    }

}
