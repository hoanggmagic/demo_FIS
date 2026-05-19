package com.example;

import com.example.Service.BookService;
import com.example.Entities.Author;
import com.example.Entities.Book;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.List;
import java.util.Properties;
import java.util.Scanner;

public class ConsoleUI {
    private BookService service;
    private Scanner scanner;

    public ConsoleUI(BookService service) {
        this.service = service;
        this.scanner = new Scanner(System.in);
    }

    public void start() throws Exception {
        boolean running = true;
        while (running) {
            showMainMenu();
            int choice = getInput();
            
            switch (choice) {
                case 1:
                    authorMenu();
                    break;
                case 2:
                    bookMenu();
                    break;
                case 3:
                    priceMenu();
                    break;
                case 4:
                    service.printStatistics();
                    break;
                case 0:
                    System.out.println("Tạm biệt!");
                    running = false;
                    break;
                default:
                    System.out.println("Lựa chọn không hợp lệ!");
            }
        }
    }

    private void showMainMenu() {
        System.out.println("\n========== MENU CHÍNH ==========");
        System.out.println("1. Quản lý Tác giả");
        System.out.println("2. Quản lý Sách");
        System.out.println("3. Quản lý Giá sách");
        System.out.println("4. Xem thống kê");
        System.out.println("0. Thoát");
        System.out.print("Chọn: ");
    }

    private void authorMenu() throws Exception {
        boolean back = false;
        while (!back) {
            System.out.println("\n--- QUẢN LÝ TÁC GIẢ ---");
            System.out.println("1. Xem tất cả tác giả");
            System.out.println("2. Thêm tác giả");
            System.out.println("3. Cập nhật tác giả");
            System.out.println("4. Xóa tác giả");
            System.out.println("0. Quay lại");
            System.out.print("Chọn: ");
            
            int choice = getInput();
            switch (choice) {
                case 1:
                    viewAllAuthors();
                    break;
                case 2:
                    addAuthor();
                    break;
                case 3:
                    updateAuthor();
                    break;
                case 4:
                    deleteAuthor();
                    break;
                case 0:
                    back = true;
                    break;
                default:
                    System.out.println("Lựa chọn không hợp lệ!");
            }
        }
    }

    private void viewAllAuthors() throws Exception {
        System.out.println("\n--- Danh sách tác giả ---");
        List<Author> authors = service.getAllAuthors();
        if (authors.isEmpty()) {
            System.out.println("Không có tác giả nào!");
            return;
        }
        for (Author author : authors) {
            System.out.println("ID: " + author.getId() + " | Tên: " + author.getAuthorName() + 
                             " | Tiểu sử: " + author.getNationality());
        }
    }

    private void addAuthor() throws Exception {
        System.out.print("Nhập tên tác giả: ");
        scanner.nextLine(); // clear buffer
        String name = scanner.nextLine();
        System.out.print("Nhập quốc tịch/tiểu sử: ");
        String nationality = scanner.nextLine();
        service.addAuthor(name, nationality);
    }

    private void updateAuthor() throws Exception {
        viewAllAuthors();
        System.out.print("Nhập ID tác giả cần cập nhật: ");
        int id = getInput();
        System.out.print("Nhập tên mới: ");
        scanner.nextLine();
        String name = scanner.nextLine();
        System.out.print("Nhập quốc tịch/tiểu sử mới: ");
        String nationality = scanner.nextLine();
        service.updateAuthor(id, name, nationality);
    }

    private void deleteAuthor() throws Exception {
        viewAllAuthors();
        System.out.print("Nhập ID tác giả cần xóa: ");
        int id = getInput();
        service.deleteAuthor(id);
    }

    private void bookMenu() throws Exception {
        boolean back = false;
        while (!back) {
            System.out.println("\n--- QUẢN LÝ SÁCH ---");
            System.out.println("1. Xem tất cả sách");
            System.out.println("2. Xem sách + tác giả");
            System.out.println("3. Tìm kiếm sách");
            System.out.println("4. Thêm sách");
            System.out.println("5. Cập nhật sách");
            System.out.println("6. Xóa sách");
            System.out.println("0. Quay lại");
            System.out.print("Chọn: ");
            
            int choice = getInput();
            switch (choice) {
                case 1:
                    viewAllBooks();
                    break;
                case 2:
                    viewBooksWithAuthors();
                    break;
                case 3:
                    searchBooks();
                    break;
                case 4:
                    addBook();
                    break;
                case 5:
                    updateBook();
                    break;
                case 6:
                    deleteBook();
                    break;
                case 0:
                    back = true;
                    break;
                default:
                    System.out.println("Lựa chọn không hợp lệ!");
            }
        }
    }

    private void viewAllBooks() throws Exception {
        System.out.println("\n--- Danh sách sách ---");
        List<Book> books = service.getAllBooks();
        if (books.isEmpty()) {
            System.out.println("Không có sách nào!");
            return;
        }
        for (Book book : books) {
            System.out.println("ID: " + book.getId() + " | Tiêu đề: " + book.getTitle() + 
                             " | Năm: " + book.getPublishedYear());
        }
    }

    private void viewBooksWithAuthors() throws Exception {
        System.out.println("\n--- Sách kèm tác giả ---");
        List<String> results = service.getBooksWithAuthors();
        if (results.isEmpty()) {
            System.out.println("Không có dữ liệu!");
            return;
        }
        for (String result : results) {
            System.out.println(result);
        }
    }

