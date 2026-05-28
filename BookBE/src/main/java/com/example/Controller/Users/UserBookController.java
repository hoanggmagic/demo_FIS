package com.example.Controller.Users;

import java.sql.Connection;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.Entities.Book;
import com.example.Service.BookService;
import com.example.Util.AuthContext;
import com.example.Util.PasswordUtil;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/user/books")
@CrossOrigin(origins = "*")
public class UserBookController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private PasswordUtil passwordUtil;

    // GET: /api/user/books - Lấy tất cả sách (user chỉ xem)
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.optional(request); // ← đổi require → optional
            BookService service = new BookService(conn, passwordUtil);
            return ResponseEntity.ok(service.getBooksForContext(ctx));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.optional(request); // ← đổi require → optional
            BookService service = new BookService(conn, passwordUtil);
            Book book = service.getBookById(id, ctx);
            return book != null ? ResponseEntity.ok(book) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // GET: /api/user/books/search?keyword=abc - Tìm kiếm sách
    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String keyword,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            BookService service = new BookService(conn, passwordUtil);
            List<Book> results = service.searchBooks(keyword);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
