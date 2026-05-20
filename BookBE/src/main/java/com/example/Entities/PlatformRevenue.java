package com.example.Entities;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class PlatformRevenue {
    private int id;
    private Integer orderId;
    private BigDecimal amount;
    private Timestamp createdAt;

    public PlatformRevenue() {}

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
