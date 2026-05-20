-- =========================================================
-- PROJECT: DIGITAL BOOK PLATFORM
-- DATABASE: PostgreSQL
--
-- MÔ HÌNH:
-- - 1 ADMIN duy nhất
-- - USER mua sách
-- - AUTHOR đăng sách
-- - AUTHOR nhận 68%
-- - PLATFORM nhận 32%
-- - Wallet system
-- - Order system
-- - Audit logs
-- =========================================================
-- 1. USERS
-- =========================================================
-- Tài khoản hệ thống
--
-- ROLE:
-- - ADMIN  : quản trị hệ thống
-- - AUTHOR : tác giả đăng sách
-- - USER   : người mua sách
--
-- Hệ thống chỉ có DUY NHẤT 1 ADMIN
-- =========================================================

CREATE TABLE users (

    -- ID user
    id SERIAL PRIMARY KEY,

    -- Username đăng nhập
    username VARCHAR(50) UNIQUE NOT NULL,

    -- Email
    email VARCHAR(100) UNIQUE NOT NULL,

    -- Password đã mã hóa BCrypt
    password VARCHAR(255) NOT NULL,

    -- Họ tên
    full_name VARCHAR(100) NOT NULL,

    -- Ảnh đại diện
    avatar_url TEXT,

    -- Tiểu sử
    biography TEXT,

    -- Quốc tịch
    nationality VARCHAR(50),

    -- ROLE:
    -- ADMIN
    -- AUTHOR
    -- USER
    role VARCHAR(20) NOT NULL DEFAULT 'USER',

    -- TRUE = hoạt động
    -- FALSE = bị khóa
    is_active BOOLEAN DEFAULT TRUE,

    -- Ngày tạo tài khoản
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Chỉ cho phép role hợp lệ
    CONSTRAINT chk_user_role
    CHECK (
        role IN (
            'ADMIN',
            'AUTHOR',
            'USER'
        )
    )
);

-- =========================================================
-- CHỈ CHO PHÉP 1 ADMIN DUY NHẤT
-- =========================================================

CREATE UNIQUE INDEX only_one_admin
ON users(role)
WHERE role = 'ADMIN';

-- =========================================================
-- 2. BOOKS
-- =========================================================
-- Quản lý sách
--
-- author_id:
-- user có role AUTHOR
-- =========================================================

CREATE TABLE books (

    -- ID sách
    id SERIAL PRIMARY KEY,

    -- Tên sách
    title VARCHAR(150) NOT NULL,

    -- Mô tả sách
    description TEXT,

    -- Năm xuất bản
    published_year INT,

    -- Số lượng tồn kho
    quantity INT DEFAULT 0,

    -- AUTHOR tạo sách
    author_id INT,

    -- ACTIVE / INACTIVE
    status VARCHAR(20) DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Liên kết AUTHOR
    CONSTRAINT fk_book_author
    FOREIGN KEY (author_id)
    REFERENCES users(id)
    ON DELETE SET NULL,

    -- Không cho năm vượt hiện tại
    CONSTRAINT chk_book_year
    CHECK (
        published_year <= EXTRACT(YEAR FROM CURRENT_DATE)
    ),

    -- Không cho quantity âm
    CONSTRAINT chk_book_quantity
    CHECK (
        quantity >= 0
    ),

    -- Trạng thái hợp lệ
    CONSTRAINT chk_book_status
    CHECK (
        status IN (
            'ACTIVE',
            'INACTIVE'
        )
    )
);

-- =========================================================
-- 3. BOOK_PRICES
-- =========================================================
-- Giá hiện tại của sách
--
-- Mỗi sách chỉ có 1 giá
-- =========================================================

CREATE TABLE book_prices (

    -- ID giá
    id SERIAL PRIMARY KEY,

    -- ID sách
    book_id INT UNIQUE NOT NULL,

    -- Giá tiền
    price DECIMAL(15,2) NOT NULL,

    -- Đơn vị tiền
    currency VARCHAR(10) DEFAULT 'VND',

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Liên kết books
    CONSTRAINT fk_price_book
    FOREIGN KEY (book_id)
    REFERENCES books(id)
    ON DELETE CASCADE,

    -- Không cho giá âm
    CONSTRAINT chk_book_price
    CHECK (
        price >= 0
    )
);

-- =========================================================
-- 4. WALLETS
-- =========================================================
-- Ví của AUTHOR
--
-- Mỗi AUTHOR có 1 ví
-- =========================================================

