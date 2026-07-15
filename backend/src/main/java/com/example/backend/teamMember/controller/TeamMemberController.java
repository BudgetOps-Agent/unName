package com.example.backend.teamMember.controller;

import com.example.backend.teamMember.dto.*;
import com.example.backend.teamMember.service.TeamMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // JSON 반환하는 REST API 컨트롤러
// @RequestMapping("/api/teams") 삭제
// accept/reject는 /api/members 경로라서 클래스 공통 경로랑 안 맞음
// 그래서 그냥 PostMapping에다가 각 메서드에 전체 경로를 직접 씀
@RequiredArgsConstructor // final 필드 생성자 자동 생성
public class TeamMemberController {

    // Service 주입
    private final TeamMemberService teamMemberService;

    // 멤버 초대 API
    // @PathVariable = URL 경로에서 teamId 꺼내기
    // @RequestBody = JSON 요청 데이터를 객체로 변환
    // @Valid → 검증 (이메일 형식 등)
    @PostMapping("/api/teams/{teamId}/invite") // 경로 앞에 /api/teams 직접 붙임 (클래스 매핑 없어졌으니까)
    public ResponseEntity<InviteMemberResponse> inviteMember(
            @PathVariable("teamId") Long teamId, // Spring Boot 4.x 버전에서는 파라미터 이름을 자동으로 못 읽어서 명시적으로 써줘야함
            @RequestBody @Valid InviteMemberRequest request) {
        InviteMemberResponse response = teamMemberService.inviteMember(teamId, request);
        return ResponseEntity.ok(response);
    }

    // 초대 수락 API
    // memberId = team_members 테이블의 PK (어떤 초대인지 특정하기 위해 teamId 대신 사용)
    @PostMapping("/api/members/{memberId}/accept")
    public ResponseEntity<AcceptInviteResponse> acceptInvite(
            @PathVariable("memberId") Long memberId) {
        AcceptInviteResponse response = teamMemberService.acceptInvite(memberId);
        return ResponseEntity.ok(response);
    }

    // 초대 거절 API
    @PostMapping("/api/members/{memberId}/reject")
    public ResponseEntity<RejectInviteResponse> rejectInvite(
            @PathVariable("memberId") Long memberId) {
        RejectInviteResponse response = teamMemberService.rejectInvite(memberId);
        return ResponseEntity.ok(response);
    }

    // 내 모임 목록 조회 API (API-009)
    @GetMapping("/api/teams/my")
    public ResponseEntity<MyTeamsResponse> getMyTeams() {
        MyTeamsResponse response = teamMemberService.getMyTeams();
        return ResponseEntity.ok(response);
    }
}