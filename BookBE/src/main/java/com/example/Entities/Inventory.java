package com.example.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventories")
@IdClass(InventoryId.class) // Chỉ định sử dụng khóa phức hợp
public class Inventory {

    @Id
    @Column(name = "book_id")
    private int bookId;

    @Id
    @Column(name = "branch_id")
    private int branchId;

    private int quantity;

    // Liên kết ngược lại thực thể Book để lấy thông tin sách nếu cần
    @ManyToOne
    @JoinColumn(name = "book_id", insertable = false, updatable = false)
    private Book book;

    // Liên kết ngược lại thực thể Branch để lấy thông tin chi nhánh
    @ManyToOne
    @JoinColumn(name = "branch_id", insertable = false, updatable = false)
    private Branch branch;

    // --- Constructors ---
    public Inventory() {}

    public Inventory(int bookId, int branchId, int quantity) {
        this.bookId = bookId;
        this.branchId = branchId;
        this.quantity = quantity;
    }

    // --- Getters and Setters ---
    public int getBookId() {
        return bookId;
    }

    public void setBookId(int bookId) {
        this.bookId = bookId;
    }

    public int getBranchId() {
        return branchId;
    }

    public void setBranchId(int branchId) {
        this.branchId = branchId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public Branch getBranch() {
        return branch;
    }

    public void setBranch(Branch branch) {
        this.branch = branch;
    }
}
