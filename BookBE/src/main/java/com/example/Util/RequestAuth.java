package com.example.Util;

import com.example.Config.AuthInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class RequestAuth {
    private RequestAuth() {}

    public static AuthContext require(HttpServletRequest request) {
        AuthContext ctx = (AuthContext) request.getAttribute(AuthInterceptor.ATTR_AUTH);
        if (ctx == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }
        return ctx;
    }

    public static void requireAdmin(AuthContext ctx) {
        if (!ctx.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ ADMIN được phép");
        }
    }

    public static void requireAdminOrAuthor(AuthContext ctx) {
        if (!ctx.isAdmin() && !ctx.isAuthor()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền");
        }
    }
}
