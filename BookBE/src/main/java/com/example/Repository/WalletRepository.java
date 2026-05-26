package com.example.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Entities.Wallet;

public interface WalletRepository extends JpaRepository<Wallet, Integer> {

    Optional<Wallet> findByUserId(int userId);

}
