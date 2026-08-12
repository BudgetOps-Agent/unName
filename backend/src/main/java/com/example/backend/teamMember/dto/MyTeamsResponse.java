package com.example.backend.teamMember.dto;

import com.example.backend.budget.entity.Budget;
import com.example.backend.team.entity.Team;
import com.example.backend.teamMember.entity.TeamMember;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

// API-009 (내 모임 목록 조회) 응답용 DTO
// GET /api/teams/my 요청했을 때 이 형태로 JSON 응답 나감
@Getter
@Builder
public class MyTeamsResponse {

    private boolean success; // 요청 성공 여부

    private List<TeamInfo> teams;      // 내가 ACCEPTED인 모임들 (실제로 가입된 모임 목록)
    private List<PendingInfo> pending; // 내가 PENDING인 초대들 (아직 수락/거절 안 한 초대 목록)

    // teams 배열 안에 들어갈 모임 하나하나의 정보
    @Getter
    @Builder
    public static class TeamInfo {
        private Long id;             // 모임 고유 번호 (teams.id)
        private String name;         // 모임 이름
        private long memberCount;    // 모임 인원 수 (ACCEPTED(수락) 상태인 team_members 개수)
        private String role;         // 이 모임에서 내 역할 (ADMIN/ACCOUNTANT/MEMBER)
        private Long usedBudget;     // 사용한 예산
        private Long totalBudget;    // 총 예산 (remainingBudget + usedBudget 계산해서 넣음)
        private int percentage;      // 예산 사용률 (46처럼 숫자만, %는 프론트에서 붙임)

        // TeamMember(내 역할/상태) + Team(모임 기본정보) + Budget(예산정보) + memberCount(인원수)
        // 이 4가지를 조합해서 TeamInfo 하나를 만들어주는 정적 팩토리 메서드
        // (Service에서 이것저것 다 조회한 다음 여기다 넘겨주기만 하면 TeamInfo가 완성됨)
        public static TeamInfo of(TeamMember teamMember, Team team, Budget budget, long memberCount) {

            long usedBudget = budget.getUsedBudget(); // budgets 테이블에서 사용 예산 꺼내기

            long totalBudget = budget.getTotalBudget();

            // 사용률(%) 계산: 사용예산 / 총예산 * 100
            // 총예산이 0이면 나누기 에러(ArithmeticException) 나니까 그 전에 0으로 처리해서 방지
            int percentage = totalBudget == 0 ? 0 : (int) ((usedBudget * 100) / totalBudget);

            // 위에서 계산한 값들 다 채워서 TeamInfo 객체 생성 후 반환
            return TeamInfo.builder()
                    .id(team.getId())
                    .name(team.getName())
                    .memberCount(memberCount)
                    .role(teamMember.getRole().name())
                    .usedBudget(usedBudget)
                    .totalBudget(totalBudget)
                    .percentage(percentage)
                    .build();
        }
    }

    // pending 배열 안에 들어갈 초대 하나하나의 정보
    @Getter
    @Builder
    public static class PendingInfo {
        private Long id;         // memberId (team_members.id) - 나중에 accept/reject API 호출할 때 이 id를 씀
        private String teamName; // 초대받은 모임 이름
        private String invitedAt; // 초대받은 시간
        private String inviterName; // 초대한 사람 이름(모임장)

        // TeamMember 하나만 있으면 PendingInfo 만들 수 있음 (Budget이나 memberCount 필요 없음)
        public static PendingInfo of(TeamMember teamMember) {
            return PendingInfo.builder()
                    .id(teamMember.getId())
                    .teamName(teamMember.getTeam().getName()) // TeamMember → Team 타고 들어가서 이름 꺼내기
                    .invitedAt(teamMember.getInvitedAt().toString()) // LocalDateTime을 문자열로 변환
                    .inviterName(teamMember.getTeam().getAdmin().getName()) // 모임에서 admin인 사람에 이름을 뽑아오기
                    .build();
        }
    }
}