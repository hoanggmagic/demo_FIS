package com.example.DAO;

import com.example.Entities.Wallet;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class WalletDAO {
    private final Connection connection;

    public WalletDAO(Connection connection) {
        this.connection = connection;
    }

    public Wallet getWalletByUserId(int userId) throws SQLException {
        String query = "SELECT id, user_id, balance, created_at FROM wallets WHERE user_id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setInt(1, userId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Wallet wallet = new Wallet();
                    wallet.setId(rs.getInt("id"));
                    wallet.setUserId(rs.getInt("user_id"));
                    wallet.setBalance(rs.getBigDecimal("balance"));
                    wallet.setCreatedAt(rs.getTimestamp("created_at"));
                    return wallet;
                }
            }
        }
        return null;
    }

    public List<String> getAllAuthorBalances() throws SQLException {
        List<String> results = new ArrayList<>();
        String query = "SELECT u.full_name, w.balance FROM wallets w "
                + "LEFT JOIN users u ON w.user_id = u.id WHERE u.role = 'AUTHOR'";

        try (PreparedStatement pstmt = connection.prepareStatement(query);
             ResultSet rs = pstmt.executeQuery()) {
            while (rs.next()) {
                results.add(String.format("%s: %s VND",
                        rs.getString("full_name"),
                        rs.getBigDecimal("balance")));
            }
        }
        return results;
    }

    public void addCommission(int walletId, BigDecimal amount, int orderId) throws SQLException {
        String updateWallet = "UPDATE wallets SET balance = balance + ? WHERE id = ?";
        String insertTx = "INSERT INTO wallet_transactions (wallet_id, order_id, amount, transaction_type, description) "
                + "VALUES (?, ?, ?, 'COMMISSION', ?)";

        try (PreparedStatement walletStmt = connection.prepareStatement(updateWallet);
             PreparedStatement txStmt = connection.prepareStatement(insertTx)) {
            walletStmt.setBigDecimal(1, amount);
            walletStmt.setInt(2, walletId);
            walletStmt.executeUpdate();

            txStmt.setInt(1, walletId);
            txStmt.setInt(2, orderId);
            txStmt.setBigDecimal(3, amount);
            txStmt.setString(4, "Hoa hồng 68% từ đơn hàng #" + orderId);
            txStmt.executeUpdate();
        }
    }
}
