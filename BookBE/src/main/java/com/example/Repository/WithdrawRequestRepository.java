package com.example.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Entities.WithdrawRequest;

public interface WithdrawRequestRepository extends JpaRepository<WithdrawRequest, Integer> {

    List<WithdrawRequest> findByUserIdOrderByCreatedAtDesc(int userId);

}
