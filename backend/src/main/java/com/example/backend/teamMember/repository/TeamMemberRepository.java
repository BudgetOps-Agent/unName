package com.example.backend.teamMember.repository;

import com.example.backend.teamMember.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    // 특정 팀의 멤버 목록 조회 - 멤버 관리 화면에서 모임 멤버 목록 보여줄 때 씀(멤버 페이지)
    List<TeamMember> findByTeamIdAndStatus(Long teamId, String status);

    // 특정 유저의 모임/초대 목록 조회
    // status = "ACCEPTED" → 내 모임 목록
    // status = "PENDING" → 내 모임에서 받은 초대 목록
    List<TeamMember> findByUserIdAndStatus(Long userId, String status);

    // 특정 팀의 특정 유저 조회 (관리자인지 조회하기 위해서)
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);

    // 이미 초대됐는지 확인 (중복 초대 방지)
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);

    // 특정 팀의 인원 수 세기 (ACCEPTED 상태만) - my-teams에서 memberCount 계산할 때 씀
    long countByTeamIdAndStatus(Long teamId, String status);
}