package com.example.Config;

import com.example.DAO.UserDAO;
import com.example.Util.PasswordUtil;
import java.sql.Connection;
import javax.sql.DataSource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DataSource dataSource;
    private final PasswordUtil passwordUtil;

    public DataInitializer(DataSource dataSource, PasswordUtil passwordUtil) {
        this.dataSource = dataSource;
        this.passwordUtil = passwordUtil;
    }

    @Override
    public void run(String... args) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            UserDAO dao = new UserDAO(conn);
            dao.ensureDemoPasswords(passwordUtil);
        }
    }
}
