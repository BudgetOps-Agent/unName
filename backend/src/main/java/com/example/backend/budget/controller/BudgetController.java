package com.example.backend.budget.controller;

import com.example.backend.budget.dto.BudgetInsightsResponse;
import com.example.backend.budget.dto.BudgetResponse;
import com.example.backend.budget.dto.BudgetUpdateRequest;
import com.example.backend.budget.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Budget", description = "예산 조회/수정 API")
@RestController // JSON 반환하는 REST API 컨트롤러
@RequiredArgsConstructor // final 필드 생성자 자동 생성
public class BudgetController {

    // Service 주입
    private final BudgetService budgetService;

    // 예산 조회 (API-026)
    // GET /api/teams/{teamId}/budget
    // 예산 관리 화면 상단(총 예산 / 사용됨 / 잔여 / N% 사용됨)에 쓰임
    // 잔여·사용률은 백엔드에서 계산해서 내려줌
    @Operation(
            summary = "예산 조회 (API-026)",
            description = "모임의 총 예산·사용 예산·잔여 예산·사용률(%)을 조회합니다. "
                    + "잔여 예산과 사용률은 저장값이 아니라 백엔드가 계산해서 내려줍니다."
    )
    @Parameter(name = "teamId", description = "팀 ID", required = true, example = "1")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = BudgetResponse.class))),
            @ApiResponse(responseCode = "403", description = "해당 팀 소속이 아님"),
            @ApiResponse(responseCode = "404", description = "사용자 또는 예산 정보를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/api/teams/{teamId}/budget")
    public ResponseEntity<BudgetResponse> getBudget(
            @PathVariable("teamId") Long teamId
    ) {
        BudgetResponse response = budgetService.getBudget(teamId);
        return ResponseEntity.ok(response); // 200 OK
    }

    // 예산 수정 (API-027)
    // PATCH /api/teams/{teamId}/budget
    // 예산 관리 화면의 "예산 수정" 모달에서 총 예산을 갱신할 때 사용 (관리자만)
    //
    // 프론트가 (기존 예산 + 입력 금액)을 미리 더한 최종 합계를 totalBudget로 보내므로,
    // 백엔드는 받은 값을 그대로 설정한다 (Service 주석 참고 — 여기서 또 더하면 이중 합산)
    @Operation(
            summary = "예산 수정 (API-027)",
            description = "관리자가 모임의 총 예산을 수정합니다. 프론트가 (기존 예산 + 입력 금액)을 더한 "
                    + "최종 합계를 보내므로 백엔드는 받은 값으로 총 예산을 설정합니다. "
                    + "사용 예산(usedBudget)은 지출 승인/취소로만 바뀌므로 여기서 건드리지 않습니다."
    )
    @Parameter(name = "teamId", description = "팀 ID", required = true, example = "1")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공",
                    content = @Content(schema = @Schema(implementation = BudgetResponse.class))),
            @ApiResponse(responseCode = "400", description = "요청 값 검증 실패 (총 예산 누락 또는 음수)"),
            @ApiResponse(responseCode = "403", description = "관리자가 아니거나 해당 팀 소속이 아님"),
            @ApiResponse(responseCode = "404", description = "사용자 또는 예산 정보를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PatchMapping("/api/teams/{teamId}/budget")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable("teamId") Long teamId,
            @Valid @RequestBody BudgetUpdateRequest request
    ) {
        BudgetResponse response = budgetService.updateBudget(teamId, request);
        return ResponseEntity.ok(response); // 200 OK
    }

    // AI 예산 관리 추천 (API-052, LLM-016)
    // GET /api/teams/{teamId}/budget/ai-insights?period=YYYY-MM
    // 예산 관리 화면 'AI 추천 예산 관리' 3블록. 내부적으로 LLM-016을 호출하고 결과를 캐시해 반환한다.
    // period는 선택 — 미지정 시 당월. verified=false면 프론트가 '확인 필요' 표시 권장.
    @Operation(
            summary = "AI 예산 관리 추천 (API-052)",
            description = "예산 관리 화면의 'AI 추천' 3블록(카테고리 분석·예산 현황 분석·AI 추천)을 조회합니다. "
                    + "내부적으로 LLM-016을 호출하며, 결과는 Redis에 캐시됩니다(기본 6시간). "
                    + "period 미지정 시 당월 기준입니다."
    )
    @Parameter(name = "teamId", description = "팀 ID", required = true, example = "1")
    @Parameter(name = "period", description = "기간(YYYY-MM), 선택. 미지정 시 당월", example = "2026-08")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = BudgetInsightsResponse.class))),
            @ApiResponse(responseCode = "403", description = "해당 팀 소속이 아님"),
            @ApiResponse(responseCode = "404", description = "사용자 또는 팀 정보를 찾을 수 없음"),
            @ApiResponse(responseCode = "502", description = "LLM 서버 호출 실패/타임아웃")
    })
    @GetMapping("/api/teams/{teamId}/budget/ai-insights")
    public ResponseEntity<BudgetInsightsResponse> getAiInsights(
            @PathVariable("teamId") Long teamId,
            @RequestParam(value = "period", required = false) String period
    ) {
        BudgetInsightsResponse response = budgetService.getAiInsights(teamId, period);
        return ResponseEntity.ok(response); // 200 OK
    }
}
