// package com.example;

// import java.io.InputStream;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;
// import java.sql.Connection;
// import java.sql.DriverManager;
// import java.util.List;
// import java.util.Properties;
// import com.example.DAO.AuthorDAO;
// import com.example.DAO.BookDAO;
// import com.example.DAO.BookPriceDAO;

// public class App {
// public static void main(String[] args) {
// Properties prop = new Properties();

// // Đưa toàn bộ quá trình đọc file và kết nối vào trong một khối try-catch lớn
// try {
// // Bước 1: Thử tìm file trong thư mục Resources trước
// InputStream input =
// App.class.getClassLoader().getResourceAsStream("application.properties");

// if (input == null) {
// Path cwd = Paths.get(System.getProperty("user.dir")).toAbsolutePath();
// System.out.println("Không tìm thấy application.properties trong Resources.");
// System.out.println("Working directory: " + cwd);
// System.out.println("Thử các đường dẫn tệp tin...");
// Path[] candidates = new Path[] {
// cwd.resolve(
// Paths.get("src", "main", "resources", "application.properties")),
// cwd.resolve(Paths.get("demo", "src", "main", "resources",
// "application.properties")),
// cwd.resolve(Paths.get("target", "classes", "application.properties")),
// cwd.resolve(
// Paths.get("demo", "target", "classes", "application.properties")),
// cwd.resolve(Paths.get("..", "demo", "src", "main", "resources",
// "application.properties")).normalize(),
// cwd.resolve(Paths.get("..", "src", "main", "resources",
// "application.properties")).normalize(),
// cwd.resolve(Paths.get("..", "target", "classes", "application.properties"))
// .normalize()};
// Path found = null;
// for (Path candidate : candidates) {
// System.out.println("Kiểm tra: " + candidate);
// if (Files.exists(candidate)) {
// found = candidate;
// break;
// }
// }
// if (found == null) {
// throw new java.io.FileNotFoundException(
// "Không tìm thấy file application.properties. Hãy kiểm tra src/main/resources hoặc
// target/classes.");
// }
// System.out.println("Đã tìm thấy cấu hình tại: " + found);
// input = Files.newInputStream(found);
// }

// // Dùng try-with-resources để tự động đóng inputStream sau khi đọc xong
// try (InputStream inputStream = input) {
// // Load các cấu hình vào Object Properties
// prop.load(inputStream);

// String url = prop.getProperty("db.url");
// String user = prop.getProperty("db.user");
// String password = prop.getProperty("db.password");

// if (url == null || user == null || password == null) {
// throw new IllegalStateException(
// "Thiếu cấu hình kết nối trong application.properties: db.url, db.user hoặc db.password.");
// }

// System.out.println("Đang kết nối tới PostgreSQL bằng file cấu hình...");

// // Nếu dùng JDBC driver bên ngoài, đảm bảo driver PostgreSQL đã được nạp
// Class.forName("org.postgresql.Driver");

// // Tiến hành kết nối tới Database
// try (Connection conn = DriverManager.getConnection(url, user, password)) {
// if (conn != null) {
// System.out.println("🎉 Kết nối thành công bằng User: " + user);
// System.out.println("\n========== DEMO DAO OPERATIONS ==========\n");

// // Demo AuthorDAO
// System.out.println("--- Danh sách tất cả tác giả ---");
// AuthorDAO authorDAO = new AuthorDAO(conn);
// List<com.example.Entities.Author> authors = authorDAO.getAllAuthors();
// for (com.example.Entities.Author author : authors) {
// System.out.println(
// "ID: " + author.getId() + " | Tên: " + author.getAuthorName()
// + " | Tiểu sử: " + author.getNationality());
// }

// // Demo BookDAO
// System.out.println("\n--- Danh sách tất cả sách ---");
// BookDAO bookDAO = new BookDAO(conn);
// List<com.example.Entities.Book> books = bookDAO.getAllBooks();
// for (com.example.Entities.Book book : books) {
// System.out.println("ID: " + book.getId() + " | Tiêu đề: "
// + book.getTitle() + " | Năm: " + book.getPublishedYear());
// }

// // Demo BookDAO - Sách kèm tác giả
// System.out.println("\n--- Sách kèm tác giả ---");
// List<String> booksWithAuthors = bookDAO.getAllBooksWithAuthors();
// for (String entry : booksWithAuthors) {
// System.out.println(entry);
// }

// // Demo BookPriceDAO
// System.out.println("\n--- Giá các sách ---");
// BookPriceDAO priceDAO = new BookPriceDAO(conn);
// List<String> prices = priceDAO.getAllBookPrices();
// for (String price : prices) {
// System.out.println(price);
// }

// // Demo BookPriceDAO - Sách rẻ nhất / đắt nhất
// System.out.println("\n--- Thống kê giá ---");
// System.out.println(priceDAO.getCheapestBook());
// System.out.println(priceDAO.getMostExpensiveBook());

// // Demo BookPriceDAO - Sách trong khoảng giá
// System.out.println("\n--- Sách có giá từ 50000 đến 100000 VND ---");
// List<String> booksInRange = priceDAO.getBooksByPriceRange(50000, 100000);
// for (String book : booksInRange) {
// System.out.println(book);
// }

// // Demo BookDAO - Tìm kiếm sách
// System.out.println("\n--- Tìm sách có từ 'Mắt' trong tiêu đề ---");
// List<com.example.Entities.Book> searchResults =
// bookDAO.searchBookByTitle("Mắt");
// for (com.example.Entities.Book book : searchResults) {
// System.out.println("Tìm thấy: " + book.getTitle());
// }
// }
// }
// }

// } catch (java.io.FileNotFoundException e) {
// System.out.println(
// "❌ Lỗi: Không tìm thấy file 'application.properties'. Hãy chắc chắn bạn đã tạo file này!");
// e.printStackTrace();
// } catch (Exception e) {
// System.out.println("❌ Có lỗi xảy ra hệ thống:");
// e.printStackTrace();
// }
// }
// }
package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class App {
    public static void main(String[] args) {
        // Kích hoạt máy chủ nhúng Tomcat để mở cổng localhost
        SpringApplication.run(App.class, args);
        System.out.println("\n🚀 SERVER SPRING BOOT ĐÃ CHẠY TẠI: http://localhost:8080/api/books");
    }
}
