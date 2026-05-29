package com.example.Entities;

import java.sql.Timestamp;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "stock_transfers")
public class StockTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Khớp với SERIAL của Postgres
    private int id;

    @ManyToOne
    @JoinColumn(name = "from_branch_id", nullable = false)
    private Branch fromBranch; // Chi nhánh chuyển đi (Ví dụ: Chi nhánh B)

    @ManyToOne
    @JoinColumn(name = "to_branch_id", nullable = false)
    private Branch toBranch; // Chi nhánh nhận hàng (Ví dụ: Chi nhánh A)

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book; // Sách nào được điều chuyển

    @Column(nullable = false)
    private int quantity; // Số lượng chuyển bao nhiêu cuốn

    private String status; // PENDING, SHIPPING, COMPLETED, CANCELLED

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at", insertable = false)
    private Timestamp updatedAt;

    // --- Constructors ---
    public StockTransfer() {}

    // --- Getters and Setters ---
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Branch getFromBranch() {
        return fromBranch;
    }

    public void setFromBranch(Branch fromBranch) {
        this.fromBranch = fromBranch;
    }

    public Branch getToBranch() {
        return toBranch;
    }

    public void setToBranch(Branch toBranch) {
        this.toBranch = toBranch;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
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

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}
