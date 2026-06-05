package com.example.Controller.Admin;

import java.util.List;
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
import com.example.Entities.User;
import com.example.Service.BookService;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import com.example.dto.AuthorRequest;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/authors")
@CrossOrigin(origins = "*")
public class AuthorController {

    // Tiêm thẳng BookService được Spring quản lý vào đây
    @Autowired
    private BookService bookService;

    // GET: Lấy danh sách tác giả (Trả về List<User> thay vì Author)
    @GetMapping
    public ResponseEntity<List<User>> getAllAuthors(HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);

            // Hàm getAuthors(ctx) trong BookService mới của bạn trả về List<User>
            return ResponseEntity.ok(bookService.getAuthors(ctx));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // GET: Lấy chi tiết tác giả qua ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getAuthorById(@PathVariable int id, HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);

            // BookService hiện tại chưa có getAuthorById đơn lẻ, ta dùng getAuthors lọc theo ID
            // Hoặc nếu bạn có UserService thì nên chuyển sang dùng UserService
            List<User> authors = bookService.getAuthors(ctx);
            User target = authors.stream().filter(a -> a.getId() == id).findFirst().orElse(null);

            return target != null ? ResponseEntity.ok(target) : ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // POST: Tạo tác giả mới (Sử dụng DTO AuthorRequest có sẵn)
    @PostMapping
    public ResponseEntity<String> createAuthor(@RequestBody AuthorRequest body,
            HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdmin(ctx);

            bookService.createAuthor(body, ctx);
            return ResponseEntity.ok("Thêm tác giả thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // PUT: Cập nhật thông tin tác giả
    @PutMapping("/{id}")
    public ResponseEntity<String> updateAuthor(@PathVariable int id,
            @RequestBody AuthorRequest body, // Chuyển từ Author sang AuthorRequest cho đồng bộ dữ
                                             // liệu sửa
            HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);

            // Gọi hàm updateAuthorById có sẵn trong BookService của bạn
            bookService.updateAuthorById(id, body, ctx);
            return ResponseEntity.ok("Cập nhật tác giả thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // DELETE: Bật / Tắt trạng thái hoạt động của tác giả (Soft Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAuthor(@PathVariable int id, HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdmin(ctx);

            // KHÔNG dùng UserDAO cũ nữa. Gọi thẳng hàm toggleAuthorStatus có sẵn trong BookService
            boolean newStatus = bookService.toggleAuthorStatus(id, ctx);

            if (newStatus) {
                return ResponseEntity.ok("Mở lại thành công!");
            } else {
                return ResponseEntity.ok("Vô hiệu hóa thành công!");
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
