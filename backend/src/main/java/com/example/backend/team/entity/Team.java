package com.example.backend.team.entity;

import com.example.backend.member.entity.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
@Getter
@NoArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true) // 모임 이름은 하나만 잇어야되니깐 중복제거
    private String name;

    @Column // null 허용해서 뒤에 암것도 안씀
    private String description;

    @Column(nullable = false)
    private Long initialBudget; // 초기 예산

    @Column(nullable = false)
    private Integer maxMembers = 20; // 모임 최대인원 일단 20명으로 해놓기로 해서 20명으로 해놓음

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamType teamType; // 모임 유형 (동아리·학생회, 스터디, 친목, 동호회, 회사)

    // admin_id FK → users.id (users 테이블에서 가져온 외래키)
    // ManyToOne = 다대일
    // 모임(Many) : 유저(One)
    // 모임 하나당 모임장은 한 명, 한 사람이 여러 모임의 모임장이 될 수 있음
    // FetchType.LAZY = admin 정보가 실제로 필요할 때만 DB 조회
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User admin;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 모임 생성 시간(수정 불가)

    @Column(nullable = false)
    private LocalDateTime updatedAt; // 모임 수정 시간

    @Builder
    public Team(String name, String description,TeamType teamType, Long initialBudget, User admin) {
        this.name = name;
        this.description = description;
        this.initialBudget = initialBudget;
        this.teamType = teamType;
        this.maxMembers = 20;
        this.admin = admin;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}