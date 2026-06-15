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
import com.example.Entities.Wallet;
import com.example.Entities.WalletTransaction;
import com.example.Repository.BookRepository;
import com.example.Repository.BranchRepository;
import com.example.Repository.InventoryRepository;
import com.example.Repository.OrderItemRepository;
import com.example.Repository.OrderRepository;
import com.example.Repository.WalletRepository;
import com.example.Repository.WalletTransactionRepository;

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
    @Autowired
    private WalletRepository walletRepository; // 👈 THÊM
    @Autowired
    private WalletTransactionRepository walletTransactionRepository; // 👈 THÊM
    @Autowired
    private BookService bookService;

    // ── DTO ─────────────────────────────────────────────────────────────────
    public static class OrderRequest {
        private int userId;
        private int branchId;
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

    public static class StockCheckResult {
        private boolean available;
        private String message;
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

    // ── 1. Kiểm tra tồn kho ─────────────────────────────────────────────────
    public StockCheckResult checkStock(int branchId, int bookId, int quantity) {
        StockCheckResult result = new StockCheckResult();
        Inventory inv = inventoryRepo.findByBookIdAndBranchId(bookId, branchId).orElse(null);
        if (inv != null && inv.getQuantity() >= quantity) {
            result.setAvailable(true);
            result.setMessage("Còn hàng");
        } else {
            result.setAvailable(false);
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

    // ── 2. Đặt hàng ─────────────────────────────────────────────────────────
    @Transactional
    public Order placeOrder(OrderRequest req) {
        Branch branch = branchRepo.findById(req.getBranchId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi nhánh"));

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

        Order order = new Order();
        order.setUserId(req.getUserId());
        order.setBranch(branch);
        order.setStatus("PENDING");

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (ItemRequest itemReq : req.getItems()) {
            Book book = bookRepo.findById(itemReq.getBookId()).orElseThrow(
                    () -> new RuntimeException("Không tìm thấy sách ID " + itemReq.getBookId()));

            Inventory inv = inventoryRepo
                    .findByBookIdAndBranchId(itemReq.getBookId(), req.getBranchId()).orElseThrow();
            inv.setQuantity(inv.getQuantity() - itemReq.getQuantity());
            inventoryRepo.save(inv);

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setBook(book);
            oi.setQuantity(itemReq.getQuantity());
            BigDecimal price = BigDecimal.valueOf(bookService.getEffectivePrice(book.getId()));
            oi.setPrice(price);
            orderItems.add(oi);

            total = total.add(price.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        order.setTotalPrice(total);
        order.setAuthorIncome(total.multiply(BigDecimal.valueOf(0.7)));
        order.setPlatformIncome(total.multiply(BigDecimal.valueOf(0.3)));
        order.setItems(orderItems);

        return orderRepo.save(order);
    }

    // ── 3. Xử lý sau thanh toán thành công — tạo wallet transaction ───────── 👈 THÊM
    @Transactional
    public void handlePaymentSuccess(int orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Tránh xử lý 2 lần nếu đã PAID
        if ("PAID".equals(order.getStatus()))
            return;

        order.setStatus("PAID");
        orderRepo.save(order);

        for (OrderItem item : order.getItems()) {
            Book book = item.getBook();
            int authorId = book.getAuthorId();

            // Tìm ví tác giả
            Wallet wallet = walletRepository.findByUserId(authorId).orElseThrow(
                    () -> new RuntimeException("Tác giả ID " + authorId + " chưa có ví"));

            // Tính 70% doanh thu
            BigDecimal income = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                    .multiply(BigDecimal.valueOf(0.7));

            // Cộng vào ví
            wallet.setBalance(wallet.getBalance().add(income));
            walletRepository.save(wallet);

            // Tạo wallet_transaction
            WalletTransaction wt = new WalletTransaction();
            wt.setWalletId(wallet.getId());
            wt.setUserId(authorId);
            wt.setOrderId(orderId);
            wt.setBookId(book.getId());
            wt.setAmount(income);
            wt.setTransactionType("INCOME");
            wt.setDescription(
                    "Doanh thu từ sách: " + book.getTitle() + " (x" + item.getQuantity() + ")");
            walletTransactionRepository.save(wt);
        }
    }

    @Transactional
    public void distributeIncomeForSuccessfulOrder(int orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!"SUCCESS".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng chưa ở trạng thái SUCCESS");
        }

        if (walletTransactionRepository.existsByOrderIdAndTransactionType(orderId, "INCOME")) {
            return;
        }

        BigDecimal authorRate = BigDecimal.valueOf(0.68);
        BigDecimal platformRate = BigDecimal.valueOf(0.32);
        BigDecimal total = order.getTotalPrice() != null ? order.getTotalPrice() : BigDecimal.ZERO;

        BigDecimal authorIncome = total.multiply(authorRate);
        BigDecimal platformIncome = total.multiply(platformRate);

        for (OrderItem item : order.getItems()) {
            Book book = item.getBook();
            int authorId = book.getAuthorId();

            BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            BigDecimal itemAuthorIncome = itemTotal.multiply(authorRate);
            BigDecimal itemPlatformIncome = itemTotal.multiply(platformRate);

            Wallet authorWallet = walletRepository.findByUserId(authorId).orElseGet(() -> {
                Wallet wallet = new Wallet();
                wallet.setUserId(authorId);
                wallet.setBalance(BigDecimal.ZERO);
                return walletRepository.save(wallet);
            });

            authorWallet.setBalance(authorWallet.getBalance().add(itemAuthorIncome));
            walletRepository.save(authorWallet);

            WalletTransaction authorTx = new WalletTransaction();
            authorTx.setWalletId(authorWallet.getId());
            authorTx.setUserId(authorId);
            authorTx.setOrderId(orderId);
            authorTx.setBookId(book.getId());
            authorTx.setAmount(itemAuthorIncome);
            authorTx.setTransactionType("INCOME");
            authorTx.setDescription(
                    "Doanh thu từ sách: " + book.getTitle() + " (x" + item.getQuantity() + ")");
            walletTransactionRepository.save(authorTx);

            Wallet adminWallet = walletRepository.findByUserId(7).orElseGet(() -> {
                Wallet wallet = new Wallet();
                wallet.setUserId(7);
                wallet.setBalance(BigDecimal.ZERO);
                return walletRepository.save(wallet);
            });
            adminWallet.setBalance(adminWallet.getBalance().add(itemPlatformIncome));
            walletRepository.save(adminWallet);
        }

        order.setAuthorIncome(authorIncome);
        order.setPlatformIncome(platformIncome);
        orderRepo.save(order);
    }

    // ── 4. Lấy đơn hàng theo user ────────────────────────────────────────────
    public List<Order> getOrdersByUser(int userId) {
        return orderRepo.findByUserId(userId);
    }

    // ── 5. Lấy đơn hàng theo chi nhánh ──────────────────────────────────────
    public List<Order> getOrdersByBranch(int branchId) {
        return orderRepo.findByBranchId(branchId);
    }

    // ── 6. Cập nhật trạng thái đơn hàng ─────────────────────────────────────
    @Transactional
    public Order updateStatus(int orderId, String newStatus) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

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
