package com.example.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.Entities.Book;
import com.example.Entities.BookCategory;
import com.example.Entities.BookCategoryId;
import com.example.Entities.Category;
import com.example.Repository.BookCategoryRepository;
import com.example.Repository.BookRepository;
import com.example.Repository.CategoryRepository;
import com.example.dto.CategoryDTO;
import com.example.dto.CategoryTreeDTO;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepo;
    private final BookCategoryRepository bookCategoryRepo;
    private final BookRepository bookRepo;

    public CategoryService(CategoryRepository categoryRepo, BookCategoryRepository bookCategoryRepo,
            BookRepository bookRepo) {
        this.categoryRepo = categoryRepo;
        this.bookCategoryRepo = bookCategoryRepo;
        this.bookRepo = bookRepo;
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public List<Category> getAll() {
        return categoryRepo.findAll();
    }

    public Category getById(Integer id) {
        return categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục id=" + id));
    }

    public Category create(CategoryDTO dto) {
        Category cat = new Category();
        cat.setName(dto.getName());
        cat.setDescription(dto.getDescription());
        cat.setCreatedAt(Timestamp.from(Instant.now()));
        cat.setUpdatedAt(Timestamp.from(Instant.now()));

        if (dto.getParentId() != null) {
            Category parent = getById(dto.getParentId());
            cat.setParent(parent);
        }

        return categoryRepo.save(cat);
    }

    public Category update(Integer id, CategoryDTO dto) {
        Category cat = getById(id);
        cat.setName(dto.getName());
        cat.setDescription(dto.getDescription());
        cat.setUpdatedAt(Timestamp.from(Instant.now()));

        if (dto.getParentId() != null) {
            // Không cho phép set chính nó làm parent
            if (dto.getParentId().equals(id)) {
                throw new RuntimeException("Không thể chọn chính nó làm danh mục cha");
            }
            Category parent = getById(dto.getParentId());
            cat.setParent(parent);
        } else {
            cat.setParent(null); // chuyển thành danh mục gốc
        }

        return categoryRepo.save(cat);
    }

    public void delete(Integer id) {
        if (categoryRepo.existsByParentId(id)) {
            throw new RuntimeException("Danh mục này còn danh mục con, không thể xóa");
        }
        categoryRepo.deleteById(id);
    }

    // ── Cây parent → children ─────────────────────────────────────────────────

    public List<CategoryTreeDTO> getTree() {
        // Lấy tất cả danh mục gốc rồi build cây đệ quy
        return categoryRepo.findByParentIsNull().stream().map(this::toTreeDTO)
                .collect(Collectors.toList());
    }

    private CategoryTreeDTO toTreeDTO(Category cat) {
        CategoryTreeDTO dto = new CategoryTreeDTO(cat.getId(), cat.getName(), cat.getDescription(),
                cat.getParent() != null ? cat.getParent().getId() : null);

        // Đệ quy build children
        List<CategoryTreeDTO> children =
                cat.getChildren().stream().map(this::toTreeDTO).collect(Collectors.toList());

        dto.setChildren(children);
        return dto;
    }

    // ── BookCategory ──────────────────────────────────────────────────────────

    public void addCategoryToBook(Integer bookId, Integer categoryId) {
        if (bookCategoryRepo.existsByBookIdAndCategoryId(bookId, categoryId)) {
            throw new RuntimeException("Book đã có danh mục này rồi");
        }

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách id=" + bookId));
        Category cat = getById(categoryId);

        BookCategory bc = new BookCategory();
        bc.setId(new BookCategoryId(bookId, categoryId));
        bc.setBook(book);
        bc.setCategory(cat);

        bookCategoryRepo.save(bc);
    }

    public void removeCategoryFromBook(Integer bookId, Integer categoryId) {
        BookCategoryId bcId = new BookCategoryId(bookId, categoryId);
        if (!bookCategoryRepo.existsById(bcId)) {
            throw new RuntimeException("Quan hệ này không tồn tại");
        }
        bookCategoryRepo.deleteById(bcId);
    }

    @Transactional
    public void updateBookCategories(Integer bookId, List<Integer> categoryIds) {
        // Xóa toàn bộ category cũ rồi gán lại
        bookCategoryRepo.deleteAllByBookId(bookId);

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách id=" + bookId));

        for (Integer categoryId : categoryIds) {
            Category cat = getById(categoryId);
            BookCategory bc = new BookCategory();
            bc.setId(new BookCategoryId(bookId, categoryId));
            bc.setBook(book);
            bc.setCategory(cat);
            bookCategoryRepo.save(bc);
        }
    }

    public List<Category> getCategoriesByBook(Integer bookId) {
        return bookCategoryRepo.findByBookId(bookId).stream().map(bc -> bc.getCategory())
                .collect(Collectors.toList());
    }
}
