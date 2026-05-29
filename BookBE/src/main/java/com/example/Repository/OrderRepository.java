package com.example.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Entities.Order;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(int userId);

    List<Order> findByBranchId(int branchId);

    List<Order> findByStatus(String status);
}
