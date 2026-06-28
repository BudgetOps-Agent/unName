package com.example.backend.team.dto;

import com.example.backend.team.entity.Team;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CreateTeamResponse {

    private boolean success;
    private TeamInfo team;

    @Getter
    @Builder
    public static class TeamInfo {
        private Long id;
        private String name;
        private String description;
        private Long initialBudget;
        private Long adminId;
        private String createdAt;

        // 여기서 응답하는건데 builder로 브라우저가 읽을 수 있게 객체로 만들고
        // 그 안에 id, name, description, initialBudget, adminId, createdAt
        // 넣고 build로 만들고 나서 브라우저로 보내기 위해서 이렇게 함
        public static TeamInfo fromEntity(Team team) {
            return TeamInfo.builder()
                    .id(team.getId())
                    .name(team.getName())
                    .description(team.getDescription())
                    .initialBudget(team.getInitialBudget())
                    .adminId(team.getAdmin().getId())
                    .createdAt(team.getCreatedAt().toString())
                    .build();
        }
    }
}