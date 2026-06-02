package com.example.Config;

import java.io.File;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry; // Thêm import này
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    private final AuthInterceptor authInterceptor;

    public WebConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Bean
    public WebMvcConfigurer webMvcConfigurer() {

        return new WebMvcConfigurer() {

            // 1. CẤU HÌNH ĐƯỜNG DẪN ĐỂ LẤY ẢNH (QUAN TRỌNG NHẤT)
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // Lấy đường dẫn và chuẩn hóa toàn bộ dấu gạch chéo thành "/" dạng chuẩn của URL
                String userStaticPath =
                        new File("uploads/users").getAbsolutePath().replace("\\", "/");

                System.out.println("====================================================");
                System.out.println("👉 ĐƯỜNG DẪN ĐÃ CHUẨN HÓA: " + userStaticPath);
                System.out.println("====================================================");

                // Điểm cốt lõi: Phải có dấu "/" ở cuối chuỗi "file:" để Spring hiểu đây là một thư
                // mục (Directory)
                registry.addResourceHandler("/uploads/users/**")
                        .addResourceLocations("file:" + userStaticPath + "/");
            }

            // 2. CẤU HÌNH CORS
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*").exposedHeaders("Authorization");
            }

            // 3. CẤU HÌNH INTERCEPTOR (CHẶN TOKEN)
            @Override
            public void addInterceptors(InterceptorRegistry registry) {
                // Hiện tại bạn chặn /api/** nên đường dẫn tĩnh /uploads/** sẽ KHÔNG bị dính
                // Interceptor.
                // Nhưng nếu sau này bạn đổi cấu hình chặn thành "/**", nhớ loại trừ (exclude) cả
                // "/uploads/**" nhé.
                registry.addInterceptor(authInterceptor).addPathPatterns("/api/**")
                        .excludePathPatterns("/api/auth/**", "/api/payments/webhook");
            }
        };
    }
}
