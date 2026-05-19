package com.example.Controller;

import com.example.DAO.AuthorDAO;
import com.example.Entities.Author;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;
import java.util.List;

@RestController
@RequestMapping("/api/authors")
@CrossOrigin(origins = "*")
public class AuthorController {

    @Autowired
    private DataSource dataSource;

    // GET: /api/authors - Lấy tất cả tác giả
    @GetMapping
    public ResponseEntity<List<Author>> getAllAuthors() {
        try {
            Connection conn = dataSource.getConnection();
            AuthorDAO dao = new AuthorDAO(conn);
            List<Author> authors = dao.getAllAuthors();
            conn.close();
            return ResponseEntity.ok(authors);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET: /api/authors/{id} - Lấy tác giả theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Author> getAuthorById(@PathVariable int id) {
        try {
            Connection conn = dataSource.getConnection();
            AuthorDAO dao = new AuthorDAO(conn);
            Author author = dao.getAuthorById(id);
            conn.close();
            return author != null ? ResponseEntity.ok(author) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // POST: /api/authors - Thêm tác giả mới
    @PostMapping
    public ResponseEntity<String> createAuthor(@RequestBody Author author) {
        try {
            Connection conn = dataSource.getConnection();
            AuthorDAO dao = new AuthorDAO(conn);
            dao.insertAuthor(author);
            conn.close();
            return ResponseEntity.ok("Thêm tác giả thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // PUT: /api/authors/{id} - Cập nhật tác giả
    @PutMapping("/{id}")
    public ResponseEntity<String> updateAuthor(@PathVariable int id, @RequestBody Author author) {
        try {
            Connection conn = dataSource.getConnection();
            AuthorDAO dao = new AuthorDAO(conn);
            author.setId(id);
            dao.updateAuthor(author);
            conn.close();
            return ResponseEntity.ok("Cập nhật tác giả thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // DELETE: /api/authors/{id} - Xóa tác giả
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAuthor(@PathVariable int id) {
        try {
            Connection conn = dataSource.getConnection();
            AuthorDAO dao = new AuthorDAO(conn);
            dao.deleteAuthor(id);
            conn.close();
            return ResponseEntity.ok("Xóa tác giả thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
    
}
