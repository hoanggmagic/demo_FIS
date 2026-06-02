package com.example.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.Entities.BookDiscount;

public interface BookDiscountRepository extends JpaRepository<BookDiscount, Integer> {

    // Tìm discount đang active của 1 sách tại thời điểm hiện tại
    @Query(value = """
            SELECT * FROM book_discounts
            WHERE book_id = :bookId
              AND status = 'ACTIVE'
              AND NOW() BETWEEN start_date AND end_date
            LIMIT 1
            """, nativeQuery = true)
    Optional<BookDiscount> findActiveDiscount(@Param("bookId") int bookId);

    List<BookDiscount> findByBookId(int bookId);
}