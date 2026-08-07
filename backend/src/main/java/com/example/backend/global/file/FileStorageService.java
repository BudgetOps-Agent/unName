package com.example.backend.global.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service // 이 클래스도 Spring이 관리하는 부품(Bean)으로 등록. 나중에 ExpenseService에서 주입받아 씀
public class FileStorageService {

    // 파일이 저장될 폴더 경로. 프로젝트 루트 밑의 uploads 폴더에 저장함
    // 나중에 S3로 바꿀 때 이 클래스 안만 갈아끼우면 됨 (ExpenseService는 안건드림)
    private final String uploadDir = "uploads";

    // 허용할 파일 확장자 (화면에 jpg, png, pdf 라고 적혀있으니 그대로)
    private final List<String> allowedExtensions = List.of("jpg", "jpeg", "png", "pdf");

    // 최대 파일 크기 10MB (화면에 "최대 10MB"라고 적혀있음)
    // 10 * 1024 * 1024 = 10485760 바이트
    private final long maxFileSize = 10 * 1024 * 1024;

    // 회칙 파일 허용 확장자 (PDF, Word만)
    private final List<String> allowedPolicyExtensions = List.of("pdf", "docx");

    // application.properties의 file.base-url 값 주입 (배포 시 이 값만 바꾸면 됨)
    @Value("${file.base-url}")
    private String baseUrl;

    /**
     * 영수증 파일을 uploads 폴더에 저장하고, 저장된 경로(receiptUrl에 넣을 값)를 돌려줌
     */
    public String store(MultipartFile file) {

        // 1. 파일이 아예 안 왔거나 비어있으면 막기 (영수증은 필수라서)
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("영수증 파일이 없습니다.");
        }

        // 2. 파일 크기 검사 (10MB 초과 막기)
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("파일 크기는 10MB를 넘을 수 없습니다.");
        }

        // 3. 원본 파일 이름에서 확장자만 뽑아내기 (예: "영수증.jpg" → "jpg")
        String originalName = file.getOriginalFilename(); // 사용자가 올린 원래 파일 이름
        String extension = extractExtension(originalName); // 아래 private 메서드로 확장자 추출

        // 4. 허용된 확장자인지 검사 (jpg/png/pdf만 통과)
        if (!allowedExtensions.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("jpg, png, pdf 파일만 업로드 가능합니다.");
        }

        // 5. 저장할 새 파일 이름 만들기 = UUID(랜덤 고유값) + 확장자
        //    이렇게 하는 이유: 딴 사람이 똑같이 "영수증.jpg"를 올려도
        //    UUID가 다 달라서 서로 덮어쓰지 않음
        String storedName = UUID.randomUUID() + "." + extension;

        try {
            // 6. uploads 폴더 경로 준비. 폴더가 없으면 자동으로 만들어줌 (네가 직접 안 만들어도 됨)
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 7. 실제로 파일을 그 폴더에 저장 (핵심 한 줄)
            Path targetPath = uploadPath.resolve(storedName);
            file.transferTo(targetPath);

            // 8. DB(receiptUrl)에 저장할 경로를 돌려줌 (예: "uploads/랜덤값.jpg")
            return uploadDir + "/" + storedName;

        } catch (IOException e) {
            // 파일 저장 중 문제 생기면 예외 던짐 (디스크 꽉 참, 권한 문제 등)
            throw new RuntimeException("파일 저장에 실패했습니다.", e);
        }
    }

    // 회칙 파일 저장 (2단계) — pdf, docx만 허용
    // 반환값: LLM한테 넘길 완성 URL (예: http://localhost:8080/api/files/xxx.pdf)
    public String storePolicy(MultipartFile file) {
        // 1. 파일 없으면 예외
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("회칙 파일이 없습니다.");
        }

        // 2. 크기 검사 (10MB)
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("파일 크기는 10MB를 넘을 수 없습니다.");
        }

        // 3. 확장자 검사 (pdf, docx만)
        String originalName = file.getOriginalFilename();
        String extension = extractExtension(originalName);
        if (!allowedPolicyExtensions.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("PDF 또는 Word(docx) 파일만 업로드 가능합니다.");
        }

        // 4. UUID로 파일명 만들기 (중복 방지)
        String storedName = UUID.randomUUID() + "." + extension;

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path targetPath = uploadPath.resolve(storedName);
            file.transferTo(targetPath);

            // 5. 완성 URL 반환 (LLM한테 이 URL 전달)
            // 로컬: http://localhost:8080/api/files/xxx.pdf
            // 배포: 실도메인/api/files/xxx.pdf (properties만 바꾸면 됨)
            return baseUrl + "/api/files/" + storedName;

        } catch (IOException e) {
            throw new RuntimeException("파일 저장에 실패했습니다.", e);
        }
    }


        // 파일 이름에서 확장자만 뽑는 도우미 메서드
        // "영수증.jpg" → "jpg" / 점이 없으면 예외
    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new IllegalArgumentException("잘못된 파일 형식입니다.");
        }
        // 마지막 점 뒤부터 끝까지가 확장자 (예: "my.file.jpg"면 맨 뒤 "jpg"만)
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    // 저장된 파일을 읽어서 Resource(파일 자원)로 반환
    // 파일 제공 통로(FileController)에서 이걸 불러서 프론트로 내려줌
    public Resource loadAsResource(String fileName) {
        try {
            // uploads 폴더 밑에서 해당 파일 경로 찾기
            Path filePath = Paths.get(uploadDir).resolve(fileName);

            // 파일을 URL 자원으로 변환
            Resource resource = new UrlResource(filePath.toUri());

            // 파일이 실제로 존재하고 읽을 수 있으면 반환
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("파일을 찾을 수 없습니다: " + fileName);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("파일 경로가 잘못되었습니다: " + fileName, e);
        }
    }

}