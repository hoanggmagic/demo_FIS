package com.example.Controller.Authors;
import com.example.Entities.Wallet;
import com.example.Entities.WalletTransaction;
import com.example.Repository.WalletRepository;
import com.example.Repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;