package com.example.backend.policy.dto;

import com.example.backend.policy.entity.Policy;
import com.example.backend.policy.entity.PolicyType;
import lombok.Builder;
import lombok.Getter;

// 팀 회칙 조회 응답 DTO — 회칙·정책 관리 화면에서 현재 등록된 회칙 표시용
// (직접입력·AI초안은 둘 다 policyType=TEXT로 저장되므로 content 하나로 같이 표현됨)
@Getter
@Builder
public class PolicyDetailResponse {

    private boolean success;
    private PolicyInfo policy; // 등록된 회칙이 없으면 null

    @Getter
    @Builder
    public static class PolicyInfo {
        private Long id;
        private String policyType;   // TEXT / FILE
        private String content;      // TEXT일 때만 (직접입력·AI초안 공통), FILE이면 null
        private String fileName;     // FILE일 때만 (업로드 원본 파일명), TEXT면 null
    }

    // Policy 엔티티 → 응답 DTO로 변환 (없으면 policy:null)
    // 다운로드 주소는 안 내려줌 — 프론트가 id로 /api/policies/{id}/download 를 직접 조립하면 됨
    public static PolicyDetailResponse fromEntity(Policy policy) {
        if (policy == null) {
            return PolicyDetailResponse.builder().success(true).policy(null).build();
        }

        boolean isFile = policy.getPolicyType() == PolicyType.FILE;

        PolicyInfo info = PolicyInfo.builder()
                .id(policy.getId())
                .policyType(policy.getPolicyType().name())
                .content(isFile ? null : policy.getContent())
                .fileName(isFile ? policy.getFileName() : null)
                .build();

        return PolicyDetailResponse.builder().success(true).policy(info).build();
    }
}
