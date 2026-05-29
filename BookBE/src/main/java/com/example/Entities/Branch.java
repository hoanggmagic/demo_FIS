package com.example.Entities;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "branches")
public class Branch {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Khớp với SERIAL của Postgres
    private int id;

    @Column(nullable = false)
    private String name;

    private String address;
    private String phone;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Timestamp createdAt;

    // --- Constructors ---
    public Branch() {}

    public Branch(int id, String name) {
        this.id = id;
        this.name = name;
    }

    // --- Getters and Setters ---
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}