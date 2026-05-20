package com.example.Controller;

import com.example.DAO.BookPriceDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;
import java.util.List;

@RestController
@RequestMapping("/api/prices")
@CrossOrigin(origins = "*")
public class BookPriceController {

    @Autowired
    private DataSource dataSource;

    // GET: /api/prices - Lấy tất cả giá sách
    @GetMapping
    public ResponseEntity<List<String>> getAllPrices() {
        try {
            Connection conn = dataSource.getConnection();
            BookPriceDAO dao = new BookPriceDAO(conn);
            List<String> prices = dao.getAllBookPrices();
            conn.close();
            return ResponseEntity.ok(prices);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET: /api/prices/{bookId} - Lấy giá sách theo ID
    @GetMapping("/{bookId}")
    public ResponseEntity<Double> getPriceByBookId(@PathVariable int bookId) {
        try {
            Connection conn = dataSource.getConnection();
            BookPriceDAO dao = new BookPriceDAO(conn);
            double price = dao.getPriceByBookId(bookId);
            conn.close();
            return ResponseEntity.ok(price);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET: /api/prices/range?min=50000&max=100000 - Lấy sách theo khoảng giá
    @GetMapping("/range")
    public ResponseEntity<List<String>> getBooksByPriceRange(
            @RequestParam double min,
            @RequestParam double max) {
        try {
            Connection conn = dataSource.getConnection();
            BookPriceDAO dao = new BookPriceDAO(conn);
            List<String> books = dao.getBooksByPriceRange(min, max);
            conn.close();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET: /api/prices/cheapest - Lấy sách rẻ nhất
    @GetMapping("/cheapest")
    public ResponseEntity<String> getCheapestBook() {
        try {
            Connection conn = dataSource.getConnection();
            BookPriceDAO dao = new BookPriceDAO(conn);
            String book = dao.getCheapestBook();
            conn.close();
            return ResponseEntity.ok(book);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET: /api/prices/expensive - Lấy sách đắt nhất
    @GetMapping("/expensive")
    public ResponseEntity<String> getMostExpensiveBook() {
        try {
            Connection conn = dataSource.getConnection();
            BookPriceDAO dao = new BookPriceDAO(conn);
            String book = dao.getMostExpensiveBook();
            conn.close();
            return ResponseEntity.ok(book);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // PUT: /api/prices/{bookId} - Cập nhật giá sách
    @PutMapping("/{bookId}")
    public ResponseEntity<String> updatePrice(@PathVariable int bookId, @RequestParam double price) {
        try {
            Connection conn = dataSource.getConnection();
            BookPriceDAO dao = new BookPriceDAO(conn);
            dao.updateBookPrice(bookId, price);
            conn.close();
            return ResponseEntity.ok("Cập nhật giá thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
