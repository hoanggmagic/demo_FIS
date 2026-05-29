package com.example.Entities;

import java.io.Serializable;
import java.util.Objects;

public class InventoryId implements Serializable {
    private int bookId;
    private int branchId;

    // Bắt buộc phải có Constructor không tham số
    public InventoryId() {}

    public InventoryId(int bookId, int branchId) {
        this.bookId = bookId;
        this.branchId = branchId;
    }

    // Bắt buộc phải override equals và hashCode để JPA so sánh dữ liệu
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        InventoryId that = (InventoryId) o;
        return bookId == that.bookId && branchId == that.branchId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookId, branchId);
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
}
