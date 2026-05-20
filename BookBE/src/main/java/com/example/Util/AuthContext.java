package com.example.Util;

public class AuthContext {
    private final int userId;
    private final String username;
    private final String role;

    public AuthContext(int userId, String username, String role) {
        this.userId = userId;
        this.username = username;
        this.role = role;
    }

    public int getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }

    public boolean isAuthor() {
        return "AUTHOR".equals(role);
    }

    public boolean isUser() {
        return "USER".equals(role);
    }
}
