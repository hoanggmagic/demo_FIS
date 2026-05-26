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
@Table(name = "wallet_transactions")
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "wallet_id")
    private int walletId;

    @Column(name = "order_id")
    private Integer orderId;

    private BigDecimal amount;

    @Column(name = "transaction_type")
    private String transactionType;

    private String description;

    @Column(name = "created_at")
    private Timestamp createdAt;

    public WalletTransaction() {}
}
