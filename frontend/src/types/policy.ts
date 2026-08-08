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
