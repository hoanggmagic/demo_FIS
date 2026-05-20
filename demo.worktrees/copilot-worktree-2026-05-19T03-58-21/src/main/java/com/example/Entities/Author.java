package com.example.Entities;

public class Author {
    private int id;
    private String authorName;
    private String nationality;

    // Constructor không tham số (Bắt buộc phải có trong các Framework như Hibernate)
    public Author() {}

    // Constructor đầy đủ tham số để khởi tạo nhanh đối tượng
    public Author(int id, String authorName, String nationality) {
        this.id = id;
        this.authorName = authorName;
        this.nationality = nationality;
    }

    // Các hàm Getter và Setter để truy xuất dữ liệu bảo mật (Encapsulation)
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }
}
