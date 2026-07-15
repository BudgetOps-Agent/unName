package com.example.backend.expense.controller;

import com.example.backend.expense.dto.ExpenseListResponse;
import com.example.backend.expense.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}