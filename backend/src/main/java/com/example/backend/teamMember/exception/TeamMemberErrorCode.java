// 모임 멤버(초대) 관련 에러 코드를 관리
package com.example.backend.teamMember.exception;

import org.springframework.http.HttpStatus;

/**
 * TeamMemberErrorCode 역할
 *
 * 모임 멤버(초대) 관련 에러를 관리한다.
 *
 * 처리 순서
 *
 * Service
 * ↓
 * 에러 발생
 * ↓
 * TeamMemberErrorCode 선택
 * ↓
 * TeamMemberException 전달
 */
public enum TeamMemberErrorCode {

    // 초대하려는 사람이 이 모임의 멤버조차 아닐 때
    // 정상 흐름에서는 모임장이 초대하니까 항상 멤버겠지만,
    //  teamId를 다른 값으로 바꿔서 자기가 속하지 않은 모임에 초대를 시도할 수도 있으니 방어 코드
    NOT_TEAM_MEMBER(
            HttpStatus.FORBIDDEN,
            "모임 멤버가 아닙니다."
    ),

    // 관리자가 아닌데 초대하려고 할 때
    NOT_ADMIN(
            HttpStatus.FORBIDDEN,
            "관리자만 초대할 수 있습니다."
    ),

    // 초대하려는 모임이 없을 때
    TEAM_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "모임을 찾을 수 없습니다."
    ),

    // 이미 초대됐거나 이미 멤버인 유저를 또 초대하려고 할 때
    ALREADY_INVITED(
            HttpStatus.CONFLICT,
            "이미 초대됐거나 이미 멤버인 유저입니다."
    ),

    // memberId로 초대 정보를 못 찾을 때
    INVITATION_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "초대 정보를 찾을 수 없습니다."
    ),

    // 본인 초대가 아닌데 수락/거절하려고 할 때 (URL 숫자 바꿔서 다른사람꺼 혹시 접근해서 수락/거절 할수도 있으니깐)
    NOT_YOUR_INVITATION(
            HttpStatus.FORBIDDEN,
            "본인의 초대만 처리할 수 있습니다."
    ),

    // 이미 수락/거절 처리된 초대를 또 처리하려고 할 때
    ALREADY_PROCESSED(
            HttpStatus.CONFLICT,
            "이미 처리된 초대입니다."
    ),

    // 권한 위임 대상 멤버를 못 찾을 때 (API-039)
    MEMBER_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "대상 멤버를 찾을 수 없습니다."
    ),

    // 관리자 권한을 자기 자신에게 위임하려고 할 때 (API-039)
    CANNOT_TRANSFER_TO_SELF(
            HttpStatus.BAD_REQUEST,
            "자기 자신에게는 권한을 위임할 수 없습니다."
    ),

    // 권한 변경 시 ADMIN으로는 못 바꾸게 (API-040)
    CANNOT_CHANGE_TO_ADMIN(
            HttpStatus.BAD_REQUEST,
            "관리자 권한은 권한 위임으로만 넘길 수 있습니다."
    ),

    CANNOT_CHANGE_ADMIN(
            HttpStatus.BAD_REQUEST,
            "관리자의 권한은 변경할 수 없습니다."
    ),

    // 관리자는 추방 못 하게 (API-041) - 관리자는 최소 1명 있어야 하므로
    CANNOT_REMOVE_ADMIN(
            HttpStatus.BAD_REQUEST,
            "관리자는 추방할 수 없습니다."
    ),

    NOT_ADMIN_FOR_INVITE(
            HttpStatus.FORBIDDEN,
            "관리자만 초대할 수 있습니다."
    ),

    NOT_ADMIN_FOR_TRANSFER(
            HttpStatus.FORBIDDEN,
            "관리자만 권한을 위임할 수 있습니다."
    ),

    NOT_ADMIN_FOR_CHANGE_ROLE(
            HttpStatus.FORBIDDEN,
            "관리자만 권한을 변경할 수 있습니다."
    ),

    NOT_ADMIN_FOR_REMOVE(
            HttpStatus.FORBIDDEN,
            "관리자만 멤버를 강퇴할 수 있습니다."
    );

    private final HttpStatus status;
    private final String message;

    TeamMemberErrorCode(
            HttpStatus status,
            String message
    ) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}