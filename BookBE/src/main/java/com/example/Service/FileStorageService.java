package com.example.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    /**
     * Hàm dùng chung để lưu file vào một thư mục cụ thể
     * 
     * @param file Đối tượng file nhận từ Client
     * @param targetDir Thư mục đích muốn lưu (Lấy từ .env)
     * @return Tên file duy nhất sau khi lưu thành công
     */
    public String storeFile(MultipartFile file, String targetDir) throws IOException {
        // Tạo thư mục nếu chưa tồn tại
        Path uploadPath = Paths.get(targetDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Tạo tên file ngẫu nhiên bằng UUID để không trùng lặp
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        // Lưu file vật lý vào ổ cứng
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return uniqueFileName;
    }

    /**
     * Hàm dùng chung để xóa file cũ khỏi ổ cứng
     * 
     * @param fileName Tên file cần xóa
     * @param targetDir Thư mục chứa file đó
     */
    public void deleteFile(String fileName, String targetDir) {
        if (fileName == null || fileName.isEmpty()) {
            return;
        }
        try {
            Path filePath = Paths.get(targetDir).resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log lỗi ra nếu không xóa được (có thể do file không tồn tại hoặc bị khóa)
            System.err.println("Không thể xóa file: " + fileName + ". Lỗi: " + e.getMessage());
        }
    }
}
