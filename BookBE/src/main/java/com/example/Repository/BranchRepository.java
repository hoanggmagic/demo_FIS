package com.example.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Entities.Branch;

public interface BranchRepository extends JpaRepository<Branch, Integer> {
}
