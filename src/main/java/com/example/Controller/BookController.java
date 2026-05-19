package com.example.Controller;

import com.example.DAO.BookDAO;
import com.example.Entities.Book;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;
import java.util.List;

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
            BookDAO dao = new BookDAO(conn);
            dao.insertBook(book);
            conn.close();
            return ResponseEntity.ok("Thêm sách thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // PUT: /api/books/{id} - Cập nhật sách
    @PutMapping("/{id}")
    public ResponseEntity<String> updateBook(@PathVariable int id, @RequestBody Book book) {
        try {
            Connection conn = dataSource.getConnection();
            BookDAO dao = new BookDAO(conn);
            book.setId(id);
            dao.updateBook(book);
            conn.close();
            return ResponseEntity.ok("Cập nhật sách thành công!");
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
