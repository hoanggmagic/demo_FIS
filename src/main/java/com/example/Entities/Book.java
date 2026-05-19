package com.example.Entities;

public class Book {
    private int id;
    private String title;
    private int publishedYear;
    private int authorId;

    public Book() {}

    public Book(int id, String title, int publishedYear, int authorId) {
        this.id = id;
        this.title = title;
        this.publishedYear = publishedYear;
        this.authorId = authorId;
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
}
