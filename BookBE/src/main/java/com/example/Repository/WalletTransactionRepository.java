package com.example.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Entities.WalletTransaction;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Integer> {

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(int walletId);

}
