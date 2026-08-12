// 예외를 잡아서 프론트가 보기 좋은 JSON으로 바꿔주는 곳
package com.example.backend.global.exception;

import com.example.backend.budget.exception.BudgetException;
import com.example.backend.expense.exception.ExpenseException;
import com.example.backend.global.llm.AgentUnauthorizedException;
import com.example.backend.global.llm.LlmException;
import com.example.backend.member.exception.MemberException;
import com.example.backend.policy.exception.PolicyException;
import com.example.backend.team.exception.TeamException;
import com.example.backend.teamMember.exception.TeamMemberException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

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
                                .code(e.getErrorCode().name())
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

    // 지출 관련 예외 처리 (지출 못 찾음 404, 작성자 아님 403, 수정 불가 400 등)
    @ExceptionHandler(ExpenseException.class)
    public ResponseEntity<ErrorResponse> handleExpenseException(
            ExpenseException e
    ) {

        log.warn(
                "Expense Exception : {}",
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
    // 회칙(정책) 관련 예외 처리 (관리자 아님 403, 방식별 필수값 누락 400 등)
    @ExceptionHandler(PolicyException.class)
    public ResponseEntity<ErrorResponse> handlePolicyException(
            PolicyException e
    ) {

        log.warn(
                "Policy Exception : {}",
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

    // 동시 승인/반려 충돌 처리 (version 낙관적 락)
    // 두 명이 동시에 같은 지출을 처리하면 늦은 쪽에서 이 예외 발생 → 409로 안내
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLock(
            ObjectOptimisticLockingFailureException e
    ) {

        log.warn(
                "Optimistic Lock 충돌 : {}",
                e.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .code("ALREADY_PROCESSED")
                                .message("다른 사람이 먼저 처리했습니다. 새로고침 후 다시 시도해주세요.")
                                .build()
                );
    }
    // LLM(Agent) 서버 연동 실패 처리 (502 / 503)
    // 우리 서버 잘못이 아니라 바깥 서버가 문제인 경우라 500과 구분해서 내려줌.
    // 상세 원인(스택트레이스)은 LlmClient에서 이미 error 로그로 남김
    @ExceptionHandler(LlmException.class)
    public ResponseEntity<ErrorResponse> handleLlmException(
            LlmException e
    ) {

        log.warn(
                "LLM Exception : {}",
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

    // Agent 서비스 토큰 인증 실패 처리 (401)
    // LLM이 콜백(CB-001)·내부 API(BE-001~)를 부를 때 토큰이 없거나 틀린 경우
    @ExceptionHandler(AgentUnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleAgentUnauthorized(
            AgentUnauthorizedException e
    ) {

        log.warn("Agent Unauthorized : {}", e.getMessage());

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED) // 401
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .code("AGENT_UNAUTHORIZED")
                                .message(e.getMessage())
                                .build()
                );
    }

    // 잘못된 값이 들어왔을 때 400 처리
    //
    // Service에서 throw new IllegalArgumentException("회비는 0 이상이어야 합니다.") 같이 던지는 것들.
    // 이 핸들러가 없으면 맨 아래 Exception.class로 떨어져서 500 + "서버 내부 오류가 발생했습니다"로
    // 나가버림 → 프론트가 뭐가 틀렸는지 못 봄. 그래서 메시지를 그대로 내려줌.
    //
    // 걸리는 곳: TeamService(회비 음수·자동승인 금액 누락),
    //           FileStorageService(파일 없음·확장자 위반·10MB 초과)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException e
    ) {

        log.warn(
                "Invalid Request : {}",
                e.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST) // 400
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .code("INVALID_REQUEST")
                                .message(e.getMessage()) // Service가 던진 메시지 그대로
                                .build()
                );
    }

    // HTTP 메서드를 잘못 썼을 때 405 처리
    // 예: PATCH여야 하는데 POST로 보냄 → "Request method 'POST' is not supported"
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException e
    ) {

        log.warn(
                "Method Not Allowed : {}",
                e.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED) // 405
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .code("METHOD_NOT_ALLOWED")
                                .message(e.getMessage())
                                .build()
                );
    }

    // 없는 URL로 요청했을 때 404 처리 (오타 등)
    // 예: /api/teams/1/polices (policies 오타) → 매핑된 컨트롤러가 없어서 정적 리소스로 찾다가 실패
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(
            NoResourceFoundException e
    ) {

        log.warn(
                "No Resource Found : {}",
                e.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND) // 404
                .body(
                        ErrorResponse.builder()
                                .success(false)
                                .code("NOT_FOUND")
                                .message("요청하신 경로를 찾을 수 없습니다: " + e.getResourcePath())
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