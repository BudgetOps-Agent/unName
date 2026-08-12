package com.example.backend.policy.controller;

import com.example.backend.global.file.FileStorageService;
import com.example.backend.policy.dto.PolicyCreateRequest;
import com.example.backend.policy.dto.PolicyCreateResponse;
import com.example.backend.policy.dto.PolicyDetailResponse;
import com.example.backend.policy.dto.PolicyRecommendRequest;
import com.example.backend.policy.dto.PolicyRecommendResponse;
import com.example.backend.policy.entity.Policy;
import com.example.backend.policy.service.PolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Tag(name = "Policy", description = "회칙(정책) 등록/조회/수정/삭제 API")
@RestController // JSON 반환하는 REST API 컨트롤러
@RequiredArgsConstructor // final 필드 생성자 자동 생성
public class PolicyController {

    // Service 주입
    private final PolicyService policyService;
    private final FileStorageService fileStorageService; // 회칙 파일 다운로드용

    // 회칙 등록 (API-031)
    // POST /api/teams/{teamId}/policies
    // multipart/form-data로 받음 (글자값 + 회칙 파일 같이 오니까)
    //
    // 지출 등록(API-016)이랑 똑같은 방식으로 맞춤:
    // 글자값은 @ModelAttribute로 폼 필드 하나씩 받고, 파일만 @RequestPart로 따로 받음
    @Operation(
            summary = "회칙 등록 (API-031)",
            description = "관리자가 모임의 회칙을 등록합니다. 회칙은 팀당 1개이며, 이미 등록된 회칙이 있으면 덮어씁니다. "
                    + "policyType=FILE이면 file 파트가 필수(PDF/docx, 최대 10MB), "
                    + "policyType=TEXT이면 content가 필수입니다(직접 입력·AI 초안 공통)."
    )
    @Parameter(name = "teamId", description = "팀 ID", required = true, example = "1")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "등록 성공",
                    content = @Content(schema = @Schema(implementation = PolicyCreateResponse.class))),
            @ApiResponse(responseCode = "400", description = "요청 값 검증 실패 (제목 누락, FILE인데 파일 없음, TEXT인데 내용 없음, 허용 안 되는 확장자 등)"),
            @ApiResponse(responseCode = "403", description = "관리자가 아니거나 해당 팀 소속이 아님"),
            @ApiResponse(responseCode = "404", description = "사용자 또는 팀을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping(
            value = "/api/teams/{teamId}/policies",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE  // "나 multipart로 받을게" 표시
    )
    public ResponseEntity<PolicyCreateResponse> createPolicy(
            // URL의 {teamId} 부분을 꺼냄
            @PathVariable("teamId") Long teamId,

            // 글자값(policyType/content)을 DTO에 담아서 받음
            // @Valid → DTO에 붙인 @NotNull 검증 실행
            // @ModelAttribute → form-data의 policyType 등을 각 필드로 자동 매핑 (JSON 안 씀)
            @Valid @ModelAttribute PolicyCreateRequest request,

            // 회칙 파일 파트 (TEXT 방식일 땐 안 보내므로 required = false)
            // "FILE인데 파일 없음" 체크는 Service에서 처리 (400)
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        // Service 호출 → 저장하고 응답 DTO 받음
        PolicyCreateResponse response = policyService.createPolicy(teamId, request, file);

        // 201 CREATED 상태로 응답 (명세: 등록 성공 = 201)
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 팀 회칙 조회
    // GET /api/teams/{teamId}/policy
    // 회칙·정책 관리 화면 진입 시 현재 등록된 회칙(텍스트/AI초안 내용 또는 파일명+다운로드링크) 표시용
    @Operation(
            summary = "팀 회칙 조회",
            description = "팀에 등록된 회칙을 조회합니다. TEXT(직접입력·AI초안)면 content가, "
                    + "FILE이면 fileName·downloadUrl이 채워집니다. 아직 등록 안 했으면 policy:null(404 아님)."
    )
    @Parameter(name = "teamId", description = "팀 ID", required = true, example = "1")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공(미등록이면 policy:null)",
                    content = @Content(schema = @Schema(implementation = PolicyDetailResponse.class))),
            @ApiResponse(responseCode = "403", description = "해당 팀 소속이 아님")
    })
    @GetMapping("/api/teams/{teamId}/policy")
    public ResponseEntity<PolicyDetailResponse> getPolicy(
            @PathVariable("teamId") Long teamId
    ) {
        return ResponseEntity.ok(policyService.getPolicyByTeam(teamId));
    }

    // 회칙 파일 다운로드 (API-035)
    // GET /api/policies/{policyId}/download
    // FileController(/api/files/{fileName})는 미리보기용(inline)이라, 여기는
    // Content-Disposition: attachment로 브라우저가 무조건 저장하게 강제하는 별도 엔드포인트
    @Operation(
            summary = "회칙 파일 다운로드 (API-035)",
            description = "회칙에 첨부된 원본 파일(PDF/docx)을 다운로드합니다. "
                    + "policyType=TEXT(직접 입력·AI 초안)인 회칙은 첨부 파일이 없어 400을 반환합니다."
    )
    @Parameter(name = "policyId", description = "회칙 ID", required = true, example = "1")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "다운로드 성공"),
            @ApiResponse(responseCode = "400", description = "TEXT 방식이라 첨부 파일 없음"),
            @ApiResponse(responseCode = "403", description = "해당 팀 소속이 아님"),
            @ApiResponse(responseCode = "404", description = "회칙을 찾을 수 없음")
    })
    @GetMapping("/api/policies/{policyId}/download")
    public ResponseEntity<Resource> downloadPolicy(
            @PathVariable("policyId") Long policyId
    ) {
        Policy policy = policyService.getPolicyForDownload(policyId);

        // filePath("uploads/uuid.ext")에서 저장된 파일명만 뽑아서 실제 파일을 읽어옴
        String filePath = policy.getFilePath();
        String storedFileName = filePath.substring(filePath.lastIndexOf("/") + 1);
        Resource resource = fileStorageService.loadAsResource(storedFileName);

        MediaType mediaType = (policy.getMimeType() != null && !policy.getMimeType().isBlank())
                ? MediaType.parseMediaType(policy.getMimeType())
                : MediaType.APPLICATION_OCTET_STREAM;

        // 한글 파일명도 깨지지 않게 UTF-8 인코딩 규격(RFC 5987)으로 내려줌 (CSV 다운로드와 동일 방식)
        String encodedFileName = URLEncoder.encode(policy.getFileName(), StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                .body(resource);
    }

    // AI 정책 추천 (API-044)
    // POST /api/policies/recommend
    // 마법사 회칙 단계의 "AI 초안 생성하기" 버튼에 대응.
    // 백엔드가 모임 정보를 모아 LLM-005(/v1/policy-draft)를 부르고 초안을 그대로 내려줌.
    //
    // 여기서 저장은 안 함 — 사용자가 초안을 편집한 뒤 API-031로 저장하는 흐름
    @Operation(
            summary = "AI 정책 추천 (API-044)",
            description = "모임 유형·예산·회비·인원 정보를 바탕으로 AI가 회칙 초안을 생성합니다. "
                    + "동기 응답이며, 초안은 저장되지 않으므로 사용자가 확인·편집 후 API-031로 저장해야 합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "초안 생성 성공",
                    content = @Content(schema = @Schema(implementation = PolicyRecommendResponse.class))),
            @ApiResponse(responseCode = "400", description = "teamId 누락"),
            @ApiResponse(responseCode = "403", description = "관리자가 아니거나 해당 팀 소속이 아님"),
            @ApiResponse(responseCode = "404", description = "사용자·팀·예산 정보를 찾을 수 없음"),
            @ApiResponse(responseCode = "502", description = "AI 서버 응답 실패")
    })
    @PostMapping("/api/policies/recommend")
    public ResponseEntity<PolicyRecommendResponse> recommendPolicies(
            @Valid @RequestBody PolicyRecommendRequest request
    ) {
        PolicyRecommendResponse response = policyService.recommendPolicies(request.getTeamId());
        return ResponseEntity.ok(response); // 200 OK
    }
}
