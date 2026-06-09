package com.example.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.Entities.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrderId(int orderId);

    @Query(value = """
            SELECT oi.book_id AS bookId, COALESCE(SUM(oi.quantity), 0) AS totalSold
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status = 'SUCCESS'
              AND oi.book_id IN (:bookIds)
            GROUP BY oi.book_id
            """, nativeQuery = true)
    List<Object[]> sumSoldByBookIds(@Param("bookIds") List<Integer> bookIds);
}
