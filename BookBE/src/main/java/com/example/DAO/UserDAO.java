package com.example.DAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import com.example.Entities.Author;
import com.example.Entities.User;
import com.example.Util.PasswordUtil;

public class UserDAO {
    private final Connection connection;

    public UserDAO(Connection connection) {
        this.connection = connection;
    }

    public User findByUsername(String username) throws SQLException {
        String query =
                "SELECT id, username, email, password, full_name, nationality, biography, role, is_active "
                        + "FROM users WHERE username = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, username);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapUser(rs);
                }
            }
        }
        return null;
    }

    public User getUserById(int id) throws SQLException {
        String query =
                "SELECT id, username, email, password, full_name, nationality, biography, role, is_active "
                        + "FROM users WHERE id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapUser(rs);
                }
            }
        }
        return null;
    }

    public List<Author> getAllAuthors() throws SQLException {
        List<Author> authors = new ArrayList<>();
        String query = "SELECT id, username, email, full_name, nationality, biography, is_active "
                + "FROM users WHERE role = 'AUTHOR' ORDER BY id";
        try (Statement stmt = connection.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                authors.add(mapAuthor(rs));
            }
        }
        return authors;
    }

    public List<Author> getActiveAuthors() throws SQLException {
        List<Author> authors = new ArrayList<>();
        String query = "SELECT id, username, email, full_name, nationality, biography, is_active "
                + "FROM users WHERE role = 'AUTHOR' AND is_active = TRUE ORDER BY id";
        try (Statement stmt = connection.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                authors.add(mapAuthor(rs));
            }
        }
        return authors;
    }

    public Author getAuthorById(int id) throws SQLException {
        String query = "SELECT id, username, email, full_name, nationality, biography, is_active "
                + "FROM users WHERE id = ? AND role = 'AUTHOR'";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapAuthor(rs);
                }
            }
        }
        return null;
    }

    public boolean isAuthor(int userId) throws SQLException {
        String query = "SELECT 1 FROM users WHERE id = ? AND role = 'AUTHOR' AND is_active = TRUE";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        }
    }

    public boolean usernameExists(String username) throws SQLException {
        String query = "SELECT 1 FROM users WHERE username = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, username);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        }
    }

    public int insertAuthor(User user) throws SQLException {
        String query =
                "INSERT INTO users (username, email, password, full_name, nationality, biography, role) "
                        + "VALUES (?, ?, ?, ?, ?, ?, 'AUTHOR') RETURNING id";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, user.getUsername());
            pstmt.setString(2, user.getEmail());
            pstmt.setString(3, user.getPassword());
            pstmt.setString(4, user.getFullName());
            pstmt.setString(5, user.getNationality());
            pstmt.setString(6, user.getBiography());
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    int userId = rs.getInt("id");
                    createWalletForUser(userId);
                    return userId;
                }
            }
        }
        throw new SQLException("Không tạo được tác giả");
    }

    public void updateAuthor(Author author) throws SQLException {
        String query = "UPDATE users SET full_name = ?, nationality = ?, biography = ? "
                + "WHERE id = ? AND role = 'AUTHOR'";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, author.getName());
            pstmt.setString(2, author.getNationality());
            pstmt.setString(3, author.getBiography());
            pstmt.setInt(4, author.getId());
            pstmt.executeUpdate();
        }
    }

    public boolean toggleAuthorStatus(int id) throws SQLException {

        String selectSql = "SELECT is_active FROM users WHERE id = ?";

        boolean current;

        try (PreparedStatement ps = connection.prepareStatement(selectSql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();

            if (!rs.next()) {
                throw new IllegalArgumentException("Không tìm thấy user");
            }

            current = rs.getBoolean("is_active");
        }

        boolean newStatus = !current;

        String updateSql = "UPDATE users SET is_active = ? WHERE id = ?";

        try (PreparedStatement ps = connection.prepareStatement(updateSql)) {
            ps.setBoolean(1, newStatus);
            ps.setInt(2, id);
            ps.executeUpdate();
        }

        return newStatus;
    }

    public void ensureDemoPasswords(PasswordUtil passwordUtil) throws SQLException {
        updatePasswordIfNeeded("admin", "admin123", passwordUtil);
        updatePasswordIfNeeded("hoang_author", "author123", passwordUtil);
        updatePasswordIfNeeded("user01", "user123", passwordUtil);
    }

    public int insertUser(User user) throws SQLException {

        String query = """
                    INSERT INTO users
                    (username, email, password, full_name, role)
                    VALUES (?, ?, ?, ?, 'USER')
                    RETURNING id
                """;

        try (PreparedStatement pstmt = connection.prepareStatement(query)) {

            pstmt.setString(1, user.getUsername());
            pstmt.setString(2, user.getEmail());
            pstmt.setString(3, user.getPassword());
            pstmt.setString(4, user.getFullName());

            try (ResultSet rs = pstmt.executeQuery()) {

                if (rs.next()) {

                    int userId = rs.getInt("id");

                    createWalletForUser(userId);

                    return userId;
                }
            }
        }

        throw new SQLException("Không tạo được user");
    }

    private void updatePasswordIfNeeded(String username, String rawPassword,
            PasswordUtil passwordUtil) throws SQLException {
        User user = findByUsername(username);
        if (user == null) {
            return;
        }
        String stored = user.getPassword();
        if (stored != null && (stored.startsWith("$2a$") || stored.startsWith("$2b$"))) {
            if (passwordUtil.matches(rawPassword, stored)) {
                return;
            }
        }
        String hashed = passwordUtil.hash(rawPassword);
        String query = "UPDATE users SET password = ? WHERE username = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, hashed);
            pstmt.setString(2, username);
            pstmt.executeUpdate();
        }
    }

    private void createWalletForUser(int userId) throws SQLException {
        String query = "INSERT INTO wallets (user_id, balance) VALUES (?, 0) "
                + "ON CONFLICT (user_id) DO NOTHING";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, userId);
            pstmt.executeUpdate();
        }
    }

    private User mapUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setPassword(rs.getString("password"));
        user.setFullName(rs.getString("full_name"));
        user.setNationality(rs.getString("nationality"));
        user.setBiography(rs.getString("biography"));
        user.setRole(rs.getString("role"));
        user.setActive(rs.getBoolean("is_active"));
        return user;
    }

    private Author mapAuthor(ResultSet rs) throws SQLException {
        Author author =
                new Author(rs.getInt("id"), rs.getString("full_name"), rs.getString("nationality"));
        author.setUsername(rs.getString("username"));
        author.setEmail(rs.getString("email"));
        author.setBiography(rs.getString("biography"));
        author.setActive(rs.getBoolean("is_active"));
        return author;
    }

    public User findById(int id) throws SQLException {
        String sql = "SELECT * FROM users WHERE id = ?";

        PreparedStatement ps = connection.prepareStatement(sql);
        ps.setInt(1, id);

        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            User user = new User();
            user.setId(rs.getInt("id"));
            user.setUsername(rs.getString("username"));
            user.setPassword(rs.getString("password"));
            user.setActive(rs.getBoolean("is_active")); // cũng nên sửa luôn
            return user;
        }

        return null;
    }

    public void updateStatus(int id, boolean active) throws SQLException {
        String sql = "UPDATE users SET is_active = ? WHERE id = ?";

        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setBoolean(1, active);
            ps.setInt(2, id);

            ps.executeUpdate();
        }
    }
    
}
