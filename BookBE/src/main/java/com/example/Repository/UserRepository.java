package com.example.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.Entities.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Các hàm phục vụ cho BookService
    List<User> findByRole(String role);

    List<User> findByRoleAndActive(String role, boolean active);

    boolean existsByUsername(String username);

    // --- THÊM 2 DÒNG NÀY ĐỂ PHỤC VỤ CHO USER_SERVICE ---
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
}
