package com.example.backend.team.controller;

import com.example.backend.team.dto.CreateTeamRequest;
import com.example.backend.team.dto.CreateTeamResponse;
import com.example.backend.team.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // JSON 반환하는 REST API 컨트롤러
@RequestMapping("/api/teams") // 기본 URL 경로
@RequiredArgsConstructor // final 필드 생성자 자동 생성
public class TeamController {

    // Service 주입
    private final TeamService teamService;

    // 모임 생성 API
    // @RequestBody JSON 객체로 변환
    // @Valid 검증 (빈칸인지 등등)
    @PostMapping
    public ResponseEntity<CreateTeamResponse> createTeam(@RequestBody @Valid CreateTeamRequest request) {
        CreateTeamResponse response = teamService.createTeam(request);
        return ResponseEntity.status(201).body(response); // 201 생성 성공
    }
}