package com.example.dto;

import java.util.List;

public class CategoryTreeDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer parentId;
    private List<CategoryTreeDTO> children; // đệ quy

    public CategoryTreeDTO() {}

    public CategoryTreeDTO(Integer id, String name, String description, Integer parentId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.parentId = parentId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getParentId() {
        return parentId;
    }

    public void setParentId(Integer parentId) {
        this.parentId = parentId;
    }

    public List<CategoryTreeDTO> getChildren() {
        return children;
    }

    public void setChildren(List<CategoryTreeDTO> children) {
        this.children = children;
    }
}
