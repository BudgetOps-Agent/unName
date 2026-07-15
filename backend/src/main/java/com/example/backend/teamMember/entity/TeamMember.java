package com.example.backend.teamMember.entity;

import com.example.backend.member.entity.User;
import com.example.backend.team.entity.Team;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_members")
@Getter
@NoArgsConstructor
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // teams 테이블 외래키 (다대일 여러 유저가 한 모임에 속함)
    @ManyToOne(fetch = FetchType.LAZY)// 한 모임에 유저가 여러명 있으니깐 유저 다 모임 일
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    // users 테이블 외래키 (다대일 여러 모임에 한 유저가 속할 수 있음)
    @ManyToOne(fetch = FetchType.LAZY) // 유저 한명이 여러 모임에 있을수도 있으니깐 teamMember 레코드 다 유저 일
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String role; // 모임 내 역할 (ADMIN/ACCOUNTANT/MEMBER)

    @Column
    private LocalDateTime joinedAt; // 가입 시간 (수락 전엔 NULL값)

    @Column(nullable = false)
    private LocalDateTime invitedAt; // 초대 받은 시간

    @Column(nullable = false)
    private String status; // 초대 상태 (PENDING/ACCEPTED/REJECTED) 대기,수락,거절

    @Builder
    public TeamMember(Team team, User user, String role, String status) {
        this.team = team;
        this.user = user;
        this.role = role;
        this.status = status;
        this.invitedAt = LocalDateTime.now();
    }

    // 초대 수락 메서드
    public void accept() {
        this.status = "ACCEPTED";
        this.joinedAt = LocalDateTime.now();
    }

    // 초대 거절 메서드
    public void reject() {
        this.status = "REJECTED";
    }
}