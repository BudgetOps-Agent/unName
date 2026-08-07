package com.example.backend.policy.service;

import com.example.backend.budget.entity.Budget;
import com.example.backend.budget.repository.BudgetRepository;
import com.example.backend.global.file.FileStorageService;
import com.example.backend.global.llm.LlmClient;
import com.example.backend.global.llm.dto.PolicyDraftRequest;
import com.example.backend.global.llm.dto.PolicyDraftResponse;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
import com.example.backend.policy.dto.PolicyCreateRequest;
import com.example.backend.policy.dto.PolicyCreateResponse;
import com.example.backend.policy.dto.PolicyRecommendResponse;
import com.example.backend.policy.entity.Policy;
import com.example.backend.policy.entity.PolicyType;
import com.example.backend.policy.exception.PolicyErrorCode;
import com.example.backend.policy.exception.PolicyException;
import com.example.backend.policy.repository.PolicyRepository;
import com.example.backend.team.entity.Team;
import com.example.backend.team.repository.TeamRepository;
import com.example.backend.team.entity.TeamSettings;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service // 비즈니스 로직 담당이라는 표시, Spring이 자동으로 Bean 등록
@RequiredArgsConstructor // final 필드들 받는 생성자를 Lombok이 자동으로 만들어줌
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService; // 회칙 파일 저장 담당 부품

    // AI 정책 추천 (API-044) — LLM-005 호출용
    private final BudgetRepository budgetRepository;           // initial_budget 조회
    private final TeamSettingsRepository teamSettingsRepository; // dues, force_escalation_amount 조회
    private final LlmClient llmClient;                          // LLM 서버 호출 담당

    // 회칙 등록 (API-031)
    //
    // 등록 방식 3가지가 들어오지만 백엔드 입장에선 2가지뿐:
    //   - FILE : 파일 업로드 → uploads에 저장하고 URL만 보관 (파일에서 텍스트 안 뽑음)
    //   - TEXT : 직접 입력 / AI 초안 → 둘 다 content에 텍스트가 담겨서 옴 (구분 안 함)
    //
    // 회칙은 팀당 1개 정책이라, 이미 있으면 새로 만들지 않고 그 row를 덮어씀
    //
    // @Transactional(readOnly 없음)을 쓰는 이유: save/update 하는 "쓰기" 작업이라
    // 중간에 문제 생기면 롤백돼서 데이터가 반쪽만 남는 걸 막음
    @Transactional
    public PolicyCreateResponse createPolicy(Long teamId,
                                             PolicyCreateRequest request,
                                             MultipartFile file) {

        // 1. 토큰에서 로그인한 사람 이메일 꺼내기 (ExpenseService랑 동일한 방식)
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회 (없으면 404)
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 팀이 실제로 존재하는지 확인 + Policy에 넣을 Team 객체 조회 (없으면 404)
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        // 4. 요청자가 이 모임 소속인지 확인 (아니면 403) — 남의 팀 회칙 못 건드리게 막음
        TeamMember teamMember = teamMemberRepository
                .findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        // 5. 관리자인지 확인 (아니면 403)
        //    회칙은 AI 지출 심사의 기준이 되는 문서라 관리자만 등록/수정 가능
        //    총무(ACCOUNTANT)도 허용하려면 이 조건에 || role != TeamRole.ACCOUNTANT 추가하면 됨
        if (teamMember.getRole() != TeamRole.ADMIN) {
            throw new PolicyException(PolicyErrorCode.NOT_ADMIN_FOR_POLICY);
        }

        // 6. policyType에 따라 저장할 값 준비
        //    어노테이션(@NotBlank 등)으로는 "FILE이면 file 필수" 같은 조건부 검증을 못 하니
        //    여기 Service에서 if문으로 처리
        String content = null;   // TEXT일 때만 채움
        String fileName = null;  // FILE일 때만 채움 (사용자가 올린 원본 파일명)
        String filePath = null;  // FILE일 때만 채움 (LLM한테 넘길 완성 URL)
        String mimeType = null;  // FILE일 때만 채움 (application/pdf 등)

        if (request.getPolicyType() == PolicyType.FILE) {
            // 파일 업로드 방식인데 파일이 안 왔으면 400
            if (file == null || file.isEmpty()) {
                throw new PolicyException(PolicyErrorCode.POLICY_FILE_REQUIRED);
            }

            // 원본 파일명은 화면에 "회칙.pdf" 라고 보여주려고 따로 저장
            fileName = file.getOriginalFilename();

            // 실제 저장 + 완성 URL 받기 (pdf/docx 검증, 10MB 검증은 storePolicy 내부에서 처리)
            // 반환값 예: http://localhost:8080/api/files/랜덤값.pdf
            filePath = fileStorageService.storePolicy(file);

            // 파일 형식 (다운로드/미리보기 할 때 씀)
            mimeType = file.getContentType();

            // FILE 방식이면 content는 안 씀 → null 유지
            // (파일에서 텍스트를 뽑지 않고, LLM이 위 URL로 직접 읽어가는 구조)

        } else {
            // TEXT 방식 (직접 입력 또는 AI 초안) — 내용이 없으면 400
            if (request.getContent() == null || request.getContent().isBlank()) {
                throw new PolicyException(PolicyErrorCode.POLICY_CONTENT_REQUIRED);
            }
            content = request.getContent();

            // TEXT 방식이면 파일 관련 값은 안 씀 → 전부 null 유지
        }

        // 7. 팀당 회칙 1개 — 이미 있으면 덮어쓰고, 없으면 새로 만듦
        Optional<Policy> existing = policyRepository.findByTeamId(teamId);

        Policy policy;
        if (existing.isPresent()) {
            // 이미 등록된 회칙이 있으면 그 row의 값만 갈아끼움 (id는 그대로 유지)
            // 주의: 예전에 FILE로 올렸다가 TEXT로 바꾸면 uploads 폴더에 옛 파일이 남음.
            //       지금은 그냥 두고, 파일 삭제 기능(API-034)에서 같이 정리할 예정
            policy = existing.get();
            policy.update(
                    request.getPolicyType(),
                    content,
                    fileName,
                    filePath,
                    mimeType
            );
            // @Transactional 안에서 조회한 엔티티라 값만 바꿔도 커밋 시점에 자동 UPDATE 나감
            // (더티 체킹 — save() 안 불러도 됨)

        } else {
            // 회칙이 아직 없으면 새로 만들어서 저장
            policy = Policy.builder()
                    .team(team)
                    .createdBy(requester)
                    .policyType(request.getPolicyType())
                    .content(content)
                    .fileName(fileName)
                    .filePath(filePath)
                    .mimeType(mimeType)
                    .build();
            policyRepository.save(policy);
        }

        // LLM 재인덱싱 트리거 자리
        // 회칙이 바뀌면 AI 지출 심사 기준도 바뀌어야 하므로 Agent Server에 알려줘야 함.
        // 반려 사유 전달(ExpenseService)이랑 똑같이
        // @TransactionalEventListener(AFTER_COMMIT) + @Async로 커밋 성공 후 비동기 전송 예정.
        // Agent Server URL 확정되면 붙임.

        // 8. 응답 반환 (명세: { success, policyId })
        return PolicyCreateResponse.builder()
                .success(true)
                .policyId(policy.getId())
                .build();
    }

    // AI 정책 추천 (API-044) — 마법사 회칙 단계의 "AI 초안 생성하기" 버튼
    //
    // 우리 DB에 있는 모임 정보(유형·이름·예산·회비·인원 등)를 모아서 LLM-005로 보내고,
    // 돌려받은 회칙 초안을 그대로 프론트에 내려준다.
    //
    // 여기서는 저장을 안 한다 — 사용자가 초안을 보고 편집한 뒤
    // API-031(policyType=TEXT)로 저장하는 흐름이라 조회만 하면 됨.
    // 그래서 readOnly = true
    @Transactional(readOnly = true)
    public PolicyRecommendResponse recommendPolicies(Long teamId) {

        // 1. 토큰에서 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회 (없으면 404)
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 팀 조회 (없으면 404)
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        // 4. 요청자가 이 모임 소속인지 확인 (아니면 403)
        TeamMember teamMember = teamMemberRepository
                .findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        // 5. 관리자인지 확인 (아니면 403) — 회칙 등록(API-031)과 동일한 기준
        if (teamMember.getRole() != TeamRole.ADMIN) {
            throw new PolicyException(PolicyErrorCode.NOT_ADMIN_FOR_POLICY);
        }

        // 6. LLM에 보낼 재료 모으기
        Budget budget = budgetRepository.findByTeamId(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        TeamSettings settings = teamSettingsRepository.findByTeamId(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        // 실제 가입한(ACCEPTED) 인원만 셈. 초대 대기(PENDING)는 제외
        long memberCount = teamMemberRepository.countByTeamIdAndStatus(teamId, TeamStatus.ACCEPTED);

        // 관리자 확인 설정 금액. autoApprove=false면 null로 저장돼 있는데
        // LLM 쪽에선 필수 값이라, 이 경우 0을 보냄 (= 모든 금액이 관리자 확인 대상)
        Long forceEscalationAmount = settings.getAutoApproveLimit() != null
                ? settings.getAutoApproveLimit()
                : 0L;

        // 7. 요청 조립 후 LLM-005 호출
        //    rule_source="ai" — 사용자가 "AI 초안" 탭에서 생성 버튼을 누른 경우
        //    파일 업로드·직접 입력·건너뛰기는 초안을 만들 필요가 없어서 이 API를 안 탐
        PolicyDraftRequest request = PolicyDraftRequest.builder()
                .teamId(teamId)
                .teamType(team.getTeamType().name())
                .teamName(team.getName())
                .initialBudget(budget.getTotalBudget())
                .forceEscalationAmount(forceEscalationAmount)
                .ruleSource("ai")
                .memberCount((int) memberCount)
                .description(team.getDescription())
                .dues(settings.getMembershipFee())
                .build();

        PolicyDraftResponse llmResponse = llmClient.policyDraft(request);

        // 8. 응답 변환해서 반환
        return PolicyRecommendResponse.builder()
                .success(true)
                .rules(llmResponse.getRules())
                .recommendedCategories(llmResponse.getRecommendedCategories())
                .notes(llmResponse.getNotes())
                .build();
    }
}
