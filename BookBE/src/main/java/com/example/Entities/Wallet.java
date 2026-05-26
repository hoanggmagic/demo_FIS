package com.example.Entities;

import java.math.BigDecimal;
import java.sql.Timestamp;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "wallets") // Đảm bảo tên này khớp với tên bảng trong MySQL/PostgreSQL của bạn
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tự động tăng (Auto Increment)
    private int id;

    @Column(name = "user_id", nullable = false) // Map với cột user_id trong DB
    private int userId;

    @Column(name = "balance", nullable = false)
    private BigDecimal balance = BigDecimal.ZERO; // Mặc định khởi tạo bằng 0

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    // Construtor mặc định (Bắt buộc phải có đối với JPA)
    public Wallet() {}

    // Getter và Setter giữ nguyên
    public int getId() {
        return id;
    }

    public void setId(int id) {
        // Nếu DB của bạn tự tăng, không nên set thủ công id khi tạo mới
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
