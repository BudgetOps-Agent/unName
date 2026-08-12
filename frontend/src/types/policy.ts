export type PolicyType = 'TEXT' | 'FILE';

export interface PolicyCreateResponse {
    success: boolean;
    policyId: number;
}

export interface PolicyRecommendResponse {
    success: boolean;
    rules: string[];
    recommendedCategories: string[];
    notes: string;
}

// 팀당 1개만 저장됨. 직접 입력과 AI 초안은 저장되면 둘 다 TEXT라 구분되지 않는다
export interface Policy {
    id: number;
    policyType: PolicyType;
    // TEXT면 회칙 본문, FILE이면 null
    content: string | null;
    // FILE이면 원본 파일명, TEXT면 null
    fileName: string | null;
}

export interface PolicyResponse {
    success: boolean;
    // 아직 등록 전이면 404가 아니라 200 + null로 옴
    policy: Policy | null;
}