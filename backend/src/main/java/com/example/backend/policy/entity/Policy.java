package com.example.backend.policy.entity;

import com.example.backend.member.entity.User;
import com.example.backend.team.entity.Team;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "policies")
@Getter
@NoArgsConstructor
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어느 팀의 회칙인지 (fk → teams.id)
    // 팀당 회칙 1개(덮어쓰기)라 사실상 유니크
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    // 등록한 사람 (fk → users.id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // 정책 등록 방식 (TEXT=직접입력/AI초안, FILE=파일업로드)
    @Enumerated(EnumType.STRING)
    @Column(name = "policy_type", nullable = false)
    private PolicyType policyType;

    // 정책 내용 (TEXT일 때 사용, FILE이면 null)
    @Column(columnDefinition = "TEXT")
    private String content;

    // 파일명 (FILE일 때만)
    @Column(name = "file_name")
    private String fileName;

    // 파일 저장 경로 (FILE일 때만) — LLM한테 이 URL 전달
    @Column(name = "file_path", length = 500)
    private String filePath;

    // 파일 MIME 타입 (application/pdf, application/vnd.openxmlformats... 등)
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Policy(Team team, User createdBy, PolicyType policyType,
                  String content, String fileName, String filePath, String mimeType) {
        this.team = team;
        this.createdBy = createdBy;
        this.policyType = policyType;
        this.content = content;
        this.fileName = fileName;
        this.filePath = filePath;
        this.mimeType = mimeType;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 정책 내용 수정 (팀당 1개 덮어쓰기)
    public void update(PolicyType policyType,
                       String content, String fileName, String filePath, String mimeType) {
        this.policyType = policyType;
        this.content = content;
        this.fileName = fileName;
        this.filePath = filePath;
        this.mimeType = mimeType;
        this.updatedAt = LocalDateTime.now();
    }
}