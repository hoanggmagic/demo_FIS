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
import com.example.Entities.Book;
import com.example.Entities.Category;
import com.example.Service.BookService;
import com.example.Util.AuthContext;
import com.example.Util.PasswordUtil;
import com.example.Util.RequestAuth;
import com.example.dto.BookDTO;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private PasswordUtil passwordUtil;

    @GetMapping
    public ResponseEntity<List<BookDTO>> getAllBooks(HttpServletRequest request) {

        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);

            BookService service = new BookService(conn, passwordUtil);

            return ResponseEntity.ok(service.getBooksForContextDTO(ctx));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500).body(List.of());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable int id, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            BookService service = new BookService(conn, passwordUtil);

            BookDTO book = service.getBookByIdDTO(id, ctx);

            return book != null ? ResponseEntity.ok(book) : ResponseEntity.notFound().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<String> createBook(@RequestBody BookDTO dto, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdminOrAuthor(ctx);

            BookService service = new BookService(conn, passwordUtil);

            Book book = new Book();
            book.setTitle(dto.getTitle());
            book.setDescription(dto.getDescription());
            book.setPublishedYear(dto.getPublishedYear());
            book.setQuantity(dto.getQuantity());
            book.setAuthorId(dto.getAuthorId());
            book.setStatus(dto.getStatus());

            // ⭐ FIX CATEGORY
            if (dto.getCategoryId() != null) {
                Category c = new Category();
                c.setId(dto.getCategoryId());
                book.setCategory(c);
            }

            service.addBook(book, dto.getPrice(), ctx);

            return ResponseEntity.ok("Thêm sách thành công!");

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateBook(@PathVariable int id, @RequestBody BookDTO dto,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {

            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdminOrAuthor(ctx);

            BookService service = new BookService(conn, passwordUtil);

            Book book = new Book();
            book.setTitle(dto.getTitle());
            book.setDescription(dto.getDescription());
            book.setPublishedYear(dto.getPublishedYear());
            book.setQuantity(dto.getQuantity());
            book.setAuthorId(dto.getAuthorId());
            book.setStatus(dto.getStatus());

            // ⭐ FIX CATEGORY
            if (dto.getCategoryId() != null) {
                Category c = new Category();
                c.setId(dto.getCategoryId());
                book.setCategory(c);
            }

            service.updateBook(id, book, dto.getPrice(), ctx);

            return ResponseEntity.ok("Cập nhật sách thành công!");

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
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
