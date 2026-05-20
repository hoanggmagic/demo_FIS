package com.example.Controller;

import com.example.Entities.Book;
import com.example.Service.BookService;
import com.example.Util.AuthContext;
import com.example.Util.PasswordUtil;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;
import java.sql.Connection;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private PasswordUtil passwordUtil;

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            BookService service = new BookService(conn, passwordUtil);
            return ResponseEntity.ok(service.getBooksForContext(ctx));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            BookService service = new BookService(conn, passwordUtil);
            Book book = service.getBookById(id, ctx);
            return book != null ? ResponseEntity.ok(book) : ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<String> createBook(@RequestBody Book book, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdminOrAuthor(ctx);
            BookService service = new BookService(conn, passwordUtil);
            service.addBook(book, book.getPrice(), ctx);
            return ResponseEntity.ok("Thêm sách thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateBook(
            @PathVariable int id, @RequestBody Book book, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdminOrAuthor(ctx);
            BookService service = new BookService(conn, passwordUtil);
            service.updateBook(id, book, book.getPrice(), ctx);
            return ResponseEntity.ok("Cập nhật sách thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdminOrAuthor(ctx);
            BookService service = new BookService(conn, passwordUtil);
            service.deleteBook(id, ctx);
            return ResponseEntity.ok("Xóa sách thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
