package com.example.Repository;

import com.example.Entities.BookImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface BookImageRepository extends JpaRepository<BookImage, Integer> {
    List<BookImage> findByBookId(int bookId);

    @Transactional
    void deleteByBookId(int bookId);
}