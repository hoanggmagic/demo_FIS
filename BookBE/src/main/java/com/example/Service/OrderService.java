package com.example.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.Entities.Book;
import com.example.Entities.Branch;
import com.example.Entities.Inventory;
import com.example.Entities.Order;
import com.example.Entities.OrderItem;
import com.example.Repository.BookRepository;
import com.example.Repository.BranchRepository;
import com.example.Repository.InventoryRepository;
import com.example.Repository.OrderItemRepository;
import com.example.Repository.OrderRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepo;
    @Autowired
    private OrderItemRepository orderItemRepo;
    @Autowired
    private InventoryRepository inventoryRepo;
    @Autowired
    private BranchRepository branchRepo;
    @Autowired
    private BookRepository bookRepo;

    // ── DTO dùng để nhận request từ frontend ────────────────────────────────
    public static class OrderRequest {
        private int userId;
        private int branchId; // Chi nhánh khách chọn
        private List<ItemRequest> items;

        public int getUserId() {
            return userId;
        }

        public void setUserId(int userId) {
            this.userId = userId;
        }

        public int getBranchId() {
            return branchId;
        }

        public void setBranchId(int branchId) {
            this.branchId = branchId;
        }

        public List<ItemRequest> getItems() {
            return items;
        }

        public void setItems(List<ItemRequest> items) {
            this.items = items;
        }
    }

    public static class ItemRequest {
        private int bookId;
        private int quantity;

        public int getBookId() {
            return bookId;
        }

        public void setBookId(int bookId) {
            this.bookId = bookId;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }

    // ── Kết quả kiểm tra tồn kho trước khi đặt ──────────────────────────────
    public static class StockCheckResult {
        private boolean available;
        private String message;
        // Các chi nhánh khác có đủ hàng (nếu chi nhánh khách chọn hết)
        private List<Inventory> alternativeBranches = new ArrayList<>();

        public boolean isAvailable() {
            return available;
        }

        public void setAvailable(boolean available) {
            this.available = available;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public List<Inventory> getAlternativeBranches() {
            return alternativeBranches;
        }

        public void setAlternativeBranches(List<Inventory> alternativeBranches) {
            this.alternativeBranches = alternativeBranches;
        }
    }

    // ── 1. Kiểm tra tồn kho trước khi đặt hàng ──────────────────────────────
    // Frontend gọi API này trước, nếu hết hàng → hiển thị chi nhánh thay thế
    public StockCheckResult checkStock(int branchId, int bookId, int quantity) {
        StockCheckResult result = new StockCheckResult();

        Inventory inv = inventoryRepo.findByBookIdAndBranchId(bookId, branchId).orElse(null);

        if (inv != null && inv.getQuantity() >= quantity) {
            result.setAvailable(true);
            result.setMessage("Còn hàng");
        } else {
            result.setAvailable(false);
            // Tìm chi nhánh khác có đủ hàng
            List<Inventory> alternatives = inventoryRepo.findByBookId(bookId).stream()
                    .filter(i -> i.getBranchId() != branchId && i.getQuantity() >= quantity)
                    .collect(java.util.stream.Collectors.toList());
            result.setAlternativeBranches(alternatives);
            result.setMessage(alternatives.isEmpty() ? "Hết hàng toàn hệ thống"
                    : "Chi nhánh bạn chọn hết hàng. Có " + alternatives.size()
                            + " chi nhánh khác còn hàng.");
        }
        return result;
    }

    // ── 2. Đặt hàng — trừ kho đúng chi nhánh ───────────────────────────────
    @Transactional
    public Order placeOrder(OrderRequest req) {
        Branch branch = branchRepo.findById(req.getBranchId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi nhánh"));

        // Kiểm tra tồn kho tất cả items trước khi trừ
        for (ItemRequest item : req.getItems()) {
            Inventory inv =
                    inventoryRepo.findByBookIdAndBranchId(item.getBookId(), req.getBranchId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Sách ID " + item.getBookId() + " không có tại chi nhánh này"));

            if (inv.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sách ID " + item.getBookId()
                        + " không đủ số lượng. Còn: " + inv.getQuantity());
            }
        }

        // Tạo Order
        Order order = new Order();
        order.setUserId(req.getUserId());
        order.setBranch(branch);
        order.setStatus("PENDING");

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (ItemRequest itemReq : req.getItems()) {
            Book book = bookRepo.findById(itemReq.getBookId()).orElseThrow(
                    () -> new RuntimeException("Không tìm thấy sách ID " + itemReq.getBookId()));

            // Trừ kho
            Inventory inv = inventoryRepo
                    .findByBookIdAndBranchId(itemReq.getBookId(), req.getBranchId()).orElseThrow();
            inv.setQuantity(inv.getQuantity() - itemReq.getQuantity());
            inventoryRepo.save(inv);

            // Tạo OrderItem
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setBook(book);
            oi.setQuantity(itemReq.getQuantity());
            BigDecimal price = BigDecimal.valueOf(book.getPrice());
            oi.setPrice(price);
            orderItems.add(oi);

            total = total.add(price.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        order.setTotalPrice(total);
        // Chia doanh thu: tác giả 70%, nền tảng 30%
        order.setAuthorIncome(total.multiply(BigDecimal.valueOf(0.7)));
        order.setPlatformIncome(total.multiply(BigDecimal.valueOf(0.3)));
        order.setItems(orderItems);

        return orderRepo.save(order);
    }

    // ── 3. Lấy đơn hàng theo user ────────────────────────────────────────────
    public List<Order> getOrdersByUser(int userId) {
        return orderRepo.findByUserId(userId);
    }

    // ── 4. Lấy đơn hàng theo chi nhánh (Admin) ──────────────────────────────
    public List<Order> getOrdersByBranch(int branchId) {
        return orderRepo.findByBranchId(branchId);
    }

    // ── 5. Cập nhật trạng thái đơn hàng (Admin) ─────────────────────────────
    @Transactional
    public Order updateStatus(int orderId, String newStatus) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Nếu huỷ đơn → hoàn lại kho
        if ("CANCELLED".equals(newStatus) && !"CANCELLED".equals(order.getStatus())) {
            for (OrderItem item : order.getItems()) {
                Inventory inv = inventoryRepo
                        .findByBookIdAndBranchId(item.getBook().getId(), order.getBranch().getId())
                        .orElseGet(() -> new Inventory(item.getBook().getId(),
                                order.getBranch().getId(), 0));
                inv.setQuantity(inv.getQuantity() + item.getQuantity());
                inventoryRepo.save(inv);
            }
        }

        order.setStatus(newStatus);
        return orderRepo.save(order);
    }
}
