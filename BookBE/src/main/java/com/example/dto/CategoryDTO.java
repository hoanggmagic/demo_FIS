package com.example.dto;

public class CategoryDTO {

    private Integer id;
    private String name;
    private String description;
    private Integer parentId;
    private String parentName;

    public CategoryDTO() {}

    // ===== GETTER =====
    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Integer getParentId() {
        return parentId;
    }

    public String getParentName() {
        return parentName;
    }

    // ===== SETTER =====
    public void setId(Integer id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setParentId(Integer parentId) {
        this.parentId = parentId;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }
}
