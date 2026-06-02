package com.example.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.Entities.WalletTransaction;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Integer> {

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(int walletId);

    // Lấy toàn bộ giao dịch INCOME của tác giả, kèm tên sách
    @Query(value = """
            SELECT
                wt.id,
                wt.amount,
                wt.description,
                wt.created_at,
                wt.order_id,
                wt.book_id,
                b.title AS book_title
            FROM wallet_transactions wt
            LEFT JOIN books b ON wt.book_id = b.id
            WHERE wt.user_id = :userId
              AND wt.transaction_type = 'INCOME'
            ORDER BY wt.created_at DESC
            """, nativeQuery = true)
    List<Object[]> findIncomeByUserId(@Param("userId") int userId);

    // Tổng doanh thu theo từng sách
    @Query(value = """
            SELECT
                wt.book_id,
                b.title AS book_title,
                SUM(wt.amount) AS total_income,
                COUNT(*) AS total_orders
            FROM wallet_transactions wt
            LEFT JOIN books b ON wt.book_id = b.id
            WHERE wt.user_id = :userId
              AND wt.transaction_type = 'INCOME'
            GROUP BY wt.book_id, b.title
            ORDER BY total_income DESC
            """, nativeQuery = true)
    List<Object[]> findIncomeGroupByBook(@Param("userId") int userId);
}
