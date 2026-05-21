package com.example.Service;

import java.util.List;
import java.util.Optional;
import com.example.Entities.User;

public interface UserService {
    // Lấy danh sách tất cả người dùng
    List<User> getAllUsers();

    // Tìm user theo ID
    Optional<User> getUserById(int id);

    // Đăng ký hoặc thêm mới một user
    User createUser(User user);

    // Cập nhật thông tin user
    User updateUser(int id, User userDetails);

    // Xóa user (hoặc chuyển trạng thái active = false)
    void deleteUser(int id);

    // Khóa hoặc kích hoạt lại tài khoản
    User toggleUserStatus(int id);

    Optional<User> findByEmail(String email);

    User save(User user);
}
