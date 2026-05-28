package com.example.Controller.Admin;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.Entities.Category;
import com.example.Service.CategoryService;
import com.example.dto.CategoryDTO;
import com.example.dto.CategoryTreeDTO;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin("*")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // GET /api/categories
    @GetMapping
    public List<CategoryDTO> getAll() {
        return categoryService.getAll().stream().map(c -> {
            CategoryDTO dto = new CategoryDTO();
            dto.setId(c.getId());
            dto.setName(c.getName());
            dto.setDescription(c.getDescription());
            return dto;
        }).toList();
    }

    // GET /api/categories/tree

    @GetMapping("/tree")
    public List<CategoryTreeDTO> getTree() {
        return categoryService.getTree();
    }

    // GET /api/categories/{id}
    @GetMapping("/{id}")
    public Category getById(@PathVariable Integer id) {
        return categoryService.getById(id);
    }

    // POST /api/categories
    @PostMapping
    public Category create(@RequestBody CategoryDTO dto) {
        return categoryService.create(dto);
    }

    // PUT /api/categories/{id}
    @PutMapping("/{id}")
    public Category update(@PathVariable Integer id, @RequestBody CategoryDTO dto) {
        return categoryService.update(id, dto);
    }

    // DELETE /api/categories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }



}
