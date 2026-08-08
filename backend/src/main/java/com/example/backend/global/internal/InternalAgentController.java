package com.example.backend.global.internal;

import com.example.backend.global.internal.dto.InternalBudgetResponse;
import com.example.backend.global.internal.dto.InternalExpenseResponse;
import com.example.backend.global.internal.dto.InternalTeamProfileResponse;
import com.example.backend.global.internal.dto.InternalTeamSettingsResponse;
import com.example.backend.global.internal.dto.PolicyDocumentResult;
import com.example.backend.global.llm.AgentTokenValidator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * LLM(Agent) 내부 조회 API (BE-001~).
 *
 * LLM이 지출 심사 시 pull 모델로 지출/설정/예산/프로필을 되물어 가져가는 엔드포인트.
 * 로그인(JWT) 없이 열려 있고(SecurityConfig permitAll), 대신 Agent 서비스 토큰(Bearer)을
 * AgentTokenValidator로 직접 검증한다.
 */
@Tag(name = "InternalAgent", description = "LLM 내부 조회 API (BE-001~) — Agent 토큰 인증")
@RestController
@RequiredArgsConstructor
public class InternalAgentController {

    private final InternalAgentService internalAgentService;
    private final AgentTokenValidator agentTokenValidator;

    // BE-001 지출 상세 조회
    @Operation(summary = "지출 상세 조회 (BE-001)", description = "LLM이 심사할 지출의 원본 정보를 조회합니다.")
    @GetMapping("/internal/agent/organizations/{orgId}/expenses/{expenseId}")
    public InternalExpenseResponse getExpenseDetail(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable("orgId") Long orgId,
            @PathVariable("expenseId") Long expenseId
    ) {
        agentTokenValidator.verify(authorization);
        return internalAgentService.getExpenseDetail(orgId, expenseId);
    }

    // BE-002 팀 설정 조회
    @Operation(summary = "팀 설정 조회 (BE-002)", description = "자동승인 사용 여부·한도를 조회합니다.")
    @GetMapping("/internal/agent/organizations/{orgId}/team-settings")
    public InternalTeamSettingsResponse getTeamSettings(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable("orgId") Long orgId
    ) {
        agentTokenValidator.verify(authorization);
        return internalAgentService.getTeamSettings(orgId);
    }

    // BE-003 예산 현황 조회
    @Operation(summary = "예산 현황 조회 (BE-003)", description = "총 예산과 사용 예산을 조회합니다. 잔액은 LLM이 total_budget - spent로 계산합니다.")
    @GetMapping("/internal/agent/teams/{teamId}/budget")
    public InternalBudgetResponse getBudget(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable("teamId") Long teamId
    ) {
        agentTokenValidator.verify(authorization);
        return internalAgentService.getBudget(teamId);
    }

    // BE-006 팀 프로필 조회
    @Operation(summary = "팀 프로필 조회 (BE-006)", description = "모임 유형(team_type)을 조회합니다.")
    @GetMapping("/internal/agent/teams/{teamId}/profile")
    public InternalTeamProfileResponse getTeamProfile(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable("teamId") Long teamId
    ) {
        agentTokenValidator.verify(authorization);
        return internalAgentService.getTeamProfile(teamId);
    }

    // BE-005 회칙 원본 조회
    // TEXT면 application/json + {"text":"..."} / FILE이면 원본 바이트 + Content-Disposition filename
    // LLM은 Content-Type에 json이 있으면 텍스트, 없으면 파일로 판별함 → 파일을 JSON으로 감싸면 안 됨
    // doc_type/version 쿼리는 받되 우리는 팀당 1개(버전 미사용)라 무시함
    @Operation(summary = "회칙 원본 조회 (BE-005)",
            description = "회칙 원문을 조회합니다. TEXT는 application/json {text}, FILE은 원본 파일(pdf/docx)로 내려갑니다.")
    @GetMapping("/internal/agent/teams/{teamId}/policy-document")
    public ResponseEntity<?> getPolicyDocument(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable("teamId") Long teamId,
            @RequestParam(value = "doc_type", required = false) String docType,
            @RequestParam(value = "version", required = false) Integer version
    ) {
        agentTokenValidator.verify(authorization);

        PolicyDocumentResult doc = internalAgentService.getPolicyDocument(teamId);

        // TEXT: JSON으로 (Content-Type에 json 포함 → LLM이 텍스트로 읽음)
        if (doc.isText()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("text", doc.getContent() == null ? "" : doc.getContent()));
        }

        // FILE: 원본 MIME + 파일 바이트 + 파일명 (json 아님 → LLM이 파일로 읽음)
        MediaType mediaType = (doc.getMimeType() != null && !doc.getMimeType().isBlank())
                ? MediaType.parseMediaType(doc.getMimeType())
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(doc.getResource());
    }
}
