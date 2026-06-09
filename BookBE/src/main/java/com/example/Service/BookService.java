package com.example.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.example.Entities.Book;
import com.example.Entities.BookImage;
import com.example.Entities.BookPrice;
import com.example.Entities.User;
import com.example.Repository.BookImageRepository;
import com.example.Repository.BookRepository;
import com.example.Repository.InventoryRepository;
import com.example.Repository.UserRepository;
import com.example.Util.AuthContext;
import com.example.Util.PasswordUtil;
import com.example.dto.AuthorRequest;
import com.example.dto.BookDTO;
import com.example.dto.PaginationResponse;

@Service
public class BookService {

    private final BookRepository bookRepo;
    private final BookImageRepository imageRepo;
    private final UserRepository userRepo;
    private final PasswordUtil passwordUtil;
    private final InventoryRepository inventoryRepo;

    public BookService(BookRepository bookRepo, BookImageRepository imageRepo,
            UserRepository userRepo, PasswordUtil passwordUtil, InventoryRepository inventoryRepo) {
        this.bookRepo = bookRepo;
        this.imageRepo = imageRepo;
        this.userRepo = userRepo;
        this.passwordUtil = passwordUtil;
        this.inventoryRepo = inventoryRepo;
    }

    public double getEffectivePrice(int bookId) {
        return bookRepo.findById(bookId).map(book -> {
            BookPrice bp = book.getBookPrice();
            if (bp == null)
                return 0.0;
            LocalDateTime now = LocalDateTime.now();
            Double salePrice = bp.getSalePrice();
            boolean hasSale = salePrice > 0 && bp.getSaleStart() != null && bp.getSaleEnd() != null
                    && now.isAfter(bp.getSaleStart()) && now.isBefore(bp.getSaleEnd());
            return hasSale ? salePrice : bp.getOriginalPrice();
        }).orElse(0.0);
    }

    private BookDTO toDTO(Book book) {
        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setDescription(book.getDescription());
        dto.setPublishedYear(book.getPublishedYear());
        dto.setStatus(book.getStatus());
        dto.setAuthorId(book.getAuthorId());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());

        // authorName từ userRepo
        userRepo.findById(book.getAuthorId())
                .ifPresent(author -> dto.setAuthorName(author.getFullName()));

        // quantity tổng từ inventories
        dto.setQuantity(inventoryRepo.sumQuantityByBookId(book.getId()));

        if (book.getCategory() != null) {
            dto.setCategoryId(book.getCategory().getId());
            dto.setCategoryName(book.getCategory().getName());
        }

        dto.setImages(imageRepo.findByBookId(book.getId()).stream().map(BookImage::getImageUrl)
                .collect(Collectors.toList()));

        BookPrice bp = book.getBookPrice();
        if (bp != null) {
            Double original = bp.getOriginalPrice() != null ? bp.getOriginalPrice() : 0.0;
            Double salePrice = bp.getSalePrice();
            dto.setOriginalPrice(original);
            LocalDateTime now = LocalDateTime.now();
            boolean hasSale = salePrice > 0 && bp.getSaleStart() != null && bp.getSaleEnd() != null
                    && now.isAfter(bp.getSaleStart()) && now.isBefore(bp.getSaleEnd());
            if (hasSale) {
                dto.setDiscountedPrice(salePrice);
                dto.setPrice(salePrice);
                dto.setDiscountPercent((original - salePrice) / original * 100);
            } else {
                dto.setDiscountedPrice(original);
                dto.setPrice(original);
                dto.setDiscountPercent(0.0);
            }
        } else {
            dto.setOriginalPrice(0.0);
            dto.setDiscountedPrice(0.0);
            dto.setPrice(0.0);
            dto.setDiscountPercent(0.0);
        }

