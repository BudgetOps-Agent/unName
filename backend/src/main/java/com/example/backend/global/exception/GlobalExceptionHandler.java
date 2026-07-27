// 예외를 잡아서 프론트가 보기 좋은 JSON으로 바꿔주는 곳
package com.example.backend.global.exception;

import com.example.backend.budget.exception.BudgetException;
import com.example.backend.member.exception.MemberException;
import com.example.backend.team.exception.TeamException;
import com.example.backend.teamMember.exception.TeamMemberException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 회원 관련 예외 처리
     *
     * 예)
     * throw new MemberException(...)
     *
     * 발생 시 여기서 잡는다.
     */
    @ExceptionHandler(MemberException.class)
    public ResponseEntity<ErrorResponse> handleMemberException(
            MemberException e
    ) {

        // 로그 출력
        log.warn(
                "Member Exception : {}",
                e.getMessage()
        );

        // 에러 응답 생성 후 반환
        return ResponseEntity
                .status(
                        e.getErrorCode().getStatus()
                )
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .code(e.getErrorCode().name())
                                .message(
                                        e.getErrorCode().getMessage()
                                )
                                .build()
                );
    }

    /**
     * 모임 멤버(초대) 관련 예외 처리
     *
     * 예)
     * throw new TeamMemberException(...)
     *
     * 발생 시 여기서 잡는다.
     */
    @ExceptionHandler(TeamMemberException.class)
    public ResponseEntity<ErrorResponse> handleTeamMemberException(
            TeamMemberException e
    ) {

        log.warn(
                "TeamMember Exception : {}",
                e.getMessage()
        );

        return ResponseEntity
                .status(
                        e.getErrorCode().getStatus()
                )
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .message(
                                        e.getErrorCode().getMessage()
                                )
                                .build()
                );
    }

    // 400 Bad Request 처리
    @ExceptionHandler(MethodArgumentNotValidException.class) // @Valid 검증 실패했을때 이 메서드가 잡아줌 우와
    public ResponseEntity<ErrorResponse> handleValidException(
            MethodArgumentNotValidException e
    ) {
        String message = e.getBindingResult() // getBindingResult() 검증 결과를 가져옴 이름부터 바인딩리졸트
                .getFieldErrors() // getFieldErrors() 실패한 필드 목록 가져옴 이름부터 필드에러
                .get(0) // get(0)이여서 제일 첫번째 에러 가져옴
                .getDefaultMessage(); // 에러 메세지 가져옴(이메일 형식이 맞지 않습니다) 이런거

        log.warn("Validation Exception : {}", message); // console에 경고 로그 출력

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST) // 나쁜 요청 400에러 반환
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .message(message)
                                .build()
                );
    }

    @ExceptionHandler(TeamException.class)
    public ResponseEntity<ErrorResponse> handleTeamException(
            TeamException e
    ) {

        log.warn(
                "Team Exception : {}",
                e.getMessage()
        );

        return ResponseEntity
                .status(
                        e.getErrorCode().getStatus()
                )
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .code(e.getErrorCode().name())
                                .message(
                                        e.getErrorCode().getMessage()
                                )
                                .build()
                );
    }

    @ExceptionHandler(BudgetException.class)
    public ResponseEntity<ErrorResponse> handleBudgetException(
            BudgetException e
    ) {

        log.warn(
                "Budget Exception : {}",
                e.getMessage()
        );

        return ResponseEntity
                .status(
                        e.getErrorCode().getStatus()
                )
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .code(e.getErrorCode().name())
                                .message(
                                        e.getErrorCode().getMessage()
                                )
                                .build()
                );
    }

    /**
     * 예상하지 못한 서버 오류 처리
     *
     * NullPointerException
     * DB 오류
     * 기타 RuntimeException
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(
            Exception e
    ) {

        // 에러 로그 출력
        log.error(
                "Unexpected Exception",
                e
        );

        // 사용자에게는 공통 메시지 반환
        return ResponseEntity
                .internalServerError()
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .message(
                                        "서버 내부 오류가 발생했습니다."
                                )
                                .build()
                );
    }
}