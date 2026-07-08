package com.example.backend.member.dto;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FindIdResponse {

    private boolean success;
    private String email;


}
