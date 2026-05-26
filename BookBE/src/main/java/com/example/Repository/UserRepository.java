package com.example.Repository;

import com.example.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    // Tìm kiếm user bằng email (thường dùng cho Đăng nhập / Quên mật khẩu)
    Optional<User> findByEmail(String email);
    
    // Tìm kiếm user bằng tên đăng nhập
    Optional<User> findByUsername(String username);
    
    // Kiểm tra xem email hoặc username đã tồn tại chưa (dùng khi Đăng ký)
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}