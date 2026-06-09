package com.example.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.Entities.Book;

public interface BookRepository extends JpaRepository<Book, Integer> {

        Page<Book> findByAuthorId(Integer authorId, Pageable pageable);

        @Query("""
                            SELECT b FROM Book b
                            WHERE (:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND (:categoryId IS NULL OR b.category.id = :categoryId)
                        """)
        Page<Book> searchByKeywordAndCategory(@Param("keyword") String keyword,
                        @Param("categoryId") Integer categoryId, Pageable pageable);

        @Query("""
                            SELECT DISTINCT b FROM Book b
                            LEFT JOIN b.bookPrice bp
                            WHERE (:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND b.category.id IN :categoryIds
                              AND (:minPrice IS NULL OR COALESCE(bp.originalPrice, 0) >= :minPrice)
                              AND (:maxPrice IS NULL OR COALESCE(bp.originalPrice, 0) <= :maxPrice)
                              AND (:onlySale = false OR (
                                    bp.salePrice IS NOT NULL AND bp.salePrice > 0
                                    AND bp.saleStart IS NOT NULL AND bp.saleEnd IS NOT NULL
                                    AND CURRENT_TIMESTAMP BETWEEN bp.saleStart AND bp.saleEnd
                              ))
                        """)
        Page<Book> searchWithFilters(@Param("keyword") String keyword,
                        @Param("categoryIds") List<Integer> categoryIds,
                        @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice,
                        @Param("onlySale") boolean onlySale, Pageable pageable);

        @Query("""
                            SELECT DISTINCT b FROM Book b
                            LEFT JOIN b.bookPrice bp
                            WHERE (:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND b.category.id IN :categoryIds
                              AND (:minPrice IS NULL OR COALESCE(bp.originalPrice, 0) >= :minPrice)
                              AND (:maxPrice IS NULL OR COALESCE(bp.originalPrice, 0) <= :maxPrice)
                              AND (:onlySale = false OR (
                                    bp.salePrice IS NOT NULL AND bp.salePrice > 0
                                    AND bp.saleStart IS NOT NULL AND bp.saleEnd IS NOT NULL
                                    AND CURRENT_TIMESTAMP BETWEEN bp.saleStart AND bp.saleEnd
                              ))
                        """)
        List<Book> searchWithFiltersList(@Param("keyword") String keyword,
                        @Param("categoryIds") List<Integer> categoryIds,
                        @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice,
                        @Param("onlySale") boolean onlySale);

        @Query("""
                            SELECT DISTINCT b FROM Book b
                            LEFT JOIN b.bookPrice bp
                            WHERE (:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND (:minPrice IS NULL OR COALESCE(bp.originalPrice, 0) >= :minPrice)
                              AND (:maxPrice IS NULL OR COALESCE(bp.originalPrice, 0) <= :maxPrice)
                              AND (:onlySale = false OR (
                                    bp.salePrice IS NOT NULL AND bp.salePrice > 0
                                    AND bp.saleStart IS NOT NULL AND bp.saleEnd IS NOT NULL
                                    AND CURRENT_TIMESTAMP BETWEEN bp.saleStart AND bp.saleEnd
                              ))
                        """)
        Page<Book> searchWithFiltersNoCat(@Param("keyword") String keyword,
                        @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice,
                        @Param("onlySale") boolean onlySale, Pageable pageable);

        @Query("""
                            SELECT DISTINCT b FROM Book b
                            LEFT JOIN b.bookPrice bp
                            WHERE (:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND (:minPrice IS NULL OR COALESCE(bp.originalPrice, 0) >= :minPrice)
                              AND (:maxPrice IS NULL OR COALESCE(bp.originalPrice, 0) <= :maxPrice)
                              AND (:onlySale = false OR (
                                    bp.salePrice IS NOT NULL AND bp.salePrice > 0
                                    AND bp.saleStart IS NOT NULL AND bp.saleEnd IS NOT NULL
                                    AND CURRENT_TIMESTAMP BETWEEN bp.saleStart AND bp.saleEnd
                              ))
                        """)
        List<Book> searchWithFiltersNoCatList(@Param("keyword") String keyword,
                        @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice,
                        @Param("onlySale") boolean onlySale);

