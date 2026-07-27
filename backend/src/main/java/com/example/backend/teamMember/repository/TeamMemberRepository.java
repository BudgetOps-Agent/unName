package com.example.backend.teamMember.repository;

import com.example.backend.teamMember.entity.TeamMember;
import com.example.backend.teamMember.entity.TeamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    // 특정 팀의 멤버 목록 조회 - 멤버 관리 화면에서 모임 멤버 목록 보여줄 때 씀(멤버 페이지)
    List<TeamMember> findByTeamIdAndStatus(Long teamId, TeamStatus status);

    // 특정 유저의 모임/초대 목록 조회
    // status = "ACCEPTED" → 내 모임 목록
    // status = "PENDING" → 내 모임에서 받은 초대 목록
    List<TeamMember> findByUserIdAndStatusOrderByJoinedAtDesc(Long userId, TeamStatus status);

    // 특정 팀의 특정 유저 조회 (관리자인지 조회하기 위해서)
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);

    // 특정 팀의 인원 수 세기 (ACCEPTED 상태만) - my-teams에서 memberCount 계산할 때 씀
    long countByTeamIdAndStatus(Long teamId, TeamStatus status);

    // 멤버 목록 조회용 (API-038) - role 우선순위(ADMIN → ACCOUNTANT → MEMBER) → 가입일 순 정렬
    // 단순 메서드 이름으로는 "값마다 다른 우선순위 매기기"가 불가능해서 직접 쿼리 작성
    @Query("""
        SELECT tm FROM TeamMember tm
        WHERE tm.team.id = :teamId
        AND tm.status = com.example.backend.teamMember.entity.TeamStatus.ACCEPTED
        ORDER BY
            CASE tm.role
                WHEN com.example.backend.teamMember.entity.TeamRole.ADMIN THEN 1
                WHEN com.example.backend.teamMember.entity.TeamRole.ACCOUNTANT THEN 2
                WHEN com.example.backend.teamMember.entity.TeamRole.MEMBER THEN 3
                ELSE 4
            END ASC,
            tm.joinedAt ASC
        """)
    List<TeamMember> findMembersByTeamId(@Param("teamId") Long teamId);
}