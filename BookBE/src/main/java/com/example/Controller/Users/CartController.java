package com.example.Controller.Users;

import java.sql.Connection;
import java.util.List;
import java.util.Map;
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
import com.example.DAO.CartDAO;
import com.example.Util.AuthContext;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/user/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<?> getCart(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            CartDAO dao = new CartDAO(conn);
            List<Map<String, Object>> cart = dao.getCartByUserId(ctx.getUserId());
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            // Ghi log chi tiết ra terminal
            System.err.println("--- LỖI TẠI GET CART ---");
            e.printStackTrace();
            // Trả về thông báo lỗi dễ đọc hơn
            return ResponseEntity.status(500)
                    .body("Chi tiết lỗi: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    // POST /api/user/cart
    // Body: { "bookId": 1, "quantity": 1, "branchId": 2 }
    @PostMapping
    public ResponseEntity<String> addToCart(@RequestBody Map<String, Integer> body,
            HttpServletRequest request) {
        // SỬA ⑥: Tách auth error ra ngoài
        AuthContext ctx;
        try {
            ctx = RequestAuth.require(request);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Unauthorized: " + e.getMessage());
        }

        // SỬA ⑤: Validate input trước khi dùng
        if (!body.containsKey("bookId")) {
            return ResponseEntity.badRequest().body("Thiếu trường bookId");
        }

        try (Connection conn = dataSource.getConnection()) {
            int bookId = body.get("bookId");
            int quantity = body.getOrDefault("quantity", 1);
            int branchId = body.getOrDefault("branchId", 1);

            if (quantity <= 0) {
                return ResponseEntity.badRequest().body("Số lượng phải lớn hơn 0");
            }

            CartDAO dao = new CartDAO(conn);
            dao.addToCart(ctx.getUserId(), bookId, quantity, branchId);
            return ResponseEntity.ok("Thêm vào giỏ hàng thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<String> updateQuantity(@PathVariable int cartItemId,
            @RequestBody Map<String, Integer> body, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            int quantity = body.get("quantity");
            if (quantity <= 0)
                return ResponseEntity.badRequest().body("Số lượng phải lớn hơn 0");
            CartDAO dao = new CartDAO(conn);
            dao.updateQuantity(cartItemId, ctx.getUserId(), quantity);
            return ResponseEntity.ok("Cập nhật thành công!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<String> removeItem(@PathVariable int cartItemId,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            CartDAO dao = new CartDAO(conn);
            dao.removeFromCart(cartItemId, ctx.getUserId());
            return ResponseEntity.ok("Đã xóa khỏi giỏ hàng!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<String> clearCart(HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            AuthContext ctx = RequestAuth.require(request);
            CartDAO dao = new CartDAO(conn);
            dao.clearCart(ctx.getUserId());
            return ResponseEntity.ok("Đã xóa toàn bộ giỏ hàng!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }
}