        @Query(value = """
                            SELECT b.id
                            FROM books b
                            LEFT JOIN book_prices bp ON bp.book_id = b.id
                            LEFT JOIN order_items oi ON oi.book_id = b.id
                            LEFT JOIN orders o ON o.id = oi.order_id
                            WHERE (:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND b.category_id IN (:categoryIds)
                              AND (:minPrice IS NULL OR COALESCE(bp.original_price, 0) >= :minPrice)
                              AND (:maxPrice IS NULL OR COALESCE(bp.original_price, 0) <= :maxPrice)
                              AND (:onlySale = false OR (
                                    bp.sale_price IS NOT NULL AND bp.sale_price > 0
                                    AND bp.sale_start IS NOT NULL AND bp.sale_end IS NOT NULL
                                    AND CURRENT_TIMESTAMP BETWEEN bp.sale_start AND bp.sale_end
                              ))
                            GROUP BY b.id
                            ORDER BY COALESCE(SUM(CASE WHEN o.status = 'SUCCESS' THEN oi.quantity ELSE 0 END), 0) DESC,
                                     b.id DESC
                        """, countQuery = """
                            SELECT COUNT(DISTINCT b.id)
                            FROM books b
                            LEFT JOIN book_prices bp ON bp.book_id = b.id
                            WHERE (:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND b.category_id IN (:categoryIds)
                              AND (:minPrice IS NULL OR COALESCE(bp.original_price, 0) >= :minPrice)
                              AND (:maxPrice IS NULL OR COALESCE(bp.original_price, 0) <= :maxPrice)
                              AND (:onlySale = false OR (
                                    bp.sale_price IS NOT NULL AND bp.sale_price > 0
                                    AND bp.sale_start IS NOT NULL AND bp.sale_end IS NOT NULL
                                    AND CURRENT_TIMESTAMP BETWEEN bp.sale_start AND bp.sale_end
                              ))
                        """, nativeQuery = true)
        Page<Integer> findBestsellerBookIdsWithCat(@Param("keyword") String keyword,
                        @Param("categoryIds") List<Integer> categoryIds,
                        @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice,
                        @Param("onlySale") boolean onlySale, Pageable pageable);

        @Query(value = """
                            SELECT b.id
                            FROM books b
                            LEFT JOIN book_prices bp ON bp.book_id = b.id
                            LEFT JOIN order_items oi ON oi.book_id = b.id
                            LEFT JOIN orders o ON o.id = oi.order_id
                            WHERE (:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND (:minPrice IS NULL OR COALESCE(bp.original_price, 0) >= :minPrice)
                              AND (:maxPrice IS NULL OR COALESCE(bp.original_price, 0) <= :maxPrice)
                              AND (:onlySale = false OR (
                                    bp.sale_price IS NOT NULL AND bp.sale_price > 0
                                    AND bp.sale_start IS NOT NULL AND bp.sale_end IS NOT NULL
                                    AND CURRENT_TIMESTAMP BETWEEN bp.sale_start AND bp.sale_end
                              ))
                            GROUP BY b.id
                            ORDER BY COALESCE(SUM(CASE WHEN o.status = 'SUCCESS' THEN oi.quantity ELSE 0 END), 0) DESC,
                                     b.id DESC
                        """, countQuery = """
                            SELECT COUNT(DISTINCT b.id)
                            FROM books b
                            LEFT JOIN book_prices bp ON bp.book_id = b.id
                            WHERE (:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                              AND (:minPrice IS NULL OR COALESCE(bp.original_price, 0) >= :minPrice)
                              AND (:maxPrice IS NULL OR COALESCE(bp.original_price, 0) <= :maxPrice)
                              AND (:onlySale = false OR (
                                    bp.sale_price IS NOT NULL AND bp.sale_price > 0
                                    AND bp.sale_start IS NOT NULL AND bp.sale_end IS NOT NULL
                                    AND CURRENT_TIMESTAMP BETWEEN bp.sale_start AND bp.sale_end
                              ))
                        """, nativeQuery = true)
        Page<Integer> findBestsellerBookIdsNoCat(@Param("keyword") String keyword,
                        @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice,
                        @Param("onlySale") boolean onlySale, Pageable pageable);
}
