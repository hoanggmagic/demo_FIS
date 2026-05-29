package com.example.Entities;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "user_id", nullable = false)
    private int userId;

    // Chi nhánh khách chọn khi đặt hàng
    @ManyToOne
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(name = "author_income")
    private BigDecimal authorIncome;

    @Column(name = "platform_income")
    private BigDecimal platformIncome;

    private String status; // PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items;

    public Order() {}

    // --- Getters and Setters ---
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public Branch getBranch() {
        return branch;
    }

    public void setBranch(Branch branch) {
        this.branch = branch;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public BigDecimal getAuthorIncome() {
        return authorIncome;
    }

    public void setAuthorIncome(BigDecimal authorIncome) {
        this.authorIncome = authorIncome;
    }

    public BigDecimal getPlatformIncome() {
        return platformIncome;
    }

    public void setPlatformIncome(BigDecimal platformIncome) {
        this.platformIncome = platformIncome;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}
