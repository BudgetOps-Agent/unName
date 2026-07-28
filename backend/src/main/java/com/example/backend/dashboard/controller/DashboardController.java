package com.example.backend.dashboard.controller;

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
}