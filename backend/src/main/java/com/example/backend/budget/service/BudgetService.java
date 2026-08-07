package com.example.backend.budget.service;

import com.example.backend.budget.dto.BudgetResponse;
import com.example.backend.budget.dto.BudgetUpdateRequest;
import com.example.backend.budget.entity.Budget;
import com.example.backend.budget.exception.BudgetErrorCode;
import com.example.backend.budget.exception.BudgetException;
import com.example.backend.budget.repository.BudgetRepository;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
import com.example.backend.teamMember.entity.TeamMember;
import com.example.backend.teamMember.entity.TeamRole;
import com.example.backend.teamMember.exception.TeamMemberErrorCode;
import com.example.backend.teamMember.exception.TeamMemberException;
import com.example.backend.teamMember.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service // 비즈니스 로직 담당이라는 표시, Spring이 자동으로 Bean 등록
@RequiredArgsConstructor // final 필드들 받는 생성자를 Lombok이 자동으로 만들어줌
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    // 예산 조회 (API-026)
    // 예산 관리 화면 상단의 총 예산 / 사용됨 / 잔여 / N% 사용됨에 쓰임
    //
    // 잔여 예산과 사용률은 DB에 안 들고 있고 여기서 계산해서 내려줌
    // (남은 예산 = 총 - 사용 이라 굳이 저장할 이유가 없음 — budgets 테이블 주석 참고)
    @Transactional(readOnly = true)
    public BudgetResponse getBudget(Long teamId) {

        // 1. 요청자가 이 팀 소속인지 확인 (아니면 403)
        checkTeamMember(teamId);

        // 2. 예산 조회 (없으면 404)
        Budget budget = budgetRepository.findByTeamId(teamId)
                .orElseThrow(() -> new BudgetException(BudgetErrorCode.BUDGET_NOT_FOUND));

        // 3. 응답 변환 (잔여·사용률 계산은 DTO 안에서)
        return BudgetResponse.fromEntity(budget);
    }

    // 예산 수정 (API-027)
    // 예산 관리 화면의 "예산 수정" 모달에서 금액을 넣고 저장하면 총 예산이 갱신됨.
    // 프론트가 (기존 예산 + 입력 금액)을 미리 더해서 최종 합계를 보내주므로,
    // 백엔드는 받은 값을 그대로 설정한다(여기서 또 더하면 이중 합산됨).
    //
    // 사용 예산(usedBudget)은 여기서 안 건드림 —
    // 그건 지출 승인/취소 때만 바뀌는 값이라 예산 수정과 섞이면 숫자가 어긋남
    @Transactional
    public BudgetResponse updateBudget(Long teamId, BudgetUpdateRequest request) {

        // 1. 요청자가 이 팀 소속인지 확인 + 멤버 정보 받기
        TeamMember teamMember = checkTeamMember(teamId);

        // 2. 관리자인지 확인 (아니면 403) — 예산은 관리자만 수정 가능
        if (teamMember.getRole() != TeamRole.ADMIN) {
            throw new BudgetException(BudgetErrorCode.NOT_ADMIN_FOR_BUDGET);
        }

        // 3. 예산 조회 (없으면 404)
        Budget budget = budgetRepository.findByTeamId(teamId)
                .orElseThrow(() -> new BudgetException(BudgetErrorCode.BUDGET_NOT_FOUND));

        // 4. 총 예산을 받은 값으로 설정 (프론트가 이미 기존+입력을 더해서 보냄)
        //    @Transactional 안에서 조회한 엔티티라 값만 바꿔도 커밋 시점에 자동 UPDATE 나감 (더티 체킹)
        budget.updateTotalBudget(request.getTotalBudget());

        // 5. 바뀐 값으로 응답 (프론트가 바로 화면 갱신할 수 있게 계산값까지 같이 내려줌)
        return BudgetResponse.fromEntity(budget);
    }

    // 로그인한 사람이 이 팀 소속인지 확인하는 공통 부분
    // 조회(026)·수정(027) 둘 다 앞부분이 똑같아서 따로 뺐음
    private TeamMember checkTeamMember(Long teamId) {

        // 토큰에서 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 요청자 조회 (없으면 404)
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 이 팀 소속인지 확인 (아니면 403) — 남의 모임 예산 못 보게 막음
        return teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));
    }
}