    private void searchBooks() throws Exception {
        System.out.print("Nhập từ khóa tìm kiếm: ");
        scanner.nextLine();
        String keyword = scanner.nextLine();
        List<Book> results = service.searchBooks(keyword);
        if (results.isEmpty()) {
            System.out.println("Không tìm thấy sách!");
            return;
        }
        System.out.println("Kết quả tìm kiếm:");
        for (Book book : results) {
            System.out.println("- " + book.getTitle() + " (" + book.getPublishedYear() + ")");
        }
    }

    private void addBook() throws Exception {
        System.out.print("Nhập tiêu đề sách: ");
        scanner.nextLine();
        String title = scanner.nextLine();
        System.out.print("Nhập năm xuất bản: ");
        int year = getInput();
        System.out.print("Nhập ID tác giả: ");
        int authorId = getInput();
        System.out.print("Nhập giá sách (VND): ");
        double price = scanner.nextDouble();
        scanner.nextLine();
        service.addBook(title, year, authorId, price);
    }

    private void updateBook() throws Exception {
        viewAllBooks();
        System.out.print("Nhập ID sách cần cập nhật: ");
        int id = getInput();
        System.out.print("Nhập tiêu đề mới: ");
        scanner.nextLine();
        String title = scanner.nextLine();
        System.out.print("Nhập năm xuất bản mới: ");
        int year = getInput();
        System.out.print("Nhập mã thể loại: ");
        int categoryId = getInput();
        service.updateBook(id, title, year, categoryId);
    }

    private void deleteBook() throws Exception {
        viewAllBooks();
        System.out.print("Nhập ID sách cần xóa: ");
        int id = getInput();
        service.deleteBook(id);
    }

    private void priceMenu() throws Exception {
        boolean back = false;
        while (!back) {
            System.out.println("\n--- QUẢN LÝ GIÁ SÁCH ---");
            System.out.println("1. Xem tất cả giá sách");
            System.out.println("2. Sách theo khoảng giá");
            System.out.println("3. Sách rẻ nhất / đắt nhất");
            System.out.println("4. Cập nhật giá sách");
            System.out.println("0. Quay lại");
            System.out.print("Chọn: ");
            
            int choice = getInput();
            switch (choice) {
                case 1:
                    viewAllPrices();
                    break;
                case 2:
                    searchByPriceRange();
                    break;
                case 3:
                    viewExtremePrices();
                    break;
                case 4:
                    updatePrice();
                    break;
                case 0:
                    back = true;
                    break;
                default:
                    System.out.println("Lựa chọn không hợp lệ!");
            }
        }
    }

    private void viewAllPrices() throws Exception {
        System.out.println("\n--- Giá tất cả sách ---");
        List<String> prices = service.getAllPrices();
        for (String price : prices) {
            System.out.println(price);
        }
    }

    private void searchByPriceRange() throws Exception {
        System.out.print("Nhập giá tối thiểu: ");
        double min = scanner.nextDouble();
        System.out.print("Nhập giá tối đa: ");
        double max = scanner.nextDouble();
        List<String> results = service.getBooksByPriceRange(min, max);
        if (results.isEmpty()) {
            System.out.println("Không tìm thấy sách trong khoảng giá!");
            return;
        }
        System.out.println("Sách trong khoảng giá:");
        for (String result : results) {
            System.out.println(result);
        }
    }

    private void viewExtremePrices() throws Exception {
        System.out.println(service.getCheapestBook());
        System.out.println(service.getMostExpensiveBook());
    }

    private void updatePrice() throws Exception {
        System.out.print("Nhập ID sách: ");
        int bookId = getInput();
        System.out.print("Nhập giá mới: ");
        double price = scanner.nextDouble();
        service.updatePrice(bookId, price);
    }

    private int getInput() {
        try {
            return scanner.nextInt();
        } catch (Exception e) {
            scanner.nextLine();
            return -1;
        }
    }

    public static void main(String[] args) {
        Properties prop = new Properties();

        try {
            // Đọc cấu hình
            InputStream input = ConsoleUI.class.getClassLoader().getResourceAsStream("application.properties");
            if (input == null) {
                Path cwd = Paths.get(System.getProperty("user.dir")).toAbsolutePath();
                System.out.println("Working directory: " + cwd);
                Path[] candidates = new Path[]{
                        cwd.resolve(Paths.get("src", "main", "resources", "application.properties")),
                        cwd.resolve(Paths.get("demo", "src", "main", "resources", "application.properties")),
                        cwd.resolve(Paths.get("target", "classes", "application.properties")),
                        cwd.resolve(Paths.get("demo", "target", "classes", "application.properties"))
                };
                Path found = null;
                for (Path candidate : candidates) {
                    if (Files.exists(candidate)) {
                        found = candidate;
                        break;
                    }
                }
                if (found == null) {
                    throw new Exception("Không tìm thấy file application.properties");
                }
                input = Files.newInputStream(found);
            }

            prop.load(input);

            String url = prop.getProperty("db.url");
            String user = prop.getProperty("db.user");
            String password = prop.getProperty("db.password");

            Class.forName("org.postgresql.Driver");

            try (Connection conn = DriverManager.getConnection(url, user, password)) {
                System.out.println("✓ Kết nối thành công!");
                BookService service = new BookService(conn);
                ConsoleUI ui = new ConsoleUI(service);
                ui.start();
            }

        } catch (Exception e) {
            System.out.println("❌ Lỗi: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