CREATE TABLE wallets (

    -- ID ví
    id SERIAL PRIMARY KEY,

    -- Chủ ví
    user_id INT UNIQUE NOT NULL,

    -- Số dư hiện tại
    balance DECIMAL(15,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Liên kết users
    CONSTRAINT fk_wallet_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    -- Không cho số dư âm
    CONSTRAINT chk_wallet_balance
    CHECK (
        balance >= 0
    )
);

-- =========================================================
-- 5. ORDERS
-- =========================================================
-- Lưu lịch sử mua sách
--
-- Chia doanh thu:
-- - AUTHOR nhận 68%
-- - PLATFORM nhận 32%
-- =========================================================

CREATE TABLE orders (

    -- ID đơn hàng
    id SERIAL PRIMARY KEY,

    -- Người mua
    user_id INT NOT NULL,

    -- Sách mua
    book_id INT NOT NULL,

    -- Tổng tiền
    total_price DECIMAL(15,2) NOT NULL,

    -- AUTHOR nhận
    author_income DECIMAL(15,2) NOT NULL,

    -- PLATFORM nhận
    platform_income DECIMAL(15,2) NOT NULL,

    -- SUCCESS / FAILED
    status VARCHAR(20) DEFAULT 'SUCCESS',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Người mua
    CONSTRAINT fk_order_user
    FOREIGN KEY (user_id)
    REFERENCES users(id),

    -- Sách
    CONSTRAINT fk_order_book
    FOREIGN KEY (book_id)
    REFERENCES books(id),

    -- Không cho âm tiền
    CONSTRAINT chk_total_price
    CHECK (
        total_price >= 0
    ),

    CONSTRAINT chk_author_income
    CHECK (
        author_income >= 0
    ),

    CONSTRAINT chk_platform_income
    CHECK (
        platform_income >= 0
    ),

    -- Trạng thái hợp lệ
    CONSTRAINT chk_order_status
    CHECK (
        status IN (
            'SUCCESS',
            'FAILED'
        )
    )
);

-- =========================================================
-- 6. WALLET_TRANSACTIONS
-- =========================================================
-- Lịch sử cộng/trừ ví
-- =========================================================

CREATE TABLE wallet_transactions (

    -- ID giao dịch
    id SERIAL PRIMARY KEY,

    -- Ví
    wallet_id INT NOT NULL,

    -- Đơn hàng liên quan
    order_id INT,

    -- Số tiền
    amount DECIMAL(15,2) NOT NULL,

    -- COMMISSION / WITHDRAW
    transaction_type VARCHAR(30),

    -- Mô tả
    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Liên kết wallets
    CONSTRAINT fk_transaction_wallet
    FOREIGN KEY (wallet_id)
    REFERENCES wallets(id)
    ON DELETE CASCADE,

    -- Liên kết orders
    CONSTRAINT fk_transaction_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE SET NULL,

    -- Không cho âm tiền
    CONSTRAINT chk_transaction_amount
    CHECK (
        amount >= 0
    ),

    -- Kiểu giao dịch hợp lệ
    CONSTRAINT chk_transaction_type
    CHECK (
        transaction_type IN (
            'COMMISSION',
            'WITHDRAW'
        )
    )
);

-- =========================================================
-- 7. PLATFORM_REVENUE
-- =========================================================
-- Doanh thu nền tảng
-- =========================================================

CREATE TABLE platform_revenue (

    -- ID
    id SERIAL PRIMARY KEY,

    -- Đơn hàng
    order_id INT UNIQUE,

    -- Tiền nền tảng nhận
    amount DECIMAL(15,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Liên kết orders
    CONSTRAINT fk_platform_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

    -- Không cho âm tiền
    CONSTRAINT chk_platform_amount
    CHECK (
        amount >= 0
    )
);

-- =========================================================
-- 8. AUDIT_LOGS
-- =========================================================
-- Log hoạt động hệ thống
-- =========================================================

CREATE TABLE audit_logs (

    -- ID log
    id SERIAL PRIMARY KEY,

    -- User thao tác
    user_id INT,

    -- Nội dung thao tác
    action VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Liên kết users
    CONSTRAINT fk_log_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- =========================================================
-- 9. DỮ LIỆU MẪU
-- =========================================================

-- ADMIN duy nhất
INSERT INTO users (
    username,
    email,
    password,
    full_name,
    role
)
VALUES (
    'admin',
    'admin@gmail.com',
    '$2a$10$hashedpassword',
    'Administrator',
    'ADMIN'
);

-- AUTHOR
INSERT INTO users (
    username,
    email,
    password,
    full_name,
    nationality,
    biography,
    role
)
VALUES (
    'hoang_author',
    'author@gmail.com',
    '$2a$10$authorpassword',
    'Hoang Author',
    'Việt Nam',
    'Tác giả sách công nghệ',
    'AUTHOR'
);

-- USER mua sách
INSERT INTO users (
    username,
    email,
    password,
    full_name,
    role
)
VALUES (
    'user01',
    'user01@gmail.com',
    '$2a$10$userpassword',
    'User 01',
    'USER'
);

-- Wallet AUTHOR
INSERT INTO wallets (
    user_id,
    balance
)
VALUES (
    2,
    0
);

-- Sách
INSERT INTO books (
    title,
    description,
    published_year,
    quantity,
    author_id
)
VALUES (
    'Spring Boot Master',
    'Học Spring Boot thực chiến',
    2025,
    20,
    2
);

-- Giá sách
INSERT INTO book_prices (
    book_id,
    price
)
VALUES (
    1,
    100000
);

-- =========================================================
-- 10. QUERY DANH SÁCH SÁCH
-- =========================================================

SELECT

    b.id,

    b.title,

    u.full_name AS author_name,

    p.price,

    b.quantity,

    b.status

FROM books b

LEFT JOIN users u
ON b.author_id = u.id

LEFT JOIN book_prices p
ON b.id = p.book_id;

-- =========================================================
-- 11. QUERY XEM SỐ DƯ VÍ AUTHOR
-- =========================================================

SELECT

    u.full_name,

    w.balance

FROM wallets w

LEFT JOIN users u
ON w.user_id = u.id;

-- =========================================================
-- 12. QUERY XEM DOANH THU NỀN TẢNG
-- =========================================================

SELECT

    SUM(amount) AS total_platform_revenue

FROM platform_revenue;