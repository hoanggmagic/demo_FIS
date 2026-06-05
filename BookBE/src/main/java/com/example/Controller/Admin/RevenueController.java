package com.example.Controller.Admin;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.Util.RequestAuth;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/admin/revenue")
@CrossOrigin("*")
public class RevenueController {

    @Autowired
    private DataSource dataSource;


    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestParam(required = false) String from,
            @RequestParam(required = false) String to, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);

            String dateFilter = buildDateFilter(from, to, ""); // ← sửa

            PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) as total_orders, "
                    + "COALESCE(SUM(total_price), 0) as total_revenue, "
                    + "COALESCE(SUM(author_income), 0) as total_author, "
                    + "COALESCE(SUM(platform_income), 0) as total_platform "
                    + "FROM orders WHERE status = 'SUCCESS'" + dateFilter);
            ResultSet rs = ps.executeQuery();
            Map<String, Object> summary = new HashMap<>();
            if (rs.next()) {
                summary.put("totalOrders", rs.getInt("total_orders"));
                summary.put("totalRevenue", rs.getDouble("total_revenue"));
                summary.put("totalAuthor", rs.getDouble("total_author"));
                summary.put("totalPlatform", rs.getDouble("total_platform"));
            }
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }


    @GetMapping("/by-day")
    public ResponseEntity<?> getByDay(@RequestParam(required = false) String from,
            @RequestParam(required = false) String to, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String dateFilter = buildDateFilter(from, to, ""); // ← sửa
            PreparedStatement ps = conn.prepareStatement("SELECT DATE(created_at) as date, "
                    + "COUNT(*) as orders, " + "COALESCE(SUM(total_price), 0) as revenue "
                    + "FROM orders WHERE status = 'SUCCESS'" + dateFilter
                    + " GROUP BY DATE(created_at) ORDER BY date");
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("date", rs.getString("date"));
                row.put("orders", rs.getInt("orders"));
                row.put("revenue", rs.getDouble("revenue"));
                list.add(row);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }


    @GetMapping("/by-month")
    public ResponseEntity<?> getByMonth(
            @RequestParam(required = false, defaultValue = "0") int year,
            HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String yearFilter = year > 0 ? " AND EXTRACT(YEAR FROM created_at) = " + year : "";
            PreparedStatement ps =
                    conn.prepareStatement("SELECT EXTRACT(YEAR FROM created_at) as year, "
                            + "EXTRACT(MONTH FROM created_at) as month, " + "COUNT(*) as orders, "
                            + "COALESCE(SUM(total_price), 0) as revenue "
                            + "FROM orders WHERE status = 'SUCCESS'" + yearFilter
                            + " GROUP BY year, month ORDER BY year, month");
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("year", rs.getInt("year"));
                row.put("month", rs.getInt("month"));
                row.put("orders", rs.getInt("orders"));
                row.put("revenue", rs.getDouble("revenue"));
                list.add(row);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }


    @GetMapping("/by-branch")
    public ResponseEntity<?> getByBranch(@RequestParam(required = false) String from,
            @RequestParam(required = false) String to, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String dateFilter = buildDateFilter(from, to);
            String sql = "SELECT br.id as branch_id, br.name as branch_name, "
                    + "COUNT(o.id) as orders, " + "COALESCE(SUM(o.total_price), 0) as revenue "
                    + "FROM orders o " + "JOIN branches br ON br.id = o.branch_id "
                    + "WHERE o.status = 'SUCCESS'" + dateFilter
                    + " GROUP BY br.id, br.name ORDER BY revenue DESC";

            System.out.println("SQL: " + sql);

            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("branchId", rs.getInt("branch_id"));
                row.put("branchName", rs.getString("branch_name"));
                row.put("orders", rs.getInt("orders"));
                row.put("revenue", rs.getDouble("revenue"));
                list.add(row);
            }
            return ResponseEntity.ok(list); // ← có return
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // GET /api/admin/revenue/by-book?from=2024-01-01&to=2024-12-31
    @GetMapping("/by-book")
    public ResponseEntity<?> getByBook(@RequestParam(required = false) String from,
            @RequestParam(required = false) String to, HttpServletRequest request) {
        try (Connection conn = dataSource.getConnection()) {
            RequestAuth.require(request);
            String dateFilter = buildDateFilter(from, to, "o.");
            PreparedStatement ps =
                    conn.prepareStatement("SELECT b.id as book_id, b.title as book_title, "
                            + "SUM(oi.quantity) as total_sold, "
                            + "COALESCE(SUM(oi.quantity * oi.price), 0) as revenue "
                            + "FROM order_items oi " + "JOIN orders o ON o.id = oi.order_id "
                            + "JOIN books b ON b.id = oi.book_id " + "WHERE o.status = 'SUCCESS'"
                            + dateFilter
                            + " GROUP BY b.id, b.title ORDER BY revenue DESC LIMIT 10");
            ResultSet rs = ps.executeQuery();
            List<Map<String, Object>> list = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("bookId", rs.getInt("book_id"));
                row.put("bookTitle", rs.getString("book_title"));
                row.put("totalSold", rs.getInt("total_sold"));
                row.put("revenue", rs.getDouble("revenue"));
                list.add(row);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    private String buildDateFilter(String from, String to) {
        return buildDateFilter(from, to, "o."); // ← đổi "" thành "o."
    }


    private String buildDateFilter(String from, String to, String prefix) {
        StringBuilder sb = new StringBuilder();
        if (from != null && !from.isEmpty())
            sb.append(" AND ").append(prefix).append("created_at >= '").append(from).append("'");
        if (to != null && !to.isEmpty())
            sb.append(" AND ").append(prefix).append("created_at <= '").append(to)
                    .append(" 23:59:59'");
        return sb.toString();
    }
}
