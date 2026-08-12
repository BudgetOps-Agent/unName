package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

/**
 * LLM-007 판례 저장 요청의 claim 객체 (PrecedentRequest.claim)
 * LLM 쪽 ExpenseClaim 스키마: title/date는 필수, category/description은 선택(빈 문자열 기본값)
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExpenseClaim {

    @JsonProperty("title")
    private String title;

    @JsonProperty("amount")
    private Long amount;

    @JsonProperty("category")
    private String category;

    // "YYYY-MM-DD" 형식 문자열
    @JsonProperty("date")
    private String date;

    @JsonProperty("description")
    private String description;
}
