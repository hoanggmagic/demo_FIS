package com.example.Controller.Users;

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

    @GetMapping
    public ResponseEntity<?> getAllBooks(@RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size,
            HttpServletRequest request) {

        try {

            AuthContext ctx = RequestAuth.optional(request);

            return ResponseEntity
                    .ok(bookService.getBooksPagination(keyword, categoryId, page, size, ctx));

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
}
