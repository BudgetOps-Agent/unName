package com.example.backend.team.repository;

import com.example.backend.team.entity.TeamSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeamSettingsRepository extends JpaRepository<TeamSettings, Long> {

    // 팀 ID로 설정 조회 (1단계 회비 수정, 지출 등록 시 자동승인 설정 읽을 때 사용)
    Optional<TeamSettings> findByTeamId(Long teamId);
}