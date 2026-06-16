package com.example.Controller.Admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.example.Entities.Book;
import com.example.Entities.Category;
import com.example.Service.BookService;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import com.example.dto.BookDTO;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/books")
@CrossOrigin(origins = "*")
public class BookController {

    // TIÊM THẲNG BEAN BOOK_SERVICE ĐƯỢC SPRING QUẢN LÝ VÀO ĐÂY
    @Autowired
    private BookService bookService;

    @GetMapping
    public ResponseEntity<Page<BookDTO>> getAllBooks(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size, HttpServletRequest request) {

        try {
            AuthContext ctx = RequestAuth.require(request);

            Pageable pageable = PageRequest.of(page, size);

            return ResponseEntity.ok(bookService.getBooksForContext(ctx, pageable));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // GET: Xem chi tiết sách qua ID
    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable int id, HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);

            BookDTO book = bookService.getBookById(id, ctx);
            return book != null ? ResponseEntity.ok(book) : ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // POST: Thêm sách mới kèm upload hình ảnh (Multipart Form Data)
    @PostMapping
    public ResponseEntity<String> createBook(@RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") Double price,
            @RequestParam("publishedYear") Integer publishedYear,
            @RequestParam(value = "status", defaultValue = "ACTIVE") String status,
            @RequestParam(value = "authorId", required = false) Integer authorId,
            @RequestParam(value = "categoryId", required = false) Integer categoryId,
            @RequestParam(value = "images", required = false) MultipartFile[] images, // Nhận vào
                                                                                      // đây
            HttpServletRequest request) {

        // --- XOÁ HOẶC COMMENT ĐOẠN VÒNG LẶP ADD IMAGE_BYTES CŨ ĐI ---

        try {
            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdminOrAuthor(ctx);

            Book book = new Book();
            book.setTitle(title);
            book.setDescription(description);
            book.setPublishedYear(publishedYear);
            book.setAuthorId(authorId != null ? authorId : 0);
            book.setStatus(status);

            if (categoryId != null) {
                Category c = new Category();
                c.setId(categoryId);
                book.setCategory(c);
            }

            // SỬA DÒNG NÀY: Truyền thẳng mảng 'images' vào theo đúng thiết kế của Service
            bookService.addBookWithImages(book, price, images, ctx);

            return ResponseEntity.ok("Thêm sách thành công!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // PUT: Cập nhật thông tin sách và cập nhật ảnh mới
    @PutMapping("/{id}")
    public ResponseEntity<String> updateBook(@PathVariable int id,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") Double price,
            @RequestParam("publishedYear") Integer publishedYear,
            @RequestParam(value = "status", defaultValue = "ACTIVE") String status,
            @RequestParam(value = "authorId", required = false) Integer authorId,
            @RequestParam(value = "categoryId", required = false) Integer categoryId,
            @RequestParam(value = "images", required = false) MultipartFile[] images, // Nhận mảng
                                                                                      // ảnh ở đây
            HttpServletRequest request) {

        // --- BƯỚC 1: XOÁ HOẶC COMMENT ĐOẠN LOGIC DUYỆT VÒNG LẶP BÓC TÁCH BYTE CŨ ĐI ---
        /*
         * List<byte[]> imageBytes = new ArrayList<>(); List<String> imageNames = new ArrayList<>();
         * ... Đống code try-catch cũ dọn sạch đi cho nhẹ nợ ...
         */

        try {
            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdminOrAuthor(ctx);

            Book book = new Book();
            book.setTitle(title);
            book.setDescription(description);
            book.setPublishedYear(publishedYear);
            book.setAuthorId(authorId != null ? authorId : 0);
            book.setStatus(status);

            if (categoryId != null) {
                Category c = new Category();
                c.setId(categoryId);
                book.setCategory(c);
            }

            // Cập nhật thông tin cơ bản và giá sách
            bookService.updateBook(id, book, price, ctx);

            // BƯỚC 2: SỬA DÒNG NÀY — Truyền thẳng mảng 'images' gốc vào Service
            if (images != null && images.length > 0) {
                bookService.updateBookImages(id, images);
            }

            return ResponseEntity.ok("Cập nhật sách thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // DELETE: Xóa sách (Hoặc đổi trạng thái sang ẩn tùy logic của Service)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable int id, HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdminOrAuthor(ctx);

            bookService.deleteBook(id, ctx);
            return ResponseEntity.ok("Xóa sách thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<String> toggleBookStatus(@PathVariable int id,
            HttpServletRequest request) {
        try {
            AuthContext ctx = RequestAuth.require(request);
            RequestAuth.requireAdminOrAuthor(ctx);
            String newStatus = bookService.toggleStatus(id, ctx);
            return ResponseEntity.ok("Đã chuyển trạng thái sách sang " + newStatus);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
