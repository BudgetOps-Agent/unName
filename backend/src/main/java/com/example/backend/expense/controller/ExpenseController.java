package com.example.backend.expense.controller;

import com.example.backend.expense.dto.*;
import com.example.backend.expense.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Expense", description = "지출 등록/조회/승인/반려 및 정산 리포트 API")
@RestController // JSON 반환하는 REST API 컨트롤러
@RequiredArgsConstructor // final 필드 생성자 자동 생성
public class ExpenseController {

    // Service 주입
    private final ExpenseService expenseService;

    // 지출 목록 조회 API (API-014)
    // @PathVariable = URL 경로에서 teamId 꺼내기
    // @RequestParam(required = false) = ?status=... 형태로 오는 값 받기, 없어도 됨
    @Operation(
            summary = "지출 목록 조회 (API-014)",
            description = "팀의 지출 목록을 상태별로 조회합니다. "
                    + "status가 없거나 'ALL'이면 전체, 'SUBMITTED'면 대기(SUBMITTED+ESCALATED) 목록을 반환합니다. "
                    + "역할 무관하게 팀 소속이면 누구나 팀 전체 지출을 조회할 수 있습니다(MEMBER도 전체 조회, 2026-08-11 변경)."
    )
    @Parameter(name = "teamId", description = "팀 ID", required = true, example = "1")
    @Parameter(name = "status", description = "조회할 상태 (ALL, SUBMITTED, APPROVED, REJECTED). 생략 시 ALL", example = "SUBMITTED")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ExpenseListResponse.class)))
    })
    @GetMapping("/api/teams/{teamId}/expenses")
    public ResponseEntity<ExpenseListResponse> getExpenses(
            @PathVariable("teamId") Long teamId,
            @RequestParam(value = "status", required = false) String status
    ) {
        ExpenseListResponse response = expenseService.getExpenses(teamId, status);
        return ResponseEntity.ok(response);
    }

    // 정산 리포트 요약 조회 API (API-051)
    @Operation(
            summary = "정산 리포트 요약 조회 (API-051)",
            description = "정산 리포트 상단에 표시되는 예산 및 지출 요약 정보를 조회합니다. "
                    + "응답은 { success, summary: { totalExpense, approvedCount, totalBudget, "
                    + "usedBudget, remainingBudget, usagePercentage } } 형태입니다. "
                    + "역할 무관하게 팀 소속이면 누구나 조회할 수 있습니다(2026-08-11 변경, 이전엔 관리자·총무만)."
    )
    @Parameter(name = "teamId", description = "팀 ID", required = true, example = "1")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ReportSummaryResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "해당 팀 소속이 아님"),
            @ApiResponse(responseCode = "404", description = "예산 정보를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/api/teams/{teamId}/statistics/summary")
    public ResponseEntity<ReportSummaryResponse> getSummary(
            @PathVariable("teamId") Long teamId
    ) {
        ReportSummaryResponse response = expenseService.getSummary(teamId);
        return ResponseEntity.ok(response);
    }

    // 정산 리포트 조회 API (API-050)
    // 승인된 지출 전체 내역 조회 (예산 현황은 API-051 summary에서 별도 제공)
    @Operation(
            summary = "정산 리포트 조회 (API-050)",
            description = "승인된 지출 내역을 페이지 단위로 조회합니다 (정산 리포트 화면용). "
                    + "응답은 { success, page, size, totalElements, totalPages, expenses: [...] } 형태이며, "
                    + "expenses 각 항목엔 승인 처리자 이름(processorName, AI 자동승인이면 \"AI\")이 포함됩니다. "
                    + "page/size는 query parameter로도 받습니다 (기본값 page=0, size=10). "
                    + "역할 무관하게 팀 소속이면 누구나 조회할 수 있습니다(2026-08-11 변경, 이전엔 관리자·총무만)."
    )
    @Parameter(name = "teamId", description = "팀 ID", required = true, example = "1")
    @Parameter(name = "page", description = "페이지 번호 (0부터 시작)", example = "0")
    @Parameter(name = "size", description = "페이지당 개수", example = "10")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ReportExpenseListResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "403", description = "해당 팀 소속이 아님"),
            @ApiResponse(responseCode = "404", description = "승인된 지출 내역을 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/api/teams/{teamId}/statistics/report")
    public ResponseEntity<ReportExpenseListResponse> getReport(
            @PathVariable("teamId") Long teamId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        ReportExpenseListResponse response = expenseService.getReport(teamId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping(
            value = "/api/teams/{teamId}/statistics/report/csv",
            produces = "text/csv"
    )
    public ResponseEntity<byte[]> downloadReportCsv(
            @PathVariable("teamId") Long teamId
    ) {

        String csv = expenseService.getReportCsv(teamId);

        byte[] csvBytes = ("\uFEFF" + csv)
                .getBytes(java.nio.charset.StandardCharsets.UTF_8);

        String fileName = "정산리포트_" + teamId + ".csv";

        return ResponseEntity.ok()
                .header(
                        org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''"
                                + java.net.URLEncoder
                                .encode(
                                        fileName,
                                        java.nio.charset.StandardCharsets.UTF_8
                                )
                                .replace("+", "%20")
                )
                .contentType(
                        org.springframework.http.MediaType.parseMediaType(
                                "text/csv; charset=UTF-8"
                        )
                )
                .body(csvBytes);
    }


    // 지출 등록 (API-016)
    // POST /api/teams/{teamId}/expenses
    // multipart/form-data로 받음 (글자값 + 영수증 파일 같이 오니까)
    @Operation(
            summary = "지출 등록 (API-016)",
            description = "팀원이 영수증 파일과 함께 지출을 등록합니다. 등록 시 상태는 기본적으로 SUBMITTED입니다."
    )
    @Parameter(name = "teamId", description = "팀 ID", required = true, example = "1")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "등록 성공",
                    content = @Content(schema = @Schema(implementation = ExpenseCreateResponse.class))),
            @ApiResponse(responseCode = "400", description = "요청 값 검증 실패 (제목/금액/카테고리 등)"),
            @ApiResponse(responseCode = "403", description = "해당 팀 소속이 아님"),
            @ApiResponse(responseCode = "404", description = "사용자 또는 팀을 찾을 수 없음")
    })
    @PostMapping(
            value = "/api/teams/{teamId}/expenses",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE  // "나 multipart로 받을게" 표시
    )
    public ResponseEntity<ExpenseCreateResponse> createExpense(
            // URL의 {teamId} 부분을 꺼냄 (예전 버전 이슈 때문에 이름 명시)
            @PathVariable("teamId") Long teamId,

            // 글자값(title/amount/category/description)을 DTO에 담아서 받음
            // @Valid → DTO에 붙인 @NotBlank/@NotNull/@Positive 검증 실행
            // @ModelAttribute → form-data의 title/amount 등을 각 필드로 자동 매핑 (JSON 안 씀)
            @Valid @ModelAttribute ExpenseCreateRequest request,

            // 영수증 파일 파트를 따로 받음 (파일은 DTO에 안 넣고 여기서 별도 수령)
            @RequestPart("receiptFile") MultipartFile receiptFile
    ) {
        // Service 호출 → 저장하고 응답 DTO 받음
        ExpenseCreateResponse response = expenseService.createExpense(teamId, request, receiptFile);

        // 201 CREATED 상태로 응답 (명세: 등록 성공 = 201)
        // Service가 준 response 객체를 Spring이 자동으로 JSON 변환해서 프론트로 보냄
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 지출 상세 조회 (API-017)
    // GET /api/expenses/{expenseId}
    // 지출 한 건의 상세 정보 조회 (영수증 URL, 승인/반려 이력 포함)
    @Operation(
            summary = "지출 상세 조회 (API-017)",
            description = "지출 한 건의 상세 정보(제목, 금액, 카테고리, 영수증 URL, 승인/반려 이력 등)를 조회합니다."
    )
    @Parameter(name = "expenseId", description = "지출 ID", required = true, example = "100")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = ExpenseDetailResponse.class))),
            @ApiResponse(responseCode = "404", description = "지출을 찾을 수 없음")
    })
    @GetMapping("/api/expenses/{expenseId}")
    public ResponseEntity<ExpenseDetailResponse> getExpenseDetail(
            @PathVariable("expenseId") Long expenseId
    ) {
        ExpenseDetailResponse response = expenseService.getExpenseDetail(expenseId);
        return ResponseEntity.ok(response); // 200 OK
    }

    // AI 심사 결과 조회 (API-046)
    // GET /api/expenses/{expenseId}/review-result
    // 지출 상세 화면의 "AI 심사 결과" 카드(심사관별 소견/최종판정/처리주체/자동분류)에 대응
    // CB-001 콜백으로 저장된 심사기록을 프론트가 바로 렌더링할 수 있는 형태로 변환해서 내려줌
    @Operation(
            summary = "AI 심사 결과 조회 (API-046)",
            description = "AI 지출 심사 결과를 조회합니다. 아직 심사가 끝나지 않은(SUBMITTED) 지출은 review가 null로 내려갑니다."
    )
    @Parameter(name = "expenseId", description = "지출 ID", required = true, example = "100")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공(심사 전이면 review:null)",
                    content = @Content(schema = @Schema(implementation = ExpenseReviewResultResponse.class))),
            @ApiResponse(responseCode = "404", description = "지출을 찾을 수 없음")
    })
    @GetMapping("/api/expenses/{expenseId}/review-result")
    public ResponseEntity<ExpenseReviewResultResponse> getReviewResult(
            @PathVariable("expenseId") Long expenseId
    ) {
        ExpenseReviewResultResponse response = expenseService.getReviewResult(expenseId);
        return ResponseEntity.ok(response); // 200 OK
    }

    // 지출 수정 (API-018)
    // PUT /api/expenses/{expenseId}
    // 작성자 본인이, 승인 대기(SUBMITTED/ESCALATED) 상태인 자기 지출만 수정 가능
    // multipart/form-data로 받음 (글자값 + 영수증 파일 교체) — 등록(API-016)과 동일 방식
    // 카테고리는 AI가 채우는 값이라 수정 항목에서 제외 (등록과 동일 정책)
    @Operation(
            summary = "지출 수정 (API-018)",
            description = "작성자 본인이 승인 대기 상태의 지출을 수정합니다. 제목·금액·설명을 수정하고, "
                    + "영수증 파일을 새로 올리면 교체(안 올리면 기존 유지)합니다. "
                    + "카테고리는 AI 심사가 채우는 값이라 수정 대상이 아닙니다."
    )
    @Parameter(name = "expenseId", description = "수정할 지출 ID", required = true, example = "100")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공",
                    content = @Content(schema = @Schema(implementation = ExpenseUpdateResponse.class))),
            @ApiResponse(responseCode = "400", description = "요청 값 검증 실패 또는 승인 대기 상태가 아님"),
            @ApiResponse(responseCode = "403", description = "작성자 본인이 아님"),
            @ApiResponse(responseCode = "404", description = "지출을 찾을 수 없음")
    })
    @PutMapping(
            value = "/api/expenses/{expenseId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ExpenseUpdateResponse> updateExpense(
            @PathVariable("expenseId") Long expenseId,
            @Valid @ModelAttribute ExpenseUpdateRequest request,
            // 영수증 교체 안 하면 안 보낼 수 있으므로 required = false
            @RequestPart(value = "receiptFile", required = false) MultipartFile receiptFile
    ) {
        ExpenseUpdateResponse response = expenseService.updateExpense(expenseId, request, receiptFile);
        return ResponseEntity.ok(response); // 200 OK
    }

    // 지출 삭제 (API-021)
    // DELETE /api/expenses/{expenseId}
    // 작성자 본인이, 승인 대기(SUBMITTED/ESCALATED) 상태인 자기 지출만 DB에서 완전 삭제
    @Operation(
            summary = "지출 삭제 (API-021)",
            description = "작성자 본인이 승인 대기 상태의 지출을 DB에서 완전 삭제(hard delete)합니다. "
                    + "딸린 알림·심사기록도 함께 삭제됩니다. 승인·반려로 처리된 건은 삭제할 수 없습니다."
    )
    @Parameter(name = "expenseId", description = "삭제할 지출 ID", required = true, example = "100")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "삭제 성공",
                    content = @Content(schema = @Schema(implementation = ExpenseDeleteResponse.class))),
            @ApiResponse(responseCode = "400", description = "승인 대기 상태가 아님"),
            @ApiResponse(responseCode = "403", description = "작성자 본인이 아님"),
            @ApiResponse(responseCode = "404", description = "지출을 찾을 수 없음")
    })
    @DeleteMapping("/api/expenses/{expenseId}")
    public ResponseEntity<ExpenseDeleteResponse> deleteExpense(
            @PathVariable("expenseId") Long expenseId
    ) {
        ExpenseDeleteResponse response = expenseService.deleteExpense(expenseId);
        return ResponseEntity.ok(response); // 200 OK
    }

    // 지출 반려 (API-020)
    // POST /api/expenses/{expenseId}/reject
    // 관리자/총무가 지출을 반려. rejectReason 필수(body)라 @Valid로 검증
    @Operation(
            summary = "지출 반려 (API-020)",
            description = "관리자(ADMIN) 또는 회계 담당자(ACCOUNTANT)가 지출을 반려합니다. "
                    + "반려 사유는 필수이며 expenses_reviews 테이블에 함께 기록됩니다."
    )
    @Parameter(name = "expenseId", description = "반려할 지출 ID", required = true, example = "100")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "반려 성공",
                    content = @Content(schema = @Schema(implementation = ExpenseRejectResponse.class))),
            @ApiResponse(responseCode = "400", description = "반려 사유 누락 등 요청 값 검증 실패"),
            @ApiResponse(responseCode = "403", description = "반려 권한 없음 (ADMIN/ACCOUNTANT만 가능)"),
            @ApiResponse(responseCode = "404", description = "지출을 찾을 수 없음"),
            @ApiResponse(responseCode = "409", description = "이미 처리된 지출 (ALREADY_PROCESSED)")
    })
    @PostMapping("/api/expenses/{expenseId}/reject")
    public ResponseEntity<ExpenseRejectResponse> rejectExpense(
            @PathVariable("expenseId") Long expenseId,
            @Valid @RequestBody ExpenseRejectRequest request  // 반려 사유를 JSON body로 받음
    ) {
        ExpenseRejectResponse response = expenseService.rejectExpense(expenseId, request);
        return ResponseEntity.ok(response); // 200 OK
    }

    // 지출 승인 (API-019)
    // POST /api/expenses/{expenseId}/approve
    // 관리자/총무가 지출을 승인. 요청 body 없음(-)이라 @Valid/@RequestBody 없음
    @Operation(
            summary = "지출 승인 (API-019)",
            description = "관리자(ADMIN) 또는 회계 담당자(ACCOUNTANT)가 지출을 승인합니다. "
                    + "승인 시 팀 예산의 usedBudget이 증가하며, 남은 예산보다 지출 금액이 크면 승인이 거부됩니다."
    )
    @Parameter(name = "expenseId", description = "승인할 지출 ID", required = true, example = "100")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "승인 성공",
                    content = @Content(schema = @Schema(implementation = ExpenseApproveResponse.class))),
            @ApiResponse(responseCode = "403", description = "승인 권한 없음 (ADMIN/ACCOUNTANT만 가능)"),
            @ApiResponse(responseCode = "404", description = "지출 또는 예산 정보를 찾을 수 없음"),
            @ApiResponse(responseCode = "409", description = "이미 처리된 지출(ALREADY_PROCESSED) 또는 예산 초과(BUDGET_EXCEEDED)")
    })
    @PostMapping("/api/expenses/{expenseId}/approve")
    public ResponseEntity<ExpenseApproveResponse> approveExpense(
            @PathVariable("expenseId") Long expenseId
    ) {
        ExpenseApproveResponse response = expenseService.approveExpense(expenseId);
        return ResponseEntity.ok(response); // 200 OK
    }

    // 월별 지출 통계 (API-047)
    // GET /api/teams/{teamId}/statistics/monthly?months=5
    // 최근 N개월의 월별 승인 지출 합계 (대시보드 막대그래프용)
    @GetMapping("/api/teams/{teamId}/statistics/monthly")
    public ResponseEntity<MonthlyStatsResponse> getMonthlyStats(
            @PathVariable("teamId") Long teamId,
            @RequestParam(value = "months", required = false) Integer months
    ) {
        MonthlyStatsResponse response = expenseService.getMonthlyStats(teamId, months);
        return ResponseEntity.ok(response); // 200 OK
    }

    // 카테고리별 지출 통계 (API-048)
    // GET /api/teams/{teamId}/statistics/category
    // 이번 달 승인된 지출의 카테고리별 합계 (예산 관리 화면 도넛차트용)
    @GetMapping("/api/teams/{teamId}/statistics/category")
    public ResponseEntity<CategoryStatsResponse> getCategoryStats(
            @PathVariable("teamId") Long teamId
    ) {
        CategoryStatsResponse response = expenseService.getCategoryStats(teamId);
        return ResponseEntity.ok(response); // 200 OK
    }
}