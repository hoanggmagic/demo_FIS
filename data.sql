-- =========================================================
-- SAMPLE DATA FULL
-- DIGITAL BOOK PLATFORM
-- =========================================================

-- =========================================================
-- USERS
-- =========================================================

INSERT INTO users (
    username,
    email,
    password,
    full_name,
    nationality,
    biography,
    role
)
VALUES

-- ADMIN
(
    'admin',
    'admin@gmail.com',

    -- password: 1234
    '$2b$12$g5Y3s/UJxoQWxMQU3DDl3umEqI/FAlxK3N6qZJZN6sH8hXjF7n5ii',

    'Administrator',
    'Việt Nam',
    'Quản trị hệ thống',
    'ADMIN'
),

-- AUTHORS
(
    'author01',
    'author01@gmail.com',

    -- password: 123456
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7XQ5z9N6byN1Nsx3Rp3XIanFkFJxG',

    'Nguyễn Văn A',
    'Việt Nam',
    'Tác giả Java',
    'AUTHOR'
),

(
    'author02',
    'author02@gmail.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7XQ5z9N6byN1Nsx3Rp3XIanFkFJxG',
    'Trần Văn B',
    'Việt Nam',
    'Tác giả Spring Boot',
    'AUTHOR'
),

(
    'author03',
    'author03@gmail.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7XQ5z9N6byN1Nsx3Rp3XIanFkFJxG',
    'Lê Văn C',
    'Mỹ',
    'Tác giả ReactJS',
    'AUTHOR'
),

(
    'author04',
    'author04@gmail.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7XQ5z9N6byN1Nsx3Rp3XIanFkFJxG',
    'J. K. Rowling',
    'Anh',
    'Tác giả Harry Potter',
    'AUTHOR'
),

(
    'author05',
    'author05@gmail.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7XQ5z9N6byN1Nsx3Rp3XIanFkFJxG',
    'Tô Hoài',
    'Việt Nam',
    'Tác giả Dế Mèn Phiêu Lưu Ký',
    'AUTHOR'
),

-- USERS
(
    'user01',
    'user01@gmail.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7XQ5z9N6byN1Nsx3Rp3XIanFkFJxG',
    'User 01',
    'Việt Nam',
    NULL,
    'USER'
),

(
    'user02',
    'user02@gmail.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7XQ5z9N6byN1Nsx3Rp3XIanFkFJxG',
    'User 02',
    'Việt Nam',
    NULL,
    'USER'
),

(
    'user03',
    'user03@gmail.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7XQ5z9N6byN1Nsx3Rp3XIanFkFJxG',
    'User 03',
    'Nhật Bản',
    NULL,
    'USER'
),

(
    'user04',
    'user04@gmail.com',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoOHi7XQ5z9N6byN1Nsx3Rp3XIanFkFJxG',
    'User 04',
    'Hàn Quốc',
    NULL,
    'USER'
);

-- =========================================================
-- WALLETS
-- =========================================================

INSERT INTO wallets (
    user_id,
    balance
)
VALUES

(2, 680000),
(3, 920000),
(4, 450000),
(5, 1500000),
(6, 300000);

-- =========================================================
-- BOOKS
-- =========================================================

INSERT INTO books (
    title,
    description,
    published_year,
    quantity,
    author_id
)
VALUES

(
    'Java Core',
    'Học Java từ cơ bản đến nâng cao',
    2024,
    10,
    2
),

(
    'Spring Boot REST API',
    'Xây dựng REST API bằng Spring Boot',
    2025,
    12,
    3
),

(
    'ReactJS Beginner',
    'ReactJS cho người mới',
    2025,
    15,
    4
),

(
    'Harry Potter 1',
    'Tiểu thuyết phù thủy nổi tiếng',
    1997,
    20,
    5
),

(
    'Harry Potter 2',
    'Harry Potter phần 2',
    1998,
    18,
    5
),

(
    'Dế Mèn Phiêu Lưu Ký',
    'Tác phẩm văn học Việt Nam',
    1941,
    25,
    6
),

