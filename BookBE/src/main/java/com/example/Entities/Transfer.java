package com.example.Entities;

import java.sql.Timestamp;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "transfers")
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "book_id", nullable = false)
    private int bookId;

    @Column(name = "from_branch_id", nullable = false)
    private int fromBranchId;

    @Column(name = "to_branch_id", nullable = false)
    private int toBranchId;

    @Column(nullable = false)
    private int quantity;

    private String note;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    // Transient để lấy tên hiển thị
    @Transient
    private String bookTitle;

    @Transient
    private String fromBranchName;

    @Transient
    private String toBranchName;

    // --- Constructors ---
    public Transfer() {}

    public Transfer(int bookId, int fromBranchId, int toBranchId, int quantity, String note) {
        this.bookId = bookId;
        this.fromBranchId = fromBranchId;
        this.toBranchId = toBranchId;
        this.quantity = quantity;
        this.note = note;
    }

    // --- Getters and Setters ---
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

    public int getFromBranchId() {
        return fromBranchId;
    }

    public void setFromBranchId(int fromBranchId) {
        this.fromBranchId = fromBranchId;
    }

    public int getToBranchId() {
        return toBranchId;
    }

    public void setToBranchId(int toBranchId) {
        this.toBranchId = toBranchId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getFromBranchName() {
        return fromBranchName;
    }

    public void setFromBranchName(String fromBranchName) {
        this.fromBranchName = fromBranchName;
    }

    public String getToBranchName() {
        return toBranchName;
    }

    public void setToBranchName(String toBranchName) {
        this.toBranchName = toBranchName;
    }
}
