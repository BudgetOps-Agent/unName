package com.example.backend.teamMember.service;

import com.example.backend.budget.entity.Budget;
import com.example.backend.budget.exception.BudgetErrorCode;
import com.example.backend.budget.exception.BudgetException;
import com.example.backend.budget.repository.BudgetRepository;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
import com.example.backend.team.entity.Team;
import com.example.backend.team.repository.TeamRepository;
import com.example.backend.teamMember.dto.*;
import com.example.backend.teamMember.entity.TeamMember;
import com.example.backend.teamMember.entity.TeamRole;
import com.example.backend.teamMember.entity.TeamStatus;
import com.example.backend.teamMember.exception.TeamMemberErrorCode;
import com.example.backend.teamMember.exception.TeamMemberException;
import com.example.backend.teamMember.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final BudgetRepository budgetRepository;

    @Transactional
    public InviteMemberResponse inviteMember(Long teamId, InviteMemberRequest request) {

        // 1. JWT 토큰에서 현재 로그인한 사람 이메일 꺼내기
        // api 요청 보낸 사람 jwt 토큰에서 사용자 조회 하고 토큰안에 이메일로 그걸 꺼내온다
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 현재 로그인한 사람 조회 + ADMIN인지 확인
        User inviter = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 이 모임의 ADMIN인지 확인
        // (RuntimeException → TeamMemberException으로 교체: 상태코드를 403으로 정확히 지정하기 위함)
        TeamMember inviterMember = teamMemberRepository.findByTeamIdAndUserId(teamId, inviter.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        // role이 이제 문자열이 아니라 TeamRole이라는 정해진 값(Enum)이라서
        // 문자열 비교(equals) 대신 그냥 같은지 다른지(!=)로 비교하기 위해서 썼다
        if (inviterMember.getRole() != TeamRole.ADMIN) {
            throw new TeamMemberException(TeamMemberErrorCode.NOT_ADMIN_FOR_INVITE);
        }

        // 3. 모임 조회
        // (정상 흐름에서는 항상 존재하지만, 삭제된 모임이거나 잘못된 teamId로
        //  직접 요청이 들어올 수도 있으니 방어 코드로 확인 → 404로 응답)
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        // 4. 초대할 유저 이메일로 조회
        User invitee = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 5. 이미 초대됐거나 이미 멤버인지 확인 (중복 초대 방지) → 409로 응답
        teamMemberRepository.findByTeamIdAndUserId(teamId, invitee.getId())
                .ifPresentOrElse(
                        existingMember -> {
                            if(existingMember.getStatus() != TeamStatus.REJECTED) {
                                throw new TeamMemberException(TeamMemberErrorCode.ALREADY_INVITED);
                            }
                            existingMember.reinvite();
                            teamMemberRepository.save(existingMember);
                        },
                        () -> {
                            // 6. TeamMember 생성 (PENDING 상태로 저장) user는 기본유저
                            TeamMember teamMember = TeamMember.builder()
                                    .team(team)
                                    .user(invitee)
                                    .role(TeamRole.MEMBER)
                                    .status(TeamStatus.PENDING)
                                    .build();
                            // 7. DB 저장
                            teamMemberRepository.save(teamMember);
                        }
                );

        // 8. 응답 반환 (성공 여부와 성공 메세지 담아서 반환)
        return InviteMemberResponse.builder()
                .success(true)
                .message("초대가 완료되었습니다.")
                .build();
    }

    // 초대 수락 메서ㅡㄷ
    @Transactional
    public AcceptInviteResponse acceptInvite(Long memberId) {

        // 1. JWT 토큰에서 현재 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 로그인한 사람 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. memberId로 TeamMember 조회 → 없으면 404
        TeamMember teamMember = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.INVITATION_NOT_FOUND));

        // 4. 본인 초대인지 확인
        // (화면상 내 초대만 목록에 뜨긴 하지만, API는 URL로 직접 호출될 수도 있으니
        //  서버에서도 한 번 더 검증해야 함 - 남의 초대를 함부로 수락 못 하게 막는 보안 장치, 403으로 응답)
        if (!teamMember.getUser().getId().equals(user.getId())) {
            throw new TeamMemberException(TeamMemberErrorCode.NOT_YOUR_INVITATION);
        }

        // 5. PENDING 상태인지 확인 → 이미 처리됐으면 409
        if (!teamMember.getStatus().equals(TeamStatus.PENDING)) {
            throw new TeamMemberException(TeamMemberErrorCode.ALREADY_PROCESSED);
        }

        // 6. 수락 처리 (status → ACCEPTED, joinedAt 기록)
        teamMember.accept();
        teamMemberRepository.save(teamMember);

        // 7. 응답 반환
        return AcceptInviteResponse.builder()
                .success(true)
                .message("초대를 수락했습니다.")
                .build();
    }

    // 초대 거절 메서드
    @Transactional
    public RejectInviteResponse rejectInvite(Long memberId) {

        // 1. JWT 토큰에서 현재 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 로그인한 사람 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. memberId로 TeamMember 조회 → 없으면 404
        TeamMember teamMember = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.INVITATION_NOT_FOUND));

        // 4. 본인 초대인지 확인 (남의 초대를 함부로 거절 못 하게 막는 보안 장치, 403으로 응답)
        if (!teamMember.getUser().getId().equals(user.getId())) {
            throw new TeamMemberException(TeamMemberErrorCode.NOT_YOUR_INVITATION);
        }

        // 5. PENDING 상태인지 확인 → 이미 처리됐으면 409
        if (!teamMember.getStatus().equals(TeamStatus.PENDING)) {
            throw new TeamMemberException(TeamMemberErrorCode.ALREADY_PROCESSED);
        }

        // 6. 거절 처리
        teamMember.reject();
        teamMemberRepository.save(teamMember);

        // 7. 응답 반환
        return RejectInviteResponse.builder()
                .success(true)
                .message("초대를 거절했습니다.")
                .build();
    }


    // 내 모임 목록 + 받은 초대 목록 조회 (API-009)
    @Transactional(readOnly = true)
    public MyTeamsResponse getMyTeams() {

        // 1. 로그인한 사람 확인 토큰에서 정보 가져오기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 2. 내 모임중에 ACCEPTED(수락)상태인 모임 목록 (team_members) 가져오기
        List<TeamMember> acceptedMembers = teamMemberRepository
                .findByUserIdAndStatusOrderByJoinedAtDesc(user.getId(), TeamStatus.ACCEPTED);

        // 3. 각 TeamMember마다 Team, Budget, memberCount 조회해서 TeamInfo로 바꿈
        List<MyTeamsResponse.TeamInfo> teams = acceptedMembers.stream()
                .map(teamMember -> {
                    Team team = teamMember.getTeam();

                    // 예산 정보는 team_members.role/status랑 다른 영역이라
                    // TeamMemberErrorCode에는 안 넣고 일단 RuntimeException 그대로 둠 (나중에 필요하면 분리)
                    Budget budget = budgetRepository.findByTeamId(team.getId())
                            .orElseThrow(() -> new BudgetException(BudgetErrorCode.BUDGET_NOT_FOUND));

                    long memberCount = teamMemberRepository
                            .countByTeamIdAndStatus(team.getId(), TeamStatus.ACCEPTED);

                    return MyTeamsResponse.TeamInfo.of(teamMember, team, budget, memberCount);
                })
                .collect(Collectors.toList());

        // 4. 내 모임중에 PENDING(대기)상태인 초대 목록 가져오기
        List<TeamMember> pendingMembers = teamMemberRepository
                .findByUserIdAndStatusOrderByJoinedAtDesc(user.getId(), TeamStatus.PENDING);

        List<MyTeamsResponse.PendingInfo> pending = pendingMembers.stream()
                .map(MyTeamsResponse.PendingInfo::of)
                .collect(Collectors.toList());

        // 5. 응답 반환하기
        return MyTeamsResponse.builder()
                .success(true)
                .teams(teams)
                .pending(pending)
                .build();
    }

    // 모임 멤버 목록 조회 (API-038)
    @Transactional(readOnly = true)
    public TeamMemberListResponse getTeamMembers(Long teamId) {

        // 1. 토큰에서 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 이메일로 요청자 조회
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 요청자가 이 모임 소속인지 확인 (남의 모임 멤버 목록 못 보게 막음)
        teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        // 4. 정렬된 멤버 목록 조회 (role 우선순위 → 가입일 순, Repository 쿼리에서 이미 정렬됨)
        List<TeamMember> members = teamMemberRepository.findMembersByTeamId(teamId);

        // 5. TeamMember → MemberInfo(DTO)로 변환
        List<TeamMemberListResponse.MemberInfo> memberInfos = members.stream()
                .map(tm -> TeamMemberListResponse.MemberInfo.builder()
                        .id(tm.getId())              // team_members PK (권한변경/강퇴 시 씀)
                        .name(tm.getUser().getName())
                        .email(tm.getUser().getEmail())
                        .role(tm.getRole().name())   // TeamRole Enum → String 변환
                        .build())
                .collect(Collectors.toList());

        // 6. 응답 반환
        return TeamMemberListResponse.builder()
                .success(true)
                .members(memberInfos)
                .build();
    }

    // 관리자 권한 위임 (API-039)
    @Transactional
    public TransferAdminResponse transferAdmin(Long teamId, TransferAdminRequest request) {

        // 1. 토큰에서 로그인한 사람(현재 관리자) 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 이메일로 요청자 조회
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 요청자가 이 팀의 ADMIN인지 확인 (소속 아니면 404, ADMIN 아니면 403)
        TeamMember currentAdmin = teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        if (currentAdmin.getRole() != TeamRole.ADMIN) {
            throw new TeamMemberException(TeamMemberErrorCode.NOT_ADMIN_FOR_TRANSFER);
        }

        // 4. 새 관리자로 만들 멤버 조회 → 없으면 404
        TeamMember newAdmin = teamMemberRepository.findById(request.getNewMemberId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.MEMBER_NOT_FOUND));

        // 5. 그 멤버가 진짜 이 팀 소속인지 확인 (다른 팀 멤버 id로 장난치는 것 방지)
        if (!newAdmin.getTeam().getId().equals(teamId)) {
            throw new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER);
        }

        // 6. 자기 자신한테 위임하는 경우 방지 (선택적 검증)
        if (newAdmin.getId().equals(currentAdmin.getId())) {
            throw new TeamMemberException(TeamMemberErrorCode.CANNOT_TRANSFER_TO_SELF);
        }

        // 7. 권한 교체 (기존 관리자 → MEMBER, 새 멤버 → ADMIN)
        currentAdmin.changeRole(TeamRole.MEMBER);
        newAdmin.changeRole(TeamRole.ADMIN);

        // 8. 응답 반환
        return TransferAdminResponse.builder()
                .success(true)
                .message("관리자 권한을 위임했습니다.")
                .build();
    }

    // 멤버 권한 변경 (API-040)
    @Transactional
    public ChangeRoleResponse changeRole(Long memberId, ChangeRoleRequest request) {

        // 1. 토큰에서 로그인한 사람(요청자) 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 변경 대상 멤버 조회 → 없으면 404
        TeamMember target = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.MEMBER_NOT_FOUND));

        // 4. 요청자가 이 팀(대상 멤버가 속한 팀)의 ADMIN인지 확인
        Long teamId = target.getTeam().getId();
        TeamMember requesterMember = teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        if (requesterMember.getRole() != TeamRole.ADMIN) {
            throw new TeamMemberException(TeamMemberErrorCode.NOT_ADMIN_FOR_CHANGE_ROLE);
        }

        // 5. ADMIN으로는 변경 못 함 (그건 권한위임 API-039에서만)
        if (request.getRole() == TeamRole.ADMIN) {
            throw new TeamMemberException(TeamMemberErrorCode.CANNOT_CHANGE_TO_ADMIN);
        }

        // 6. 대상이 ADMIN이면 변경 불가 (관리자 자신의 권한은 여기서 못 바꿈)
        if (target.getRole() == TeamRole.ADMIN) {
            throw new TeamMemberException(TeamMemberErrorCode.CANNOT_CHANGE_ADMIN);
        }

        // 7. ACCOUNTANT로 바꾸는 거면, 같은 팀의 기존 총무부터 MEMBER로 내림 — 총무는 팀당 1명 유일해야 함.
        //    같은 트랜잭션 안에서 처리해야 중간에 실패해도 총무가 0명/2명이 되는 상태로 안 남음
        //    (권한위임 API-039의 currentAdmin→MEMBER, newAdmin→ADMIN 패턴과 동일)
        if (request.getRole() == TeamRole.ACCOUNTANT) {
            List<TeamMember> currentAccountants = teamMemberRepository
                    .findByTeamIdAndStatusAndRoleIn(teamId, TeamStatus.ACCEPTED, List.of(TeamRole.ACCOUNTANT));
            for (TeamMember accountant : currentAccountants) {
                if (!accountant.getId().equals(target.getId())) {
                    accountant.changeRole(TeamRole.MEMBER);
                }
            }
        }

        // 8. 역할 변경 (changeRole은 권한위임 때 만든 메서드 재사용)
        target.changeRole(request.getRole());

        // 9. 응답 반환
        return ChangeRoleResponse.builder()
                .success(true)
                .member(ChangeRoleResponse.MemberInfo.builder()
                        .id(target.getId())
                        .name(target.getUser().getName())
                        .role(target.getRole().name())
                        .build())
                .build();
    }

    // 모임 탈퇴 (API-043)
    // 본인이 자진 탈퇴. 관리자는 먼저 권한위임(API-039)으로 넘긴 뒤에만 탈퇴 가능
    // (추방 041의 "관리자는 못 건드림"과 동일한 이유 — 관리자 없는 모임 방지)
    @Transactional
    public LeaveTeamResponse leaveTeam(Long teamId) {

        // 1. 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회 (없으면 404)
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 요청자가 이 팀 소속인지 확인 (아니면 403)
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        // 4. 관리자는 탈퇴 불가 (관리자 없는 모임 방지)
        if (member.getRole() == TeamRole.ADMIN) {
            throw new TeamMemberException(TeamMemberErrorCode.CANNOT_LEAVE_AS_ADMIN);
        }

        // 5. 탈퇴 처리 (team_members에서 완전 삭제 — 지출 등 다른 기록은 user_id로 남아있어 안 지워짐)
        teamMemberRepository.delete(member);

        // 6. 응답 반환
        return LeaveTeamResponse.builder()
                .success(true)
                .message("모임에서 탈퇴했습니다.")
                .build();
    }

    // 멤버 추방 (API-041)
    @Transactional
    public RemoveMemberResponse removeMember(Long memberId) {

        // 1. 토큰에서 로그인한 사람(요청자) 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 추방 대상 멤버 조회 → 없으면 404
        TeamMember target = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.MEMBER_NOT_FOUND));

        // 4. 요청자가 이 팀(대상이 속한 팀)의 ADMIN인지 확인
        Long teamId = target.getTeam().getId();
        TeamMember requesterMember = teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        if (requesterMember.getRole() != TeamRole.ADMIN) {
            throw new TeamMemberException(TeamMemberErrorCode.NOT_ADMIN_FOR_REMOVE);
        }

        // 5. 관리자(ADMIN)는 추방 못 함 (자기 자신 포함, 관리자 없는 모임 방지)
        if (target.getRole() == TeamRole.ADMIN) {
            throw new TeamMemberException(TeamMemberErrorCode.CANNOT_REMOVE_ADMIN);
        }

        // 6. 멤버 삭제 (team_members에서 해당 레코드 완전 삭제 = hard delete)
        teamMemberRepository.delete(target);

        // 7. 응답 반환
        return RemoveMemberResponse.builder()
                .success(true)
                .message("멤버를 추방했습니다.")
                .build();
    }
}