package com.example.backend.global.internal;

import com.example.backend.budget.entity.Budget;
import com.example.backend.budget.repository.BudgetRepository;
import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.exception.ExpenseErrorCode;
import com.example.backend.expense.exception.ExpenseException;
import com.example.backend.expense.repository.ExpenseRepository;
import com.example.backend.global.file.FileStorageService;
import com.example.backend.global.internal.dto.InternalBudgetResponse;
import com.example.backend.global.internal.dto.InternalExpenseResponse;
import com.example.backend.global.internal.dto.InternalTeamProfileResponse;
import com.example.backend.global.internal.dto.InternalTeamSettingsResponse;
import com.example.backend.global.internal.dto.PolicyDocumentResult;
import com.example.backend.policy.entity.Policy;
import com.example.backend.policy.entity.PolicyType;
import com.example.backend.policy.exception.PolicyErrorCode;
import com.example.backend.policy.exception.PolicyException;
import com.example.backend.policy.repository.PolicyRepository;
import org.springframework.core.io.Resource;
import com.example.backend.team.entity.Team;
import com.example.backend.team.entity.TeamSettings;
import com.example.backend.team.repository.TeamRepository;
import com.example.backend.team.repository.TeamSettingsRepository;
import com.example.backend.teamMember.exception.TeamMemberErrorCode;
import com.example.backend.teamMember.exception.TeamMemberException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * LLM(Agent)이 심사할 때 pull 모델로 되물어 가져가는 내부 조회 API 로직 (BE-001~).
 * 로그인 사용자가 아니라 Agent 토큰으로 접근하므로 SecurityContext(로그인 사용자)를 쓰지 않는다.
 */
@Service
@RequiredArgsConstructor
public class InternalAgentService {

    private final ExpenseRepository expenseRepository;
    private final TeamSettingsRepository teamSettingsRepository;
    private final BudgetRepository budgetRepository;
    private final TeamRepository teamRepository;
    private final PolicyRepository policyRepository;
    private final FileStorageService fileStorageService;

    // BE-001 지출 상세
    @Transactional(readOnly = true)
    public InternalExpenseResponse getExpenseDetail(Long orgId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND));

        // 경로의 orgId와 지출의 팀이 일치하는지 확인 (다른 팀 지출을 잘못 조회하는 것 방지)
        if (!expense.getTeam().getId().equals(orgId)) {
            throw new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND);
        }

        return InternalExpenseResponse.builder()
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .category(expense.getCategory() == null ? null : expense.getCategory().name())
                .date(expense.getExpenseDate() == null ? null : expense.getExpenseDate().toString())
                .description(expense.getDescription())
                .build();
    }

    // BE-002 팀 설정
    @Transactional(readOnly = true)
    public InternalTeamSettingsResponse getTeamSettings(Long orgId) {
        TeamSettings settings = teamSettingsRepository.findByTeamId(orgId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        return InternalTeamSettingsResponse.builder()
                .autoApprove(settings.getAutoApprove())
                .autoApproveLimit(settings.getAutoApproveLimit())
                .build();
    }

    // BE-003 예산 현황
    @Transactional(readOnly = true)
    public InternalBudgetResponse getBudget(Long teamId) {
        Budget budget = budgetRepository.findByTeamId(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        return InternalBudgetResponse.builder()
                .totalBudget(budget.getTotalBudget())
                .spent(budget.getUsedBudget())
                .build();
    }

    // BE-006 팀 프로필
    @Transactional(readOnly = true)
    public InternalTeamProfileResponse getTeamProfile(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        return InternalTeamProfileResponse.builder()
                .teamType(team.getTeamType() == null ? null : team.getTeamType().name())
                .build();
    }

    // BE-005 회칙 원본
    // TEXT면 원문을, FILE이면 원본 파일(바이트)을 내려주도록 결과를 조립해서 반환.
    // 실제 Content-Type/Content-Disposition은 컨트롤러가 이 결과로 세팅함
    // (LLM은 Content-Type에 json이 있으면 텍스트, 없으면 파일로 판별)
    @Transactional(readOnly = true)
    public PolicyDocumentResult getPolicyDocument(Long teamId) {
        Policy policy = policyRepository.findByTeamId(teamId)
                .orElseThrow(() -> new PolicyException(PolicyErrorCode.POLICY_NOT_FOUND));

        if (policy.getPolicyType() == PolicyType.TEXT) {
            return PolicyDocumentResult.ofText(policy.getContent());
        }

        // FILE: filePath가 완성 URL(".../api/files/xxx.pdf")이라 마지막 조각이 저장 파일명
        String storedFilePath = policy.getFilePath();
        String storedName = storedFilePath.substring(storedFilePath.lastIndexOf("/") + 1);
        Resource resource = fileStorageService.loadAsResource(storedName);

        return PolicyDocumentResult.ofFile(resource, policy.getMimeType(), policy.getFileName());
    }
}
