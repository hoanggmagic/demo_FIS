package com.example.Controller.Authors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.example.dto.OtpData;
import java.util.Map;
import java.util.HashMap;
import com.example.dto.OtpData;
import com.example.Service.MailService;
import org.springframework.beans.factory.annotation.Autowired;

public class SendOtp {
    @Autowired
    private MailService mailService;

    private Map<String, OtpData> otpStorage = new HashMap<>();

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {

                try {

                        String email = body.get("email");

                        String otp = String.valueOf((int) ((Math.random() * 900000) + 100000));

                        long expireTime = System.currentTimeMillis() + (5 * 60 * 1000);

                        otpStorage.put(email, new OtpData(otp, expireTime));

                        mailService.sendMail(email, "Mã xác thực", "Mã OTP của bạn là: " + otp
                                        + "\nOTP có hiệu lực trong 5 phút.");

                        return ResponseEntity.ok("Đã gửi OTP");

                } catch (Exception e) {

                        return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
                }
        }
}

