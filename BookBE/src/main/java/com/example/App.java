
package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication

public class App {
    public static void main(String[] args) {
        // Kích hoạt máy chủ nhúng Tomcat để mở cổng localhost
        SpringApplication.run(App.class, args);
        System.out.println("\n🚀 SERVER SPRING BOOT ĐÃ CHẠY TẠI: http://localhost:8080/api/books");
    }

}
