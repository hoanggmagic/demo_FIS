package com.example.Controller.Users;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.Service.BookService;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import com.example.dto.BookDTO;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/user/books")
@CrossOrigin(origins = "*")
public class UserBookController {

    // 1. TIÊM THẲNG BEAN SERVICE VÀO ĐÂY, KHÔNG DÙNG NEW, KHÔNG DÙNG CONNECTION NỮA
    @Autowired
    private BookService bookService;

    // GET: /api/user/books - Lấy tất cả sách hoặc tìm kiếm theo danh mục (Trả về BookDTO)
    @GetMapping
    public ResponseEntity<?> getAllBooks(@RequestParam(required = false) Integer categoryId,
            HttpServletRequest request) {

        try {
            AuthContext ctx = RequestAuth.optional(request);
            List<BookDTO> books;

            // Đồng bộ lại theo các hàm thực tế có sẵn trong BookService của bạn
            if (categoryId != null) {
                // Nếu BookService chưa có getBooksByCategory, ta dùng hàm search truyền keyword
                // rỗng
                books = bookService.searchBooks("", categoryId, ctx);
            } else {
                books = bookService.getBooksForContext(ctx);
            }

            return ResponseEntity.ok(books);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // GET: /api/user/books/{id} - Lấy chi tiết một cuốn sách
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable int id, HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.optional(request);

            // Gọi hàm getBookById có sẵn trong BookService (Hàm này đã trả về BookDTO)
            BookDTO bookDTO = bookService.getBookById(id, ctx);

            return ResponseEntity.ok(bookDTO);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // GET: /api/user/books/search?keyword=abc - Tìm kiếm sách
    @GetMapping("/search")
    public ResponseEntity<?> searchBooks(@RequestParam String keyword,
            @RequestParam(required = false) Integer categoryId, HttpServletRequest request) {

        try {
            AuthContext ctx = RequestAuth.optional(request);

            // Gọi hàm searchBooks(keyword, categoryId, ctx) chuẩn chỉnh của BookService
            List<BookDTO> results = bookService.searchBooks(keyword, categoryId, ctx);

            return ResponseEntity.ok(results);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
