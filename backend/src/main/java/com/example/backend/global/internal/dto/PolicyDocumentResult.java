package com.example.backend.global.internal.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.core.io.Resource;

// BE-005 회칙 원본 조회 결과 캐리어 (서비스 → 컨트롤러)
// TEXT면 content로, FILE이면 resource+mimeType+fileName으로 내려줌.
// 실제 HTTP 응답(Content-Type/Content-Disposition) 조립은 컨트롤러가 담당
@Getter
@Builder
public class PolicyDocumentResult {

    private boolean text;        // true=TEXT(직접입력/AI초안), false=FILE(pdf/docx)
    private String content;      // TEXT일 때 회칙 원문
    private Resource resource;   // FILE일 때 파일 자원
    private String mimeType;     // FILE일 때 MIME (application/pdf 등)
    private String fileName;     // FILE일 때 원본 파일명 (Content-Disposition용)

    public static PolicyDocumentResult ofText(String content) {
        return PolicyDocumentResult.builder()
                .text(true)
                .content(content)
                .build();
    }

    public static PolicyDocumentResult ofFile(Resource resource, String mimeType, String fileName) {
        return PolicyDocumentResult.builder()
                .text(false)
                .resource(resource)
                .mimeType(mimeType)
                .fileName(fileName)
                .build();
    }
}
