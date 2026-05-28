package com.example.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import com.example.Entities.BookCategory;
import com.example.Entities.BookCategoryId;

public interface BookCategoryRepository extends JpaRepository<BookCategory, BookCategoryId> {

    // Lấy tất cả category của 1 book
    List<BookCategory> findByBookId(Integer bookId);

    // Xóa toàn bộ category của 1 book (dùng khi update)
    @Modifying
    @Transactional
    @Query("DELETE FROM BookCategory bc WHERE bc.book.id = :bookId")
    void deleteAllByBookId(Integer bookId);

    // Kiểm tra quan hệ đã tồn tại chưa
    boolean existsByBookIdAndCategoryId(Integer bookId, Integer categoryId);
}
