package com.example.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.Entities.Book;

public interface BookRepository extends JpaRepository<Book, Integer> {

        List<Book> findByAuthorId(int authorId);

        // SEARCH CÓ PHÂN TRANG
        @Query("""
                            SELECT b FROM Book b
                            WHERE (:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND (:categoryId IS NULL OR b.category.id = :categoryId)
                        """)
        Page<Book> searchByKeywordAndCategory(@Param("keyword") String keyword,
                        @Param("categoryId") Integer categoryId, Pageable pageable);
}
