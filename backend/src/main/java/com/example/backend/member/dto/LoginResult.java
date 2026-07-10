package com.example.backend.member.dto;

public class LoginResult {
    private final LoginResponse response;
    private final String accessToken;
    private final String refreshToken;

    public LoginResult(LoginResponse response, String accessToken, String refreshToken) {
        this.response = response;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public LoginResponse getResponse () {
        return response;
    }
    public String getAccessToken () {
        return accessToken;
    }
    public String getRefreshToken () {
        return refreshToken;
    }
}
