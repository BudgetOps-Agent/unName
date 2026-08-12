package com.example.backend.expense.entity;

public enum ExpenseCategory {
    // AI 심사가 콜백(CB-001)의 suggestedCategory로 채우는 값 — LLM 카테고리 9종과 문자열이 정확히 일치해야 함
    // (언더바 표기 확정, 2026-08-05). 한 글자라도 다르면 콜백 저장이 실패함
    // 8/6 변경: '디자인'·'행사' 삭제, '교통·장소_대관·비품·행사_활동' 추가 → 유지 5종 + 신규 4종 = 9종
    회의, IT_인프라, 교육, 식비, 교통, 장소_대관, 비품, 행사_활동, 기타
}