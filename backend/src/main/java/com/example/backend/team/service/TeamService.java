package com.example.backend.team.service;

import com.example.backend.budget.entity.Budget;
import com.example.backend.budget.repository.BudgetRepository;
import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.repository.ExpenseRepository;
import com.example.backend.expense.repository.ExpensesReviewRepository;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
import com.example.backend.notification.repository.NotificationRepository;
import com.example.backend.policy.repository.PolicyRepository;
import com.example.backend.team.dto.CreateTeamRequest;
import com.example.backend.team.dto.CreateTeamResponse;
import com.example.backend.team.dto.DeleteTeamResponse;
import com.example.backend.team.dto.TeamSettingsResponse;
import com.example.backend.team.dto.UpdateSettingsRequest;
import com.example.backend.team.entity.Team;
import com.example.backend.team.entity.TeamSettings;
import com.example.backend.team.exception.TeamErrorCode;
import com.example.backend.team.exception.TeamException;
import com.example.backend.team.repository.TeamRepository;
import com.example.backend.team.repository.TeamSettingsRepository;
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

@Service // 비즈니스 로직 담당한다고 알려주는것이고 spring이 Bean 자동 등록해줌
@RequiredArgsConstructor // final 필드 생성자 자동 생성
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final BudgetRepository budgetRepository;
    private final TeamSettingsRepository teamSettingsRepository;

    // 모임 삭제용 — 지출·회칙 연쇄 삭제에 필요
    private final ExpenseRepository expenseRepository;
    private final ExpensesReviewRepository expensesReviewRepository;
    private final NotificationRepository notificationRepository;
    private final PolicyRepository policyRepository;

    @Transactional
    public CreateTeamResponse createTeam(CreateTeamRequest request) {

        // JWT 토큰에서 이메일 꺼내기 (현재 로그인한 사람 확인하기 위해서)
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 이메일로 유저 조회
        // 토큰 안에는 이메일이랑 role(역할)만 저장 되어있는데
        // 모임 만들때 admin 필드에다가 넣어야 하는건 user 객체가 필요해서
        // 토큰에서 꺼낸 이메일로 user객체를 조회하는것
        // 그 user를 admin으로 만드는것
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 모임 이름 중복 확인 (이미 존재하는 모임 이름이 있을 수 있기 때문에 teams DB에 접근해서 중복 확인)
        if (teamRepository.existsByName(request.getName())) {
            throw new TeamException(TeamErrorCode.DUPLICATE_TEAM_NAME);
        }

        // Team 엔티티 생성 (아직 모임 최대 인원 안정해져서 기본 값으로 20명으로 최대인원 되어있어서 자동으로 됨)
        Team team = Team.builder()
                .name(request.getName())
                .teamType(request.getTeamType())
                .description(request.getDescription())
                .admin(admin)
                .build();

        // DB 저장
        teamRepository.save(team);

        // 모임장을 team_members에 ADMIN, ACCEPTED로 자동 추가
        // 방 만들면 바로 ADMIN 권한 부여 그리고 바로 상태는 수락된 상태로
        TeamMember adminMember = TeamMember.builder()
                .team(team)
                .user(admin)
                .role(TeamRole.ADMIN)
                .status(TeamStatus.ACCEPTED)
                .build();
        // accept() 호출해서 joinedAt(가입 시간)도 같이 채워줌
        // (@Builder 생성자는 joinedAt을 안 채우기 때문에, 이거 안 하면 모임장만 joined_at이 NULL로 남음)
        adminMember.accept();
        teamMemberRepository.save(adminMember);

        // budgets row 생성
        Budget budget = Budget.builder()
                .team(team)
                .totalBudget(request.getTotalBudget())
                .usedBudget(0L)
                .build();
        budgetRepository.save(budget);

        // team_settings row 생성 (기본값)
        // membershipFee=0, autoApprove=false, autoApproveLimit=null 은 엔티티 빌더에서 처리
        TeamSettings settings = TeamSettings.builder()
                .team(team)
                .build();
        teamSettingsRepository.save(settings);

        // Response 반환 (성공하면 반환할것들 만들어서 json 객체로 만들어서 반환)
        return CreateTeamResponse.builder()
                .success(true)
                .team(CreateTeamResponse.TeamInfo.fromEntity(team, budget))
                .build();


    }

    // 모임 삭제 — 관리자 혼자 남았을 때만 가능 (탈퇴 API-043과는 별도)
    // 다른 멤버가 남아있으면 삭제 못 함(TEAM_HAS_OTHER_MEMBERS) — 먼저 다 나가야 함
    // 지출·심사기록·알림·회칙·예산·팀설정·멤버·팀 순으로 자식부터 완전 삭제(hard delete)
    @Transactional
    public DeleteTeamResponse deleteTeam(Long teamId) {

        // 1. 로그인한 사람 조회
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 2. 이 팀의 관리자인지 확인
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));
        if (member.getRole() != TeamRole.ADMIN) {
            throw new TeamMemberException(TeamMemberErrorCode.NOT_ADMIN_FOR_DELETE);
        }

        // 3. 관리자 혼자(본인만) 남았는지 확인 — 아니면 삭제 거부
        long acceptedCount = teamMemberRepository.countByTeamIdAndStatus(teamId, TeamStatus.ACCEPTED);
        if (acceptedCount > 1) {
            throw new TeamMemberException(TeamMemberErrorCode.TEAM_HAS_OTHER_MEMBERS);
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        // 4. 지출 관련 데이터 연쇄 삭제 (알림·심사기록 먼저 지우고 지출 삭제 — 지출 삭제 API와 동일 순서)
        List<Expense> expenses = expenseRepository.findByTeamIdOrderByExpenseDateDesc(teamId);
        for (Expense expense : expenses) {
            notificationRepository.deleteByExpenseId(expense.getId());
            expensesReviewRepository.deleteByExpenseId(expense.getId());
        }
        expenseRepository.deleteAll(expenses);

        // 5. 회칙 삭제 (있으면)
        policyRepository.findByTeamId(teamId).ifPresent(policyRepository::delete);

        // 6. 예산·팀설정 삭제
        budgetRepository.findByTeamId(teamId).ifPresent(budgetRepository::delete);
        teamSettingsRepository.findByTeamId(teamId).ifPresent(teamSettingsRepository::delete);

        // 7. 마지막 멤버(관리자 본인) 삭제
        teamMemberRepository.delete(member);

        // 8. 팀 자체 삭제
        teamRepository.delete(team);

        return DeleteTeamResponse.builder()
                .success(true)
                .message("모임이 삭제되었습니다.")
                .build();
    }

    // 팀 설정 조회 (API-028) — 회칙·정책 관리 화면에서 회비·승인정책 현재값 표시용
    // 수정(029)은 관리자 전용이지만 조회는 팀 소속이면 역할 무관 가능
    @Transactional(readOnly = true)
    public TeamSettingsResponse getSettings(Long teamId) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));
        teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        TeamSettings settings = teamSettingsRepository.findByTeamId(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        return TeamSettingsResponse.fromEntity(settings);
    }

    // 팀 설정 수정 (API-029) — 마법사 1단계(회비) · 3단계(승인정책) 공용
    // PATCH 방식: 보낸 필드만 반영, 안 보낸 필드(null)는 안 건드림
    @Transactional
    public void updateSettings(Long teamId, UpdateSettingsRequest request) {

        // 0) 권한 확인 — 이 팀 소속 + 관리자만 회비·승인정책을 바꿀 수 있음 (API-029)
        //    (기존엔 이 검사가 없어 로그인만 하면 아무나 남의 팀 설정을 바꿀 수 있었음)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));
        if (member.getRole() != TeamRole.ADMIN) {
            throw new TeamMemberException(TeamMemberErrorCode.NOT_ADMIN_FOR_SETTINGS);
        }

        // 해당 팀의 settings 조회 (모임 생성 때 만들어진 row)
        TeamSettings settings = teamSettingsRepository.findByTeamId(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        // 1) 회비 (음수 방어 — 0은 "없음"이라 허용)
        if (request.getMembershipFee() != null) {
            if (request.getMembershipFee() < 0) {
                throw new IllegalArgumentException("회비는 0 이상이어야 합니다.");
            }
            settings.updateMembershipFee(request.getMembershipFee());
        }

        // 2) 승인 정책 (조건부: autoApprove=true면 관리자 설정 금액 필수)
        if (request.getAutoApprove() != null) {
            if (request.getAutoApprove() && request.getAutoApproveLimit() == null) {
                throw new IllegalArgumentException("자동승인 사용 시 관리자 설정 금액이 필요합니다.");
            }
            settings.updateApprovalPolicy(request.getAutoApprove(), request.getAutoApproveLimit());
        }
    }
}