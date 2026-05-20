package com.example.Entities;

public class BookPrice {
    private int id;
    private int bookId;
    private double price;
    private String currency;

    public BookPrice() {}

    public BookPrice(int id, int bookId, double price, String currency) {
        this.id = id;
        this.bookId = bookId;
        this.price = price;
        this.currency = currency;
    }

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

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
