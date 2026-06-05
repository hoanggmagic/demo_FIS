package com.example.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.Entities.BookPrice;

@Repository
public interface BookPriceRepository extends JpaRepository<BookPrice, Integer> {


    Optional<BookPrice> findByBookId(int bookId);
}
