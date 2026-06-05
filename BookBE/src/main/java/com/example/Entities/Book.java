package com.example.Entities;

import java.sql.Timestamp;
import java.util.List;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;
    private String description;

    // Hibernate/JPA không map trực tiếp List<String> kiểu thông thường được,
    // Nên tạm thời đánh dấu @Transient nếu bạn xử lý bằng logic ngoài, hoặc đổi thành String nếu DB
    // lưu chuỗi URL.
    @Transient
    private List<String> image;

    @Column(name = "published_year")
    private int publishedYear;

    @Transient
    private int quantity;

    @Column(name = "author_id")
    private int authorId;

    @Transient
    private String authorName;

    private String status;

    // --- LIÊN KẾT 1-1 ĐẾN BOOKPRICE ---
    // mappedBy trỏ đúng vào biến 'book' được cấu hình ở lớp BookPrice bên trên
    @OneToOne(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private BookPrice bookPrice;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Transient
    private List<String> images;

    public Book() {}

    public Book(int id, String title, int publishedYear, int authorId) {
        this.id = id;
        this.title = title;
        this.publishedYear = publishedYear;
        this.authorId = authorId;
    }

    // --- HÀM TIỆN ÍCH LẤY GIÁ THEO LOGIC (THAY THẾ CHO SQL COALESCE) ---

    // Lấy giá bán hiện tại (Nếu có sale thì lấy giá sale, không thì lấy giá gốc)
    public double getPrice() {
        if (this.bookPrice == null) {
            return 0.0;
        }
        return this.bookPrice.getSalePrice() > 0 ? this.bookPrice.getSalePrice()
                : this.bookPrice.getOriginalPrice();
    }

    // Lấy giá gốc
    public double getOriginalPrice() {
        return this.bookPrice != null ? this.bookPrice.getOriginalPrice() : 0.0;
    }

    // Lấy giá đã giảm
    public double getDiscountedPrice() {
        return this.bookPrice != null ? this.bookPrice.getSalePrice() : 0.0;
    }

    // --- GETTER / SETTER ---
    public BookPrice getBookPrice() {
        return bookPrice;
    }

    public void setBookPrice(BookPrice bookPrice) {
        this.bookPrice = bookPrice;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public int getPublishedYear() {
        return publishedYear;
    }

    public void setPublishedYear(int publishedYear) {
        this.publishedYear = publishedYear;
    }

    public int getAuthorId() {
        return authorId;
    }

    public void setAuthorId(int authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public List<String> getImage() {
        return image;
    }

    public void setImage(List<String> image) {
        this.image = image;
    }
}
