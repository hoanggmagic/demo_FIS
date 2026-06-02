package com.example.dto;

import java.math.BigDecimal;

public class OrderItemDTO {

    private int bookId;
    private String bookName;
    private int quantity;
    private BigDecimal price;
    private int authorId;
    private BigDecimal authorIncome;
    private BigDecimal adminIncome;

    public OrderItemDTO() {}

    public OrderItemDTO(int bookId, String bookName, int quantity, BigDecimal price, int authorId,
            BigDecimal authorIncome, BigDecimal adminIncome) {
        this.bookId = bookId;
        this.bookName = bookName;
        this.quantity = quantity;
        this.price = price;
        this.authorId = authorId;
        this.authorIncome = authorIncome;
        this.adminIncome = adminIncome;
    }

    // ✅ GETTERS & SETTERS (bắt buộc)
    public int getBookId() {
        return bookId;
    }

    public void setBookId(int bookId) {
        this.bookId = bookId;
    }

    public String getBookName() {
        return bookName;
    }

    public void setBookName(String bookName) {
        this.bookName = bookName;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getAuthorId() {
        return authorId;
    }

    public void setAuthorId(int authorId) {
        this.authorId = authorId;
    }

    public BigDecimal getAuthorIncome() {
        return authorIncome;
    }

    public void setAuthorIncome(BigDecimal authorIncome) {
        this.authorIncome = authorIncome;
    }

    public BigDecimal getAdminIncome() {
        return adminIncome;
    }

    public void setAdminIncome(BigDecimal adminIncome) {
        this.adminIncome = adminIncome;
    }
}
