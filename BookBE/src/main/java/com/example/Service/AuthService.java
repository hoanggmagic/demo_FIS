package com.example.Service;

import com.example.DAO.UserDAO;
import com.example.Entities.User;
import com.example.Util.PasswordUtil;
import com.example.dto.UserProfile;
import java.sql.Connection;
import java.sql.SQLException;

public class AuthService {
    private final UserDAO userDAO;
    private final PasswordUtil passwordUtil;

    public AuthService(Connection connection, PasswordUtil passwordUtil) {
        this.userDAO = new UserDAO(connection);
        this.passwordUtil = passwordUtil;
    }

    public User login(String username, String password) throws SQLException {
        User user = userDAO.findByUsername(username);
        if (user == null || !user.isActive()) {
            throw new IllegalArgumentException("Sai tên đăng nhập hoặc mật khẩu");
        }
        if (!passwordUtil.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Sai tên đăng nhập hoặc mật khẩu");
        }
        return user;
    }

    public static UserProfile toProfile(User user) {
        UserProfile profile = new UserProfile();
        profile.setId(user.getId());
        profile.setUsername(user.getUsername());
        profile.setEmail(user.getEmail());
        profile.setFullName(user.getFullName());
        profile.setRole(user.getRole());
        profile.setNationality(user.getNationality());
        profile.setBiography(user.getBiography());
        return profile;
    }
}
