package com.example.Service.ServiceImpl;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.Entities.User;
import com.example.Repository.UserRepository;
import com.example.Service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(int id) {
        return userRepository.findById(id);
    }

    @Override
    public User createUser(User user) {
        // Kiểm tra xem trùng lặp username hoặc email chưa
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Tên đăng nhập này đã tồn tại!");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email này đã được đăng ký!");
        }

        // Cài đặt mặc định khi tạo mới tài khoản
        user.setActive(true);
        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        return userRepository.save(user);
    }

    @Override
    public User updateUser(int id, User userDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        // Cập nhật các thông tin cơ bản được phép sửa
        existingUser.setFullName(userDetails.getFullName());
        existingUser.setAvatarUrl(userDetails.getAvatarUrl());
        existingUser.setBiography(userDetails.getBiography());
        existingUser.setNationality(userDetails.getNationality());

        // Nếu thay đổi mật khẩu thì cần cập nhật (thực tế nên mã hóa trước khi lưu)
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            existingUser.setPassword(userDetails.getPassword());
        }

        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(int id) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        // Thường các hệ thống lớn sẽ hạn chế xóa cứng (Hard Delete) khỏi DB,
        // thay vào đó họ sẽ đổi active thành false (Soft Delete)
        existingUser.setActive(false);
        userRepository.save(existingUser);

        // Hoặc nếu muốn xóa hẳn khỏi DB thì dùng: userRepository.delete(existingUser);
    }

    @Override
    public User toggleUserStatus(int id) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        // Đảo ngược trạng thái hoạt động (Active <-> Inactive)
        existingUser.setActive(!existingUser.isActive());
        return userRepository.save(existingUser);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }
}
