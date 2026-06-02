package com.example.Controller.Admin;

import java.sql.Timestamp;
import java.util.Map;
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
import com.example.Entities.BookDiscount;
import com.example.Repository.BookDiscountRepository;

@RestController
@RequestMapping("/api/admin/discounts")
@CrossOrigin("*")
public class BookDiscountController {

    @Autowired
    private BookDiscountRepository discountRepo;

    // Lấy tất cả discount
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(discountRepo.findAll());
    }

    // Lấy discount theo sách
    @GetMapping("/book/{bookId}")
    public ResponseEntity<?> getByBook(@PathVariable int bookId) {
        return ResponseEntity.ok(discountRepo.findByBookId(bookId));
    }

    // Tạo discount mới có bắt lỗi thiếu thông tin
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            // 1. KIỂM TRA ĐẦY ĐỦ THÔNG TIN (VALIDATION)
            if (body.get("bookId") == null || body.get("bookId").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Vui lòng chọn sách cần giảm giá!"));
            }
            if (body.get("discountPercent") == null
                    || body.get("discountPercent").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Vui lòng nhập phần trăm giảm giá!"));
            }
            if (body.get("startDate") == null
                    || body.get("startDate").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Vui lòng chọn ngày bắt đầu!"));
            }
            if (body.get("endDate") == null || body.get("endDate").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Vui lòng chọn ngày kết thúc!"));
            }

            // 2. ÉP KIỂU VÀ KIỂM TRA TÍNH HỢP LỆ LOGIC
            double percent = Double.parseDouble(body.get("discountPercent").toString());
            if (percent <= 0 || percent > 100) {
                return ResponseEntity.badRequest().body(Map.of("message",
                        "Phần trăm giảm giá phải nằm trong khoảng từ 1 đến 100%!"));
            }

            Timestamp start = Timestamp.valueOf(body.get("startDate").toString().replace("T", " "));
            Timestamp end = Timestamp.valueOf(body.get("endDate").toString().replace("T", " "));

            if (end.before(start)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Ngày kết thúc không được nhỏ hơn ngày bắt đầu!"));
            }

            // 3. THỰC THI LƯU VÀO DATABASE
            BookDiscount discount = new BookDiscount();
            discount.setBookId(Integer.parseInt(body.get("bookId").toString()));
            discount.setDiscountPercent(percent);
            discount.setStartDate(start);
            discount.setEndDate(end);
            discount.setStatus("ACTIVE");

            discountRepo.save(discount);
            return ResponseEntity.ok(Map.of("message", "Tạo chương trình giảm giá thành công!"));

        } catch (IllegalArgumentException e) {
            // Bắt lỗi sai định dạng ngày giờ (ví dụ nhập chữ thay vì ngày tháng)
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Định dạng ngày giờ không hợp lệ (yyyy-MM-dd HH:mm:ss)!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    // Cập nhật discount
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Map<String, Object> body) {
        try {
            BookDiscount discount = discountRepo.findById(id).orElseThrow(
                    () -> new RuntimeException("Không tìm thấy chương trình giảm giá"));

            if (body.containsKey("discountPercent")) {
                double percent = Double.parseDouble(body.get("discountPercent").toString());
                if (percent <= 0 || percent > 100) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Phần trăm giảm giá phải từ 1 đến 100%!"));
                }
                discount.setDiscountPercent(percent);
            }

            if (body.containsKey("startDate")) {
                discount.setStartDate(
                        Timestamp.valueOf(body.get("startDate").toString().replace("T", " ")));
            }
            if (body.containsKey("endDate")) {
                discount.setEndDate(
                        Timestamp.valueOf(body.get("endDate").toString().replace("T", " ")));
            }

            // Kiểm tra lại logic ngày sau khi sửa đổi
            if (discount.getEndDate().before(discount.getStartDate())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Ngày kết thúc không thể trước ngày bắt đầu!"));
            }

            if (body.containsKey("status")) {
                discount.setStatus(body.get("status").toString());
            }

            discountRepo.save(discount);
            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Định dạng ngày giờ cập nhật không hợp lệ!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // Xóa discount
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        discountRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa chương trình giảm giá!"));
    }
}
