package com.example.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Service.MailService;

@RestController
public class TestMailteController {

    @Autowired
    private MailService mailService;

    @GetMapping("/test-mail")
    public String testMail() {

        mailService.sendMail(
                "dinh22hoang2005@gmail.com",
                "Test Mail",
                "Hello từ Spring Boot"
        );

        return "Đã gửi mail";
    }
}