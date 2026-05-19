package com.example.Controller;

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
import com.example.DAO.BookDAO;
import com.example.Entities.Book;
import com.example.Service.BookService;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private DataSource dataSource;

    // GET: /api/books - Lấy tất cả sách
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        try {
            Connection conn = dataSource.getConnection();
            BookDAO dao = new BookDAO(conn);
            List<Book> books = dao.getAllBooks();
            conn.close();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET: /api/books/{id} - Lấy sách theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable int id) {
        try {
            Connection conn = dataSource.getConnection();
            BookDAO dao = new BookDAO(conn);
            Book book = dao.getBookById(id);
            conn.close();
            return book != null ? ResponseEntity.ok(book) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET: /api/books/search/{title} - Tìm kiếm sách
    @GetMapping("/search/{title}")
    public ResponseEntity<List<Book>> searchBooks(@PathVariable String title) {
        try {
            Connection conn = dataSource.getConnection();
            BookDAO dao = new BookDAO(conn);
            List<Book> books = dao.searchBookByTitle(title);
            conn.close();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET: /api/books/with-authors - Lấy sách kèm tác giả
    @GetMapping("/with-authors")
    public ResponseEntity<List<String>> getBooksWithAuthors() {
        try {
            Connection conn = dataSource.getConnection();
            BookDAO dao = new BookDAO(conn);
            List<String> books = dao.getAllBooksWithAuthors();
            conn.close();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // POST: /api/books - Thêm sách mới
    @PostMapping
    public ResponseEntity<String> createBook(@RequestBody Book book) {
        try {
            Connection conn = dataSource.getConnection();
            BookService service = new BookService(conn);
            service.addBook(book.getTitle(), book.getPublishedYear(), book.getAuthorId());
            conn.close();
            return ResponseEntity.ok("Thêm sách thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // PUT: /api/books/{id} - Cập nhật sách
    @PutMapping("/{id}")
    public ResponseEntity<String> updateBook(@PathVariable int id, @RequestBody Book book) {
        try {
            Connection conn = dataSource.getConnection();
            BookService service = new BookService(conn);
            service.updateBook(id, book.getTitle(), book.getPublishedYear(), book.getAuthorId());
            conn.close();
            return ResponseEntity.ok("Cập nhật sách thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // DELETE: /api/books/{id} - Xóa sách
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable int id) {
        try {
            Connection conn = dataSource.getConnection();
            BookDAO dao = new BookDAO(conn);
            dao.deleteBook(id);
            conn.close();
            return ResponseEntity.ok("Xóa sách thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
