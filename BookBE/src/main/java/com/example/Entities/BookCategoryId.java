package com.example.Entities;

import java.io.Serializable;
import java.util.Objects;
import jakarta.persistence.Embeddable;

@Embeddable
public class BookCategoryId implements Serializable {

    private Integer bookId;
    private Integer categoryId;

    public BookCategoryId() {}

    public BookCategoryId(Integer bookId, Integer categoryId) {
        this.bookId = bookId;
        this.categoryId = categoryId;
    }

    public Integer getBookId() {
        return bookId;
    }

    public void setBookId(Integer bookId) {
        this.bookId = bookId;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof BookCategoryId))
            return false;
        BookCategoryId that = (BookCategoryId) o;
        return Objects.equals(bookId, that.bookId) && Objects.equals(categoryId, that.categoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookId, categoryId);
    }
}