(
    'Spring Security JWT',
    'Bảo mật Spring Boot với JWT',
    2026,
    8,
    3
),

(
    'Docker For Java',
    'Docker cho Java Developer',
    2025,
    14,
    2
),

(
    'Microservices Architecture',
    'Kiến trúc Microservices',
    2026,
    5,
    3
),

(
    'React Advanced',
    'ReactJS nâng cao',
    2026,
    7,
    4
);

-- =========================================================
-- BOOK_PRICES
-- =========================================================

INSERT INTO book_prices (
    book_id,
    price
)
VALUES

(1, 120000),
(2, 150000),
(3, 130000),
(4, 200000),
(5, 220000),
(6, 90000),
(7, 180000),
(8, 160000),
(9, 250000),
(10, 190000);

-- =========================================================
-- ORDERS
-- =========================================================

INSERT INTO orders (
    user_id,
    book_id,
    total_price,
    author_income,
    platform_income,
    status
)
VALUES

(7, 1, 120000, 81600, 38400, 'SUCCESS'),
(8, 2, 150000, 102000, 48000, 'SUCCESS'),
(9, 3, 130000, 88400, 41600, 'SUCCESS'),
(10, 4, 200000, 136000, 64000, 'SUCCESS'),
(7, 5, 220000, 149600, 70400, 'SUCCESS'),
(8, 6, 90000, 61200, 28800, 'SUCCESS'),
(9, 7, 180000, 122400, 57600, 'SUCCESS'),
(10, 8, 160000, 108800, 51200, 'SUCCESS'),
(7, 9, 250000, 170000, 80000, 'SUCCESS'),
(8, 10, 190000, 129200, 60800, 'SUCCESS');

-- =========================================================
-- WALLET_TRANSACTIONS
-- =========================================================

INSERT INTO wallet_transactions (
    wallet_id,
    order_id,
    amount,
    transaction_type,
    description
)
VALUES

(1, 1, 81600, 'COMMISSION', 'Doanh thu Java Core'),
(2, 2, 102000, 'COMMISSION', 'Doanh thu Spring Boot'),
(3, 3, 88400, 'COMMISSION', 'Doanh thu ReactJS'),
(4, 4, 136000, 'COMMISSION', 'Doanh thu Harry Potter 1'),
(4, 5, 149600, 'COMMISSION', 'Doanh thu Harry Potter 2'),
(5, 6, 61200, 'COMMISSION', 'Doanh thu Dế Mèn'),
(2, 7, 122400, 'COMMISSION', 'Doanh thu Spring Security'),
(1, 8, 108800, 'COMMISSION', 'Doanh thu Docker Java'),
(2, 9, 170000, 'COMMISSION', 'Doanh thu Microservices'),
(3, 10, 129200, 'COMMISSION', 'Doanh thu React Advanced');

-- =========================================================
-- PLATFORM_REVENUE
-- =========================================================

INSERT INTO platform_revenue (
    order_id,
    amount
)
VALUES

(1, 38400),
(2, 48000),
(3, 41600),
(4, 64000),
(5, 70400),
(6, 28800),
(7, 57600),
(8, 51200),
(9, 80000),
(10, 60800);

-- =========================================================
-- AUDIT_LOGS
-- =========================================================

INSERT INTO audit_logs (
    user_id,
    action
)
VALUES

(1, 'ADMIN đã đăng nhập'),

(2, 'AUTHOR đã thêm sách Java Core'),

(3, 'AUTHOR đã thêm sách Spring Boot REST API'),

(4, 'AUTHOR đã thêm sách ReactJS Beginner'),

(5, 'AUTHOR đã thêm Harry Potter 1'),

(6, 'AUTHOR đã thêm Dế Mèn Phiêu Lưu Ký'),

(7, 'USER đã mua Java Core'),

(8, 'USER đã mua Spring Boot REST API'),

(9, 'USER đã mua ReactJS Beginner'),

(1, 'ADMIN đã xem dashboard doanh thu');