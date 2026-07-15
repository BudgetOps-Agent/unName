package com.example.backend.teamMember.service;

import com.example.backend.budget.entity.Budget;
import com.example.backend.budget.repository.BudgetRepository;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
import com.example.backend.team.entity.Team;
import com.example.backend.team.repository.TeamRepository;
import com.example.backend.teamMember.dto.*;
import com.example.backend.teamMember.entity.TeamMember;
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

        if (!inviterMember.getRole().equals("ADMIN")) {
            throw new TeamMemberException(TeamMemberErrorCode.NOT_ADMIN);
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
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, invitee.getId())) {
            throw new TeamMemberException(TeamMemberErrorCode.ALREADY_INVITED);
        }

        // 6. TeamMember 생성 (PENDING 상태로 저장) user는 기본유저
        TeamMember teamMember = TeamMember.builder()
                .team(team)
                .user(invitee)
                .role("MEMBER")
                .status("PENDING")
                .build();

        // 7. DB 저장
        teamMemberRepository.save(teamMember);

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
        if (!teamMember.getStatus().equals("PENDING")) {
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
        if (!teamMember.getStatus().equals("PENDING")) {
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
                .findByUserIdAndStatus(user.getId(), "ACCEPTED");

        // 3. 각 TeamMember마다 Team, Budget, memberCount 조회해서 TeamInfo로 바꿈
        List<MyTeamsResponse.TeamInfo> teams = acceptedMembers.stream()
                .map(teamMember -> {
                    Team team = teamMember.getTeam();

                    // 예산 정보는 team_members.role/status랑 다른 영역이라
                    // TeamMemberErrorCode에는 안 넣고 일단 RuntimeException 그대로 둠 (나중에 필요하면 분리)
                    Budget budget = budgetRepository.findByTeamId(team.getId())
                            .orElseThrow(() -> new RuntimeException("예산 정보를 찾을 수 없습니다."));

                    long memberCount = teamMemberRepository
                            .countByTeamIdAndStatus(team.getId(), "ACCEPTED");

                    return MyTeamsResponse.TeamInfo.of(teamMember, team, budget, memberCount);
                })
                .collect(Collectors.toList());

        // 4. 내 모임중에 PENDING(대기)상태인 초대 목록 가져오기
        List<TeamMember> pendingMembers = teamMemberRepository
                .findByUserIdAndStatus(user.getId(), "PENDING");

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
}