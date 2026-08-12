package com.example.backend.team.controller;

import com.example.backend.team.dto.CreateTeamRequest;
import com.example.backend.team.dto.CreateTeamResponse;
import com.example.backend.team.dto.UpdateSettingsRequest;
import com.example.backend.team.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "Team", description = "모임(팀) 관련 API")
@RestController // JSON 반환하는 REST API 컨트롤러
@RequestMapping("/api/teams") // 기본 URL 경로
@RequiredArgsConstructor // final 필드 생성자 자동 생성
public class TeamController {

    // Service 주입
    private final TeamService teamService;
    @Operation(
            summary = "모임 생성",
            description = "새로운 모임(팀)을 생성합니다. 이미 존재하는 모임 이름인 경우 409 에러가 발생합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "모임 생성 성공",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = CreateTeamResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "요청 값 검증 실패 (필수 값 누락 등)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "이미 존재하는 모임 이름입니다.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)
            )
    })
    // 모임 생성 API
    // @RequestBody JSON 객체로 변환
    // @Valid 검증 (빈칸인지 등등)
    @PostMapping
    public ResponseEntity<CreateTeamResponse> createTeam(@RequestBody @Valid CreateTeamRequest request) {
        CreateTeamResponse response = teamService.createTeam(request);
        return ResponseEntity.status(201).body(response); // 201 생성 성공
    }

    // 팀 설정 조회 (API-028) — 회칙·정책 관리 화면에서 회비·승인정책 현재값 표시용
    @GetMapping("/{teamId}/settings")
    public ResponseEntity<com.example.backend.team.dto.TeamSettingsResponse> getSettings(
            @PathVariable("teamId") Long teamId
    ) {
        return ResponseEntity.ok(teamService.getSettings(teamId));
    }

    // 팀 설정 수정 (API-029) — 마법사 1단계(회비) · 3단계(승인정책) 공용
    @PatchMapping("/{teamId}/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(
            @PathVariable("teamId") Long teamId,
            @RequestBody UpdateSettingsRequest request) {

        teamService.updateSettings(teamId, request);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}