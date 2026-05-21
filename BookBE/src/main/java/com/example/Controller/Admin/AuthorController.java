package com.example.Controller.Admin;

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
import com.example.DAO.UserDAO;
import com.example.Entities.Author;
import com.example.Service.BookService;
import com.example.Util.AuthContext;
import com.example.Util.PasswordUtil;
import com.example.Util.RequestAuth;
import com.example.dto.AuthorRequest;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/authors")
@CrossOrigin(origins = "*")
public class AuthorController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private PasswordUtil passwordUtil;

    @GetMapping
    public ResponseEntity<List<Author>> getAllAuthors(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            BookService service = new BookService(conn, passwordUtil);
            return ResponseEntity.ok(service.getAuthorsForContext(ctx));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Author> getAuthorById(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            BookService service = new BookService(conn, passwordUtil);
            Author author = service.getAuthorById(id, ctx);
            return author != null ? ResponseEntity.ok(author) : ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<String> createAuthor(@RequestBody AuthorRequest body,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdmin(ctx);
            BookService service = new BookService(conn, passwordUtil);
            service.createAuthor(body, ctx);
            return ResponseEntity.ok("Thêm tác giả thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateAuthor(@PathVariable int id, @RequestBody Author author,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            BookService service = new BookService(conn, passwordUtil);
            service.updateAuthor(id, author, ctx);
            return ResponseEntity.ok("Cập nhật tác giả thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAuthor(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdmin(ctx);

            UserDAO dao = new UserDAO(conn);

            boolean newStatus = dao.toggleAuthorStatus(id);

            if (newStatus) {
                return ResponseEntity.ok("Mở lại thành công!");
            } else {
                return ResponseEntity.ok("Vô hiệu hóa thành công!");
            }

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
