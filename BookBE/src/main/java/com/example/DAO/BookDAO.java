package com.example.DAO;

import java.util.List;
import com.example.Entities.Book;
import com.example.Util.AuthContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

public class BookDAO {

        // Thay vì dùng Connection, ta dùng EntityManager của JPA
        private final EntityManager em;

        public BookDAO(EntityManager em) {
                this.em = em;
        }

        // 1. Lấy tất cả sách
        public List<Book> getAllBooks() {
                String jpql = "SELECT b FROM Book b ORDER BY b.id";
                TypedQuery<Book> query = em.createQuery(jpql, Book.class);
                return query.getResultList();
        }

        // 2. Lấy sách theo ID
        public Book getBookById(int id) {
                // JPA tự tìm kiếm và map luôn BookPrice, Category nếu có liên kết
                return em.find(Book.class, id);
        }

        // 3. Tìm kiếm sách theo tên (Không phân biệt hoa thường giống ILIKE)
        public List<Book> searchBookByTitle(String title) {
                String jpql = "SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(:title) ORDER BY b.id";
                TypedQuery<Book> query = em.createQuery(jpql, Book.class);
                query.setParameter("title", "%" + title + "%");
                return query.getResultList();
        }

        // 4. Lấy sách theo danh mục (Xử lý cả danh mục con và quyền tác giả)
        public List<Book> getBooksByCategory(int categoryId, AuthContext ctx) {
                StringBuilder jpql = new StringBuilder(
                                "SELECT b FROM Book b WHERE (b.category.id = :categoryId "
                                                + "OR b.category.id IN (SELECT c.id FROM Category c WHERE c.parentId = :categoryId)) ");

                if (ctx != null && ctx.isAuthor()) {
                        jpql.append("AND b.authorId = :authorId ");
                }
                jpql.append("ORDER BY b.id");

                TypedQuery<Book> query = em.createQuery(jpql.toString(), Book.class);
                query.setParameter("categoryId", categoryId);
                if (ctx != null && ctx.isAuthor()) {
                        query.setParameter("authorId", ctx.getUserId());
                }

                return query.getResultList();
        }

        // 5. Tìm kiếm sách trong danh mục
        public List<Book> searchBooksByCategory(String keyword, Integer categoryId,
                        AuthContext ctx) {
                StringBuilder jpql = new StringBuilder(
                                "SELECT b FROM Book b WHERE (b.category.id = :categoryId "
                                                + "OR b.category.id IN (SELECT c.id FROM Category c WHERE c.parentId = :categoryId)) "
                                                + "AND LOWER(b.title) LIKE LOWER(:keyword) ");

                if (ctx != null && ctx.isAuthor()) {
                        jpql.append("AND b.authorId = :authorId ");
                }
                jpql.append("ORDER BY b.id");

                TypedQuery<Book> query = em.createQuery(jpql.toString(), Book.class);
                query.setParameter("categoryId", categoryId);
                query.setParameter("keyword", "%" + keyword + "%");
                if (ctx != null && ctx.isAuthor()) {
                        query.setParameter("authorId", ctx.getUserId());
                }

                return query.getResultList();
        }

        // 6. Kiểm tra quyền sở hữu của tác giả
        public boolean isOwnedByAuthor(int bookId, int authorId) {
                String jpql = "SELECT COUNT(b) FROM Book b WHERE b.id = :bookId AND b.authorId = :authorId";
                Long count = em.createQuery(jpql, Long.class).setParameter("bookId", bookId)
                                .setParameter("authorId", authorId).getSingleResult();
                return count > 0;
        }

        // 7. Thêm mới sách (Thay thế INSERT INTO ... RETURNING id)
        public int insertBook(Book book) {
                em.persist(book); // JPA tự động lưu xuống DB
                em.flush(); // Đẩy dữ liệu xuống ngay để lấy ID tự tăng
                return book.getId();
        }

        // 8. Cập nhật sách
        public void updateBook(Book book) {
                em.merge(book); // JPA tự động tìm theo ID và cập nhật các trường thay đổi
        }

        // 9. Xóa sách
        public void deleteBook(int id) {
                Book book = em.find(Book.class, id);
                if (book != null) {
                        em.remove(book);
                }
        }

        // 10. Lấy chuỗi định dạng ID | Sách | Tác giả
        public List<String> getAllBooksWithAuthors() {
                // Lưu ý: Nếu bạn chưa map đối tượng Author/User trong Book, ta dùng tạm b.authorId
                // Ở đây mình giả định bạn dùng b.authorName đã được map hoặc xử lý sau
                String jpql = "SELECT b FROM Book b ORDER BY b.id";
                List<Book> books = em.createQuery(jpql, Book.class).getResultList();

                return books.stream().map(b -> String.format("ID: %d | Sách: %s | Tác giả ID: %d",
                                b.getId(), b.getTitle(), b.getAuthorId())).toList();
        }
}
