package com.example.Repository;

import com.example.Entities.Inventory;
import com.example.Entities.InventoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, InventoryId> {

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM Inventory i WHERE i.bookId = :bookId")
    int sumQuantityByBookId(@Param("bookId") int bookId);

    List<Inventory> findByBookId(int bookId);

    Optional<Inventory> findByBookIdAndBranchId(int bookId, int branchId);
}