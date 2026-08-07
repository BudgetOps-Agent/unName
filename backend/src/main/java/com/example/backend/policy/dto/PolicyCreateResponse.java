package com.example.backend.policy.dto;

import lombok.Builder;
import lombok.Getter;

// 회칙 등록(API-031) 응답용 DTO
// 명세 응답: { "success": true, "policyId": 1 }
@Getter
@Builder // 늘 쓰던 @Getter + @Builder 스타일
public class PolicyCreateResponse {

    private boolean success;  // 성공 여부 (항상 true로 내려줌)
    private Long policyId;    // 저장된 회칙의 id
}
