package com.example.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Entities.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    // Lấy tất cả danh mục gốc (không có parent)
    List<Category> findByParentIsNull();

    // Lấy danh mục con theo parent
    List<Category> findByParentId(Integer parentId);

    // Kiểm tra còn danh mục con không (trước khi xóa)
    boolean existsByParentId(Integer parentId);
}
