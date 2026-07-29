package com.example.backend.global.file;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
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

        // uploads 폴더에서 파일 찾아서 Resource로 가져옴
        Resource resource = fileStorageService.loadAsResource(fileName);

        // 파일을 브라우저에서 바로 볼 수 있게 inline으로 내려줌
        // (attachment로 하면 다운로드됨, inline이면 화면에 표시)
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }
}