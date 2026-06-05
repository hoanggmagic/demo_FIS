package com.example.Controller.Admin;

import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.Entities.Book;
import com.example.Entities.BookPrice;
import com.example.Repository.BookRepository;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/books")
@CrossOrigin("*")
public class SaleController {

    @Autowired
    private BookRepository bookRepo;

    // PUT /api/admin/books/{id}/sale
    // Body: { "salePrice": 25000, "saleStart": "2026-06-01T00:00:00", "saleEnd":
    // "2026-06-30T23:59:59" }
    @PutMapping("/{id}/sale")
    public ResponseEntity<?> setSale(@PathVariable int id, @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);
            if (!ctx.isAdmin() && !ctx.isAuthor()) {
                return ResponseEntity.status(403).body("Không có quyền");
            }

            Book book = bookRepo.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sách"));

            if (ctx.isAuthor() && book.getAuthorId() != ctx.getUserId()) {
                return ResponseEntity.status(403).body("Không có quyền sửa sách này");
            }

            BookPrice bp = book.getBookPrice();
            if (bp == null) {
                return ResponseEntity.status(400).body("Sách chưa có giá gốc");
            }

            double salePrice = Double.parseDouble(body.get("salePrice"));
            LocalDateTime saleStart = LocalDateTime.parse(body.get("saleStart"));
            LocalDateTime saleEnd = LocalDateTime.parse(body.get("saleEnd"));

            if (saleStart.isAfter(saleEnd)) {
                return ResponseEntity.status(400).body("Ngày bắt đầu phải trước ngày kết thúc");
            }
            if (salePrice >= bp.getOriginalPrice()) {
                return ResponseEntity.status(400).body("Giá sale phải nhỏ hơn giá gốc");
            }
            if (salePrice <= 0) {
                return ResponseEntity.status(400).body("Giá sale phải lớn hơn 0");
            }

            bp.setSalePrice(salePrice);
            bp.setSaleStart(saleStart);
            bp.setSaleEnd(saleEnd);
            bookRepo.save(book);

            return ResponseEntity.ok(Map.of("message", "Đặt sale thành công", "salePrice",
                    salePrice, "saleStart", saleStart.toString(), "saleEnd", saleEnd.toString()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // DELETE /api/admin/books/{id}/sale — xóa sale
    @DeleteMapping("/{id}/sale")
    public ResponseEntity<?> removeSale(@PathVariable int id, HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);
            if (!ctx.isAdmin() && !ctx.isAuthor()) {
                return ResponseEntity.status(403).body("Không có quyền");
            }

            Book book = bookRepo.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sách"));

            if (ctx.isAuthor() && book.getAuthorId() != ctx.getUserId()) {
                return ResponseEntity.status(403).body("Không có quyền sửa sách này");
            }

            BookPrice bp = book.getBookPrice();
            if (bp == null) {
                return ResponseEntity.status(400).body("Sách chưa có giá");
            }

            bp.setSalePrice(null);
            bp.setSaleStart(null);
            bp.setSaleEnd(null);
            bookRepo.save(book);

            return ResponseEntity.ok("Đã xóa sale");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
