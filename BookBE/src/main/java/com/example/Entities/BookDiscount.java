package com.example.Entities;

import java.sql.Timestamp;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "book_discounts")
public class BookDiscount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "book_id", nullable = false)
    private int bookId;

    @Column(name = "discount_percent")
    private double discountPercent; // Ví dụ: 10.0 cho 10%

    @Column(name = "start_date", nullable = false)
    private Timestamp startDate; // Ngày bắt đầu (Ví dụ: 2026-06-03 00:00:00)

    @Column(name = "end_date", nullable = false)
    private Timestamp endDate; // Ngày kết thúc (Ví dụ: 2026-06-05 23:59:59)

    private String status; // ACTIVE, INACTIVE

    public BookDiscount() {}

    // ===== GETTERS / SETTERS =====
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getBookId() {
        return bookId;
    }

    public void setBookId(int bookId) {
        this.bookId = bookId;
    }

    public double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public Timestamp getStartDate() {
        return startDate;
    }

    public void setStartDate(Timestamp startDate) {
        this.startDate = startDate;
    }

    public Timestamp getEndDate() {
        return endDate;
    }

    public void setEndDate(Timestamp endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
