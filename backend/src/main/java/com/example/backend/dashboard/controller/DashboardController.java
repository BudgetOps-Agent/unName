package com.example.backend.dashboard.controller;

import com.example.backend.dashboard.dto.AiSummaryResponse;
import com.example.backend.dashboard.dto.DashboardResponse;
import com.example.backend.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // 대시보드 조회 API (API-023)
    // 예산 현황 + 멤버 수 + 승인 대기 건수/금액 + 최근 대기 지출 미리보기를 한 번에 조회
    @GetMapping("/api/teams/{teamId}/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            @PathVariable("teamId") Long teamId) {
        DashboardResponse response = dashboardService.getDashboard(teamId);
        return ResponseEntity.ok(response);
    }

    // AI 대시보드 요약 (API-024)
    // 메인 대시보드 "AI 요약" 카드용 — LLM-017을 호출해 이번 달 예산/지출 요약 문구를 받아 내려줌
    // 대시보드 본체(API-023)와 별개 호출이므로, 요약이 실패해도 화면 나머지는 정상
    @GetMapping("/api/teams/{teamId}/dashboard/ai-summary")
    public ResponseEntity<AiSummaryResponse> getAiSummary(
            @PathVariable("teamId") Long teamId) {
        AiSummaryResponse response = dashboardService.getAiSummary(teamId);
        return ResponseEntity.ok(response);
    }
}