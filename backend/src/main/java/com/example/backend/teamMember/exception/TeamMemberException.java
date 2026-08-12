// 모임 멤버(초대) 관련 예외 처리
package com.example.backend.teamMember.exception;

/**
 * TeamMemberException 역할
 *
 * 모임 멤버(초대) 관련 예외를 발생시킨다.
 *
 * 사용 예시
 *
 * throw new TeamMemberException(
 *     TeamMemberErrorCode.NOT_ADMIN
 * );
 *
 * 처리 순서
 *
 * Service
 * ↓
 * 예외 발생
 * ↓
 * TeamMemberException 생성
 * ↓
 * GlobalExceptionHandler 처리
 * ↓
 * ErrorResponse 반환
 */
public class TeamMemberException extends RuntimeException {

    private final TeamMemberErrorCode errorCode;

    public TeamMemberException(
            TeamMemberErrorCode errorCode
    ) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public TeamMemberErrorCode getErrorCode() {
        return errorCode;
    }
}