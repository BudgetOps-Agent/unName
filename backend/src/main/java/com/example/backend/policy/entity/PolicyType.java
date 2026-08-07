package com.example.backend.policy.entity;

// 정책 등록 방식
public enum PolicyType {
    TEXT,  // 직접 입력 (텍스트) 또는 AI 초안 (LLM이 생성한 텍스트)
    FILE   // 파일 업로드 (PDF, Word)
}