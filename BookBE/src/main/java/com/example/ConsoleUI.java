package com.example;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.List;
import java.util.Properties;
import java.util.Scanner;
import com.example.Entities.Author;
import com.example.Entities.Book;
import com.example.Service.BookService;
import com.example.Util.AuthContext;

public class ConsoleUI {

    private Scanner scanner;
    private BookService service;
    private AuthContext authContext;

    public ConsoleUI(BookService service) {

        this.scanner = new Scanner(System.in);

        this.service = service;
    }

    public void displayMenu() {

        System.out.println("\n========== BOOK MANAGEMENT ==========");

        System.out.println("1. Add Author");

        System.out.println("2. View Authors");

        System.out.println("3. Add Book");

        System.out.println("4. View Books");

        System.out.println("5. Search Book");

        System.out.println("6. Delete Book");

        System.out.println("0. Exit");

        System.out.print("Choose: ");
    }

    public int getUserChoice() {

        try {

            return Integer.parseInt(scanner.nextLine());

        } catch (Exception e) {

            return -1;
        }
    }

    // =====================================================
    // AUTHOR
    // =====================================================

    private void addAuthor() {

        try {

            System.out.print("Author name: ");

            String name = scanner.nextLine();

            System.out.print("Nationality: ");

            String nationality = scanner.nextLine();

            service.addAuthorDemo(name, nationality);

            System.out.println("✓ Add author success!");

        } catch (Exception e) {

            System.out.println("❌ " + e.getMessage());
        }
    }

    private void viewAuthors() {

        try {

            List<Author> authors = service.getAllAuthors();

            if (authors.isEmpty()) {

                System.out.println("No authors found!");

                return;
            }

            System.out.println("\n========== AUTHORS ==========");

            for (Author author : authors) {

                System.out.println("ID: " + author.getId() + " | Name: " + author.getName()
                        + " | Nationality: " + author.getNationality());
            }

        } catch (Exception e) {

            System.out.println("❌ " + e.getMessage());
        }
    }

    // =====================================================
    // BOOK
    // =====================================================

    private void addBook() {

        try {

            System.out.print("Book title: ");

            String title = scanner.nextLine();

            System.out.print("Published year: ");

            int year = Integer.parseInt(scanner.nextLine());

            System.out.print("Author ID: ");

            int authorId = Integer.parseInt(scanner.nextLine());

            System.out.print("Price: ");

            double price = Double.parseDouble(scanner.nextLine());

            Book book = new Book();

            book.setTitle(title);

            book.setPublishedYear(year);

            book.setAuthorId(authorId);

            book.setQuantity(1);

            book.setStatus("ACTIVE");

            service.addBook(book, price, authContext);

            System.out.println("✓ Add book success!");

        } catch (Exception e) {

            System.out.println("❌ " + e.getMessage());
        }
    }

    private void viewBooks() {

        try {

            List<Book> books = service.getAllBooks();

            if (books.isEmpty()) {

                System.out.println("No books found!");

                return;
            }

            System.out.println("\n========== BOOKS ==========");

            for (Book book : books) {

                System.out.println("ID: " + book.getId() + " | Title: " + book.getTitle()
                        + " | Year: " + book.getPublishedYear());
            }

        } catch (Exception e) {

            System.out.println("❌ " + e.getMessage());
        }
    }

    private void searchBook() {

        try {

            System.out.print("Keyword: ");

            String keyword = scanner.nextLine();

            List<Book> books = service.searchBooks(keyword);

            if (books.isEmpty()) {

                System.out.println("No books found!");

                return;
            }

            for (Book book : books) {

                System.out.println(book.getId() + " - " + book.getTitle());
            }

        } catch (Exception e) {

            System.out.println("❌ " + e.getMessage());
        }
    }

    private void deleteBook() {

        try {

            System.out.print("Book ID: ");

            int id = Integer.parseInt(scanner.nextLine());

            service.deleteBook(id, authContext);

            System.out.println("✓ Delete success!");

        } catch (Exception e) {

            System.out.println("❌ " + e.getMessage());
        }
    }

    // =====================================================
    // START
    // =====================================================

    public void start() {

        boolean running = true;

        while (running) {

            displayMenu();

            int choice = getUserChoice();

            switch (choice) {

                case 1:

                    addAuthor();

                    break;

                case 2:

                    viewAuthors();

                    break;

                case 3:

                    addBook();

                    break;

                case 4:

                    viewBooks();

                    break;

                case 5:

                    searchBook();

                    break;

                case 6:

                    deleteBook();

                    break;

                case 0:

                    running = false;

                    System.out.println("Goodbye!");

                    break;

                default:

                    System.out.println("Invalid choice!");
            }
        }

        closeScanner();
    }

    public void closeScanner() {

        scanner.close();
    }

    // =====================================================
    // MAIN
    // =====================================================

    public static void main(String[] args) {

        try {

            Properties prop = new Properties();

            prop.load(
                    ConsoleUI.class.getClassLoader().getResourceAsStream("application.properties"));

            String url = prop.getProperty("db.url");

            String user = prop.getProperty("db.user");

            String password = prop.getProperty("db.password");

            Class.forName("org.postgresql.Driver");

            Connection conn = DriverManager.getConnection(url, user, password);

            BookService service = new BookService(conn);

            ConsoleUI ui = new ConsoleUI(service);

            ui.start();

        } catch (Exception e) {

            System.out.println("❌ " + e.getMessage());

            e.printStackTrace();
        }
    }
}