        return dto;
    }

    public List<BookDTO> getBooksForContext(AuthContext ctx) {
        List<Book> books =
                (ctx != null && ctx.isAuthor()) ? bookRepo.findByAuthorId(ctx.getUserId())
                        : bookRepo.findAll();
        return books.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public BookDTO getBookById(int id, AuthContext ctx) {
        Book book = bookRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sách"));
        assertCanAccessBook(book, ctx);
        return toDTO(book);
    }

    public List<BookDTO> searchBooks(String keyword, Integer categoryId, AuthContext ctx) {

        Pageable pageable = PageRequest.of(0, 1000);

        List<Book> books =
                bookRepo.searchByKeywordAndCategory(keyword, categoryId, pageable).getContent();

        return books.stream()
                .filter(b -> ctx == null || !ctx.isAuthor() || b.getAuthorId() == ctx.getUserId())
                .map(this::toDTO).collect(Collectors.toList());
    }


    public PaginationResponse<BookDTO> getBooksPagination(String keyword, List<Integer> categoryIds,
            int page, int size, AuthContext ctx, String priceFilter, String specialFilter) {

        Pageable pageable = PageRequest.of(page, size);

        // Parse priceFilter "50000-100000" → min/max
        Double minPrice = null;
        Double maxPrice = null;
        if (priceFilter != null && priceFilter.contains("-")) {
            String[] parts = priceFilter.split("-");
            try {
                minPrice = Double.parseDouble(parts[0]);
                maxPrice = Double.parseDouble(parts[1]);
            } catch (Exception ignored) {
            }
        }

        boolean onlySale = "sale".equals(specialFilter);

        boolean hasCat = categoryIds != null && !categoryIds.isEmpty();
        boolean hasFilter = minPrice != null || maxPrice != null || onlySale;

        Page<Book> bookPage;
        if (hasCat) {
            bookPage = bookRepo.searchWithFilters(keyword, categoryIds, minPrice, maxPrice,
                    onlySale, pageable);
        } else if (hasFilter) {
            bookPage = bookRepo.searchWithFiltersNoCat(keyword, minPrice, maxPrice, onlySale,
                    pageable);
        } else {
            bookPage = bookRepo.searchByKeywordAndCategory(keyword, null, pageable);
        }

        // "bestseller" → sắp xếp theo quantity giảm dần (lọc sau khi query)
        List<BookDTO> content = bookPage.getContent().stream()
                .filter(b -> ctx == null || !ctx.isAuthor() || b.getAuthorId() == ctx.getUserId())
                .map(this::toDTO).collect(Collectors.toList());

        if ("bestseller".equals(specialFilter)) {
            content.sort((a, b2) -> Integer.compare(b2.getQuantity() != null ? b2.getQuantity() : 0,
                    a.getQuantity() != null ? a.getQuantity() : 0));
        }

        return new PaginationResponse<>(content, page, size, bookPage.getTotalElements(),
                bookPage.getTotalPages());
    }


    @Transactional
    public BookDTO addBook(Book book, double price, AuthContext ctx) {
        validatePublishedYear(book.getPublishedYear());
        resolveAuthorId(book, ctx);
        validatePrice(price);
        if (book.getStatus() == null)
            book.setStatus("ACTIVE");
        BookPrice bp = new BookPrice();
        bp.setOriginalPrice(price);
        bp.setBook(book);
        book.setBookPrice(bp);
        Book saved = bookRepo.save(book);
        return toDTO(saved);
    }

    @Transactional
    public BookDTO addBookWithImages(Book book, double price, MultipartFile[] images,
            AuthContext ctx) throws IOException {
        BookDTO dto = addBook(book, price, ctx);
        if (images != null && images.length > 0)
            saveImages(dto.getId(), images);
        return getBookById(dto.getId(), ctx);
    }

    @Transactional
    public BookDTO updateBook(int id, Book incoming, Double price, AuthContext ctx) {
        validatePublishedYear(incoming.getPublishedYear());
        Book existing = bookRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sách"));
        assertCanModifyBook(existing, ctx);
        existing.setTitle(incoming.getTitle());
        existing.setDescription(incoming.getDescription() != null ? incoming.getDescription()
                : existing.getDescription());
        existing.setPublishedYear(incoming.getPublishedYear());
        existing.setStatus(
                incoming.getStatus() != null ? incoming.getStatus() : existing.getStatus());
        existing.setCategory(incoming.getCategory());
        if (ctx.isAdmin() && incoming.getAuthorId() > 0)
            existing.setAuthorId(incoming.getAuthorId());
        if (price != null && price > 0) {
            BookPrice bp = existing.getBookPrice();
            if (bp == null) {
                bp = new BookPrice();
                bp.setBook(existing);
                existing.setBookPrice(bp);
            }
            bp.setOriginalPrice(price);
        }
        bookRepo.save(existing);
        return toDTO(existing);
    }

    @Transactional
    public void deleteBook(int id, AuthContext ctx) {
        Book existing = bookRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sách"));
        assertCanModifyBook(existing, ctx);
        bookRepo.deleteById(id);
    }

    @Transactional
    public void updateBookImages(int bookId, MultipartFile[] images) throws IOException {
        if (images == null || images.length == 0)
            return;
        if (images.length > 5)
            throw new IllegalArgumentException("Tối đa 5 ảnh");
        imageRepo.deleteByBookId(bookId);
        saveImages(bookId, images);
    }

    private void saveImages(int bookId, MultipartFile[] images) throws IOException {
        if (images.length > 5)
            throw new IllegalArgumentException("Tối đa 5 ảnh");
        String uploadDir = "uploads/books/";
        new File(uploadDir).mkdirs();
        for (MultipartFile file : images) {
            if (!file.isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                Files.write(Paths.get(uploadDir + fileName), file.getBytes());
                BookImage img = new BookImage();
                img.setBookId(bookId);
                img.setImageUrl(fileName);
                imageRepo.save(img);
            }
        }
    }

    public List<User> getAuthors(AuthContext ctx) {
        if (ctx.isAdmin())
            return userRepo.findByRole("AUTHOR");
        if (ctx.isAuthor())
            return userRepo.findById(ctx.getUserId()).map(List::of).orElse(List.of());
        return userRepo.findByRoleAndActive("AUTHOR", true);
    }

    @Transactional
    public void createAuthor(AuthorRequest req, AuthContext ctx) {
        if (!ctx.isAdmin())
            throw new IllegalArgumentException("Chỉ ADMIN được tạo tác giả");
        if (req.getUsername() == null || req.getUsername().isBlank())
            throw new IllegalArgumentException("Username không được trống");
        if (req.getPassword() == null || req.getPassword().length() < 6)
            throw new IllegalArgumentException("Mật khẩu tối thiểu 6 ký tự");
        if (userRepo.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("Username đã tồn tại");
        User user = new User();
        user.setUsername(req.getUsername().trim());
        user.setEmail(req.getEmail() != null ? req.getEmail().trim()
                : req.getUsername() + "@platform.local");
        user.setPassword(passwordUtil.hash(req.getPassword()));
        user.setFullName(req.getName());
        user.setNationality(req.getNationality());
        user.setBiography(req.getBiography());
        user.setRole("AUTHOR");
        user.setActive(true);
        userRepo.save(user);
    }

    @Transactional
    public boolean toggleAuthorStatus(int id, AuthContext ctx) {
        if (!ctx.isAdmin())
            throw new IllegalArgumentException("Chỉ ADMIN được thay đổi trạng thái");
        User user = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user"));
        user.setActive(!user.isActive());
        userRepo.save(user);
        return user.isActive();
    }

    @Transactional
    public void updateAuthorById(int id, AuthorRequest req, AuthContext ctx) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tác giả"));
        if (req.getName() != null)
            user.setFullName(req.getName());
        if (req.getEmail() != null)
            user.setEmail(req.getEmail());
        if (req.getNationality() != null)
            user.setNationality(req.getNationality());
        if (req.getBiography() != null)
            user.setBiography(req.getBiography());
        userRepo.save(user);
    }

    @Transactional
    public void updatePrice(int bookId, double price) {
        validatePrice(price);
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sách"));
        BookPrice bp = book.getBookPrice();
        if (bp == null) {
            bp = new BookPrice();
            bp.setBook(book);
            book.setBookPrice(bp);
        }
        bp.setOriginalPrice(price);
        bookRepo.save(book);
    }

    private void validatePublishedYear(int year) {
        int currentYear = Calendar.getInstance().get(Calendar.YEAR);
        if (year > currentYear)
            throw new IllegalArgumentException(
                    "Năm xuất bản không được vượt quá năm hiện tại: " + currentYear);
    }

    private void validatePrice(double price) {
        if (price <= 0)
            throw new IllegalArgumentException("Giá sách phải lớn hơn 0");
    }

    private void resolveAuthorId(Book book, AuthContext ctx) {
        if (ctx.isAuthor())
            book.setAuthorId(ctx.getUserId());
        else if (ctx.isAdmin()) {
            if (book.getAuthorId() <= 0)
                throw new IllegalArgumentException("Tác giả không hợp lệ");
        } else
            throw new IllegalArgumentException("Không có quyền thêm sách");
    }

    private void assertCanAccessBook(Book book, AuthContext ctx) {
        if (ctx == null)
            return;
        if (ctx.isAuthor() && book.getAuthorId() != ctx.getUserId())
            throw new IllegalArgumentException("Không có quyền xem sách này");
    }

    private void assertCanModifyBook(Book book, AuthContext ctx) {
        if (ctx == null)
            throw new IllegalArgumentException("Chưa đăng nhập");
        if (ctx.isAdmin())
            return;
        if (ctx.isAuthor() && book.getAuthorId() == ctx.getUserId())
            return;
        throw new IllegalArgumentException("Không có quyền sửa/xóa sách này");
    }

    public void addAuthorDemo(String fullName, String nationality) {
        User user = new User();
        String username = "author_" + System.currentTimeMillis();
        user.setUsername(username);
        user.setEmail(username + "@platform.local");
        user.setPassword(passwordUtil != null ? passwordUtil.hash("author123") : "author123");
        user.setFullName(fullName);
        user.setNationality(nationality);
        user.setRole("AUTHOR");
        user.setActive(true);
        userRepo.save(user);
    }

    public List<User> getAllAuthors() {
        return userRepo.findByRole("AUTHOR");
    }

    public List<Book> getAllBooks() {
        return bookRepo.findAll();
    }


    public List<Book> searchBooks(String keyword) {

        Pageable pageable = PageRequest.of(0, 1000);

        return bookRepo.searchByKeywordAndCategory(keyword, null, pageable).getContent();
    }

}
