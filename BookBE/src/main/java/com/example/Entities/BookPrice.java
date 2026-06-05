package com.example.Entities;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "book_prices") // Bạn kiểm tra lại xem tên bảng dưới DB có đúng là book_prices không
                             // nhé
public class BookPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Đổi thành Double để đồng bộ và tránh lỗi gán dữ liệu
    @Column(name = "original_price", nullable = false)
    private Double originalPrice;

    // ĐỂ NULL THOẢI MÁI: Đổi từ double sang Double (viết hoa) để chấp nhận giá trị NULL từ database
    @Column(name = "sale_price", nullable = true)
    private Double salePrice;

    @Column(name = "sale_start")
    private LocalDateTime saleStart;

    @Column(name = "sale_end")
    private LocalDateTime saleEnd;

    @OneToOne
    @JoinColumn(name = "book_id") // Tên cột khóa ngoại liên kết sang bảng Book dưới DB
    private Book book;

    // --- CONSTRUCTOR ---
    public BookPrice() {}

    public BookPrice(Double originalPrice, Double salePrice) {
        this.originalPrice = originalPrice;
        this.salePrice = salePrice;
    }

    // --- GETTER VÀ SETTER CHUẨN ---

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    /**
     * Hàm lấy giá sale. Thêm xử lý kiểm tra null để khi bạn gọi code tính toán ở Service hoặc
     * Controller không bị dính lỗi NullPointerException (NPE).
     */
    public Double getSalePrice() {
        return salePrice != null ? salePrice : 0.0;
    }

    public void setSalePrice(Double salePrice) {
        this.salePrice = salePrice;
    }

    public LocalDateTime getSaleStart() {
        return saleStart;
    }

    public void setSaleStart(LocalDateTime saleStart) {
        this.saleStart = saleStart;
    }

    public LocalDateTime getSaleEnd() {
        return saleEnd;
    }

    public void setSaleEnd(LocalDateTime saleEnd) {
        this.saleEnd = saleEnd;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }
}
