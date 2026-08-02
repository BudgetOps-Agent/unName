package com.example.backend.expense.controller;

import com.example.backend.expense.dto.*;
import com.example.backend.expense.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController // JSON 반환하는 REST API 컨트롤러
@RequiredArgsConstructor // final 필드 생성자 자동 생성
public class ExpenseController {

    // Service 주입
    private final ExpenseService expenseService;

    // 지출 목록 조회 API (API-014)
    // @PathVariable = URL 경로에서 teamId 꺼내기
    // @RequestParam(required = false) = ?status=... 형태로 오는 값 받기, 없어도 됨
    @GetMapping("/api/teams/{teamId}/expenses")
    public ResponseEntity<ExpenseListResponse> getExpenses(
            @PathVariable("teamId") Long teamId,
            @RequestParam(value = "status", required = false) String status
    ) {
        ExpenseListResponse response = expenseService.getExpenses(teamId, status);
        return ResponseEntity.ok(response);
    }

    // 정산 리포트 조회 API (API-050)
    // 승인된 지출 내역 + 예산 현황을 한 번에 조회
    @GetMapping("/api/teams/{teamId}/statistics/report")
    public ResponseEntity<ReportResponse> getReport(
            @PathVariable("teamId") Long teamId) {
        ReportResponse response = expenseService.getReport(teamId);
        return ResponseEntity.ok(response);
    }

    // 지출 등록 (API-016)
    // POST /api/teams/{teamId}/expenses
    // multipart/form-data로 받음 (글자값 + 영수증 파일 같이 오니까)
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
    @GetMapping("/api/expenses/{expenseId}")
    public ResponseEntity<ExpenseDetailResponse> getExpenseDetail(
            @PathVariable("expenseId") Long expenseId
    ) {
        ExpenseDetailResponse response = expenseService.getExpenseDetail(expenseId);
        return ResponseEntity.ok(response); // 200 OK
    }

    // 지출 반려 (API-020)
    // POST /api/expenses/{expenseId}/reject
    // 관리자/총무가 지출을 반려. rejectReason 필수(body)라 @Valid로 검증
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
}