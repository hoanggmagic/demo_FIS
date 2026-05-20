-- 1. TẠO BẢNG TÁC GIẢ (AUTHORS)
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,              -- Mã tác giả tự tăng
    author_name VARCHAR(100) NOT NULL,  -- Tên tác giả
    nationality VARCHAR(50)             -- Quốc tịch
);

-- 2. TẠO BẢNG SÁCH (BOOKS) - LIÊN KẾT VỚI BẢNG TÁC GIẢ
CREATE TABLE books (
    id SERIAL PRIMARY KEY,              -- Mã sách tự tăng
    title VARCHAR(150) NOT NULL,        -- Tên sách
    published_year INT,                 -- Năm xuất bản
    author_id INT,                      -- Khóa ngoại liên kết với bảng authors
    CONSTRAINT fk_book_author FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL
);

-- 3. TẠO BẢNG GIÁ SÁCH (BOOK_PRICES) - LIÊN KẾT VỚI BẢNG SÁCH
CREATE TABLE book_prices (
    id SERIAL PRIMARY KEY,              -- Mã giá tự tăng
    book_id INT UNIQUE,                 -- Khóa ngoại liên kết với bảng books (UNIQUE vì mỗi sách có 1 giá hiện tại)
    price DECIMAL(10, 2) NOT NULL,      -- Giá tiền (Ví dụ: 150000.00)
    currency VARCHAR(10) DEFAULT 'VND', -- Đơn vị tiền tệ
    CONSTRAINT fk_price_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- =========================================================================
-- 4. CHÈN DỮ LIỆU MẪU ĐỂ TEST QUAN HỆ GIỮA CÁC BẢNG

-- Thêm tác giả (Sinh ra id 1 và id 2)
INSERT INTO authors (author_name, nationality) VALUES 
('Nguyễn Văn A', 'Việt Nam'),
('Trần Thị B', 'Việt Nam');

-- Thêm sách (Liên kết author_id vào id của bảng authors)
INSERT INTO books (title, published_year, author_id) VALUES 
('Lập Trình Java Cho Người Mới Bắt Đầu', 2024, 1), -- Sách của Nguyễn Văn A
('Cấu Trúc Dữ Liệu Và Giải Thuật', 2025, 2);       -- Sách của Trần Thị B

-- Thêm giá cho từng cuốn sách (Liên kết book_id vào id của bảng books)
INSERT INTO book_prices (book_id, price) VALUES 
(1, 150000.00), -- Giá của cuốn Java là 150k
(2, 220000.00); -- Giá của cuốn Cấu trúc dữ liệu là 220k

-- =========================================================================
-- 5. CÂU LỆNH KIỂM TRA: GỘP 3 BẢNG LẠI ĐỂ XEM ĐẦY ĐỦ THÔNG TIN
SELECT 
    b.id AS ma_sach,
    b.title AS ten_sach,
    a.author_name AS tac_gia,
    p.price AS gia_tien,
    p.currency AS don_vi
FROM books b
JOIN authors a ON b.author_id = a.id
JOIN book_prices p ON b.id = p.book_id;