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

    // 모임 멤버 목록 조회 API (API-038)
    // teamId로 그 모임에 속한 멤버들을 role 우선순위 → 가입일 순으로 정렬해서 보여줌 (위에서부터 가입일 가장 빠른순)
    @GetMapping("/api/teams/{teamId}/members") // 다른 메서드들처럼 전체 경로 직접 씀 (클래스 매핑 없어서)
    public ResponseEntity<TeamMemberListResponse> getTeamMembers(
            @PathVariable("teamId") Long teamId) {
        TeamMemberListResponse response = teamMemberService.getTeamMembers(teamId);
        return ResponseEntity.ok(response);
    }

    // 관리자 권한 위임 API (API-039)
    // 현재 관리자가 다른 멤버에게 관리자 권한을 넘김 (기존 관리자는 MEMBER로 강등)
    @PatchMapping("/api/teams/{teamId}/transfer-admin")
    public ResponseEntity<TransferAdminResponse> transferAdmin(
            @PathVariable("teamId") Long teamId,
            @RequestBody @Valid TransferAdminRequest request) {
        TransferAdminResponse response = teamMemberService.transferAdmin(teamId, request);
        return ResponseEntity.ok(response);
    }

    // 멤버 권한 변경 API (API-040)
    // 관리자가 특정 멤버의 role을 변경 (ACCOUNTANT ↔ MEMBER, ADMIN으로는 불가)
    @PatchMapping("/api/members/{memberId}/role")
    public ResponseEntity<ChangeRoleResponse> changeRole(
            @PathVariable("memberId") Long memberId,
            @RequestBody @Valid ChangeRoleRequest request) {
        ChangeRoleResponse response = teamMemberService.changeRole(memberId, request);
        return ResponseEntity.ok(response);
    }

    // 멤버 추방 API (API-041)
    // 관리자가 특정 멤버를 모임에서 강제 탈퇴시킴 (관리자 본인은 추방 불가)
    @DeleteMapping("/api/members/{memberId}")
    public ResponseEntity<RemoveMemberResponse> removeMember(
            @PathVariable("memberId") Long memberId) {
        RemoveMemberResponse response = teamMemberService.removeMember(memberId);
        return ResponseEntity.ok(response);
    }
}