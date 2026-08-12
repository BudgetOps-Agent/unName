package com.example.backend.teamMember.controller;

import com.example.backend.teamMember.dto.*;
import com.example.backend.teamMember.service.TeamMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "TeamMember", description = "모임 멤버(초대/권한/탈퇴) 관련 API")
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
    @Operation(
            summary = "멤버 초대",
            description = "모임 관리자가 특정 유저를 모임에 초대합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "초대 성공",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "모임 멤버가 아니거나(NOT_TEAM_MEMBER), 관리자가 아님(NOT_ADMIN_FOR_INVITE)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "모임을 찾을 수 없음(TEAM_NOT_FOUND)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "409", description = "이미 초대됐거나 이미 멤버인 유저(ALREADY_INVITED)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @PostMapping("/api/teams/{teamId}/invite") // 경로 앞에 /api/teams 직접 붙임 (클래스 매핑 없어졌으니까)
    public ResponseEntity<InviteMemberResponse> inviteMember(
            @PathVariable("teamId") Long teamId, // Spring Boot 4.x 버전에서는 파라미터 이름을 자동으로 못 읽어서 명시적으로 써줘야함
            @RequestBody @Valid InviteMemberRequest request) {
        InviteMemberResponse response = teamMemberService.inviteMember(teamId, request);
        return ResponseEntity.ok(response);
    }

    // 초대 수락 API
    // memberId = team_members 테이블의 PK (어떤 초대인지 특정하기 위해 teamId 대신 사용)
    @Operation(
            summary = "초대 수락",
            description = "본인에게 온 모임 초대를 수락합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수락 성공",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "본인의 초대가 아님(NOT_YOUR_INVITATION)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "초대 정보를 찾을 수 없음(INVITATION_NOT_FOUND)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "409", description = "이미 처리된 초대(ALREADY_PROCESSED)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @PostMapping("/api/members/{memberId}/accept")
    public ResponseEntity<AcceptInviteResponse> acceptInvite(
            @PathVariable("memberId") Long memberId) {
        AcceptInviteResponse response = teamMemberService.acceptInvite(memberId);
        return ResponseEntity.ok(response);
    }

    // 초대 거절 API
    @Operation(
            summary = "초대 거절",
            description = "본인에게 온 모임 초대를 거절합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "거절 성공",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "본인의 초대가 아님(NOT_YOUR_INVITATION)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "초대 정보를 찾을 수 없음(INVITATION_NOT_FOUND)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "409", description = "이미 처리된 초대(ALREADY_PROCESSED)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @PostMapping("/api/members/{memberId}/reject")
    public ResponseEntity<RejectInviteResponse> rejectInvite(
            @PathVariable("memberId") Long memberId) {
        RejectInviteResponse response = teamMemberService.rejectInvite(memberId);
        return ResponseEntity.ok(response);
    }

    // 내 모임 목록 조회 API (API-009)
    @Operation(
            summary = "내 모임 목록 조회",
            description = "로그인한 유저가 속한 모든 모임 목록을 조회합니다. (API-009)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/api/teams/my")
    public ResponseEntity<MyTeamsResponse> getMyTeams() {
        MyTeamsResponse response = teamMemberService.getMyTeams();
        return ResponseEntity.ok(response);
    }

    // 모임 멤버 목록 조회 API (API-038)
    // teamId로 그 모임에 속한 멤버들을 role 우선순위 → 가입일 순으로 정렬해서 보여줌 (위에서부터 가입일 가장 빠른순)
    @Operation(
            summary = "모임 멤버 목록 조회",
            description = "모임에 속한 멤버들을 role 우선순위 → 가입일 순으로 정렬해서 조회합니다. (API-038)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "모임 멤버가 아님(NOT_TEAM_MEMBER)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "모임을 찾을 수 없음(TEAM_NOT_FOUND)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/api/teams/{teamId}/members") // 다른 메서드들처럼 전체 경로 직접 씀 (클래스 매핑 없어서)
    public ResponseEntity<TeamMemberListResponse> getTeamMembers(
            @PathVariable("teamId") Long teamId) {
        TeamMemberListResponse response = teamMemberService.getTeamMembers(teamId);
        return ResponseEntity.ok(response);
    }

    // 관리자 권한 위임 API (API-039)
    // 현재 관리자가 다른 멤버에게 관리자 권한을 넘김 (기존 관리자는 MEMBER로 강등)
    @Operation(
            summary = "관리자 권한 위임",
            description = "현재 관리자가 다른 멤버에게 관리자 권한을 위임합니다. 기존 관리자는 MEMBER로 강등됩니다. (API-039)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "위임 성공",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "400", description = "자기 자신에게 위임 시도(CANNOT_TRANSFER_TO_SELF)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "관리자가 아님(NOT_ADMIN_FOR_TRANSFER)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "대상 멤버 또는 모임을 찾을 수 없음(MEMBER_NOT_FOUND / TEAM_NOT_FOUND)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @PatchMapping("/api/teams/{teamId}/transfer-admin")
    public ResponseEntity<TransferAdminResponse> transferAdmin(
            @PathVariable("teamId") Long teamId,
            @RequestBody @Valid TransferAdminRequest request) {
        TransferAdminResponse response = teamMemberService.transferAdmin(teamId, request);
        return ResponseEntity.ok(response);
    }

    // 멤버 권한 변경 API (API-040)
    // 관리자가 특정 멤버의 role을 변경 (ACCOUNTANT ↔ MEMBER, ADMIN으로는 불가)
    @Operation(
            summary = "멤버 권한 변경",
            description = "관리자가 특정 멤버의 role을 변경합니다. (ACCOUNTANT ↔ MEMBER, ADMIN으로는 변경 불가) (API-040)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 성공",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "400", description = "ADMIN으로 변경 시도(CANNOT_CHANGE_TO_ADMIN) 또는 관리자 권한 변경 시도(CANNOT_CHANGE_ADMIN)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "관리자가 아님(NOT_ADMIN_FOR_CHANGE_ROLE)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "대상 멤버를 찾을 수 없음(MEMBER_NOT_FOUND)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @PatchMapping("/api/members/{memberId}/role")
    public ResponseEntity<ChangeRoleResponse> changeRole(
            @PathVariable("memberId") Long memberId,
            @RequestBody @Valid ChangeRoleRequest request) {
        ChangeRoleResponse response = teamMemberService.changeRole(memberId, request);
        return ResponseEntity.ok(response);
    }

    // 멤버 추방 API (API-041)
    // 관리자가 특정 멤버를 모임에서 강제 탈퇴시킴 (관리자 본인은 추방 불가)
    @Operation(
            summary = "멤버 추방",
            description = "관리자가 특정 멤버를 모임에서 강제 탈퇴시킵니다. 관리자 본인은 추방할 수 없습니다. (API-041)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "추방 성공",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "400", description = "관리자를 추방 시도(CANNOT_REMOVE_ADMIN)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "관리자가 아님(NOT_ADMIN_FOR_REMOVE)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "대상 멤버를 찾을 수 없음(MEMBER_NOT_FOUND)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @DeleteMapping("/api/members/{memberId}")
    public ResponseEntity<RemoveMemberResponse> removeMember(
            @PathVariable("memberId") Long memberId) {
        RemoveMemberResponse response = teamMemberService.removeMember(memberId);
        return ResponseEntity.ok(response);
    }

    // 모임 탈퇴 (API-043)
    @Operation(
            summary = "모임 탈퇴 (API-043)",
            description = "본인이 모임에서 자진 탈퇴합니다. 관리자는 먼저 권한 위임(API-039)으로 "
                    + "다른 멤버에게 넘긴 뒤에만 탈퇴할 수 있습니다(관리자 없는 모임 방지)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "탈퇴 성공",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "400", description = "관리자가 탈퇴 시도(CANNOT_LEAVE_AS_ADMIN)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "해당 팀 소속이 아님(NOT_TEAM_MEMBER)",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @DeleteMapping("/api/teams/{teamId}/leave")
    public ResponseEntity<LeaveTeamResponse> leaveTeam(
            @PathVariable("teamId") Long teamId) {
        LeaveTeamResponse response = teamMemberService.leaveTeam(teamId);
        return ResponseEntity.ok(response);
    }
}