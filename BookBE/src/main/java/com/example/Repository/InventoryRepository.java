package com.example.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Entities.Inventory;
import com.example.Entities.InventoryId;

public interface InventoryRepository extends JpaRepository<Inventory, InventoryId> {
    List<Inventory> findByBookId(int bookId);

    List<Inventory> findByBranchId(int branchId);

    Optional<Inventory> findByBookIdAndBranchId(int bookId, int branchId);
}
