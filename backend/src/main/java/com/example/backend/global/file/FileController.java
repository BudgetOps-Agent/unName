package com.example.backend.global.file;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    // 영수증 파일 제공 (017에서 만든 /api/files/{fileName} URL이 여기로 옴)
    // 프론트가 이 주소로 요청하면 실제 이미지 파일을 내려줌
    @GetMapping("/api/files/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable("fileName") String fileName) {

        // uploads 폴더(또는 S3)에서 파일 찾아서 Resource로 가져옴
        Resource resource = fileStorageService.loadAsResource(fileName);

        // Content-Type을 확장자로 직접 판단해서 명시 — S3 모드에선 ByteArrayResource라
        // 파일명 정보가 없어서 자동 감지가 안 먹기 때문에 직접 지정해야 이미지가 정상 렌더링됨
        return ResponseEntity.ok()
                .contentType(resolveMediaType(fileName))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }

    // 확장자 → Content-Type 매핑 (FileStorageService가 허용하는 jpg/jpeg/png/pdf/docx만 다루면 충분)
    private MediaType resolveMediaType(String fileName) {
        String ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        return switch (ext) {
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "docx" -> MediaType.valueOf("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}