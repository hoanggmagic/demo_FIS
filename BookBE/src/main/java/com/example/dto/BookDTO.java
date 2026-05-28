package com.example.dto;

import java.sql.Timestamp;

public class BookDTO {

    // ======================
    // BOOK INFO
    // ======================
    private Integer id;
    private String title;
    private String description;
    private Integer publishedYear;
    private Integer quantity;
    private Double price;
    private String status;

    // ======================
    // AUTHOR (FK)
    // ======================
    private Integer authorId;
    private String authorName;

    // ======================
    // CATEGORY (FK)
    // ======================
    private Integer categoryId;
    private String categoryName;

    // ======================
    // AUDIT (optional nhưng rất nên có)
    // ======================
    private Timestamp createdAt;
    private Timestamp updatedAt;

    // ======================
    // CONSTRUCTOR
    // ======================
    public BookDTO() {}

    public BookDTO(Integer id, String title, String description, Integer publishedYear,
            Integer quantity, Double price, String status, Integer authorId, String authorName,
            Integer categoryId, String categoryName, Timestamp createdAt, Timestamp updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.publishedYear = publishedYear;
        this.quantity = quantity;
        this.price = price;
        this.status = status;
        this.authorId = authorId;
        this.authorName = authorName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ======================
    // GETTER / SETTER
    // ======================

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPublishedYear() {
        return publishedYear;
    }

    public void setPublishedYear(Integer publishedYear) {
        this.publishedYear = publishedYear;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Integer authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}
