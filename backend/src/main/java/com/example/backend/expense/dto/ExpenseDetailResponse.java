package com.example.backend.expense.dto;

import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.entity.ExpenseCategory;
import com.example.backend.expense.entity.ExpenseStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class ExpenseDetailResponse {

    private boolean success;         // 성공 여부
    private ExpenseInfo expense;     // 지출 상세 정보 (아래 내부 클래스)

    // 지출 상세 정보를 담는 내부 클래스 (명세의 expense: {} 객체부분)
    @Getter
    @Builder
    public static class ExpenseInfo {
        private Long id;                    // 지출 id
        private String title;               // 제목
        private Long amount;                // 금액
        private ExpenseCategory category;   // 카테고리 (enum → JSON에서 "식비" 등으로 나감)
        private String description;         // 설명 (없으면 null)
        private String receiptFileUrl;      // 영수증 파일 접근 URL
        private ExpenseStatus status;       // 상태 (SUBMITTED/ESCALATED/APPROVED/REJECTED)
        private String requesterName;       // 요청자(작성자) 이름
        private LocalDateTime createdAt;    // 등록 시각
        private LocalDateTime approvedAt;   // 승인/반려 확정 시각 (처리 전이면 null)
        private String rejectReason;        // 반려 사유 (반려된 경우만, 아니면 null)
        private LocalDate expenseDate;      // 지출 발생 날짜 (실제 돈 쓴 날)

        // 조회한 사람이 이 지출에 대해 할 수 있는 동작(프론트 버튼 노출용).
        // 실제 권한 강제는 각 API(수정/삭제/승인/반려)가 서버에서 다시 검증하므로,
        // 이 값은 "버튼을 보여줄지" 힌트일 뿐 보안 경계는 아님.
        private boolean canEdit;            // 수정 가능(작성자 본인 + 대기)
        private boolean canDelete;          // 삭제 가능(작성자 본인 또는 ADMIN + 대기)
        private boolean canApprove;         // 승인 가능(ADMIN/ACCOUNTANT + 대기)
        private boolean canReject;          // 반려 가능(ADMIN/ACCOUNTANT + 대기)
    }

    // Expense 엔티티 → 상세 응답 DTO로 변환 (권한 플래그 없이 — 하위호환용, 전부 false)
    public static ExpenseDetailResponse fromEntity(Expense expense) {
        return fromEntity(expense, false, false, false, false);
    }

    // Expense 엔티티 → 상세 응답 DTO로 변환 (조회자 기준 권한 플래그 포함)
    public static ExpenseDetailResponse fromEntity(Expense expense,
                                                   boolean canEdit, boolean canDelete,
                                                   boolean canApprove, boolean canReject) {
        ExpenseInfo info = ExpenseInfo.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .expenseDate(expense.getExpenseDate())
                // receiptUrl은 "uploads/xxx.jpg" 같은 서버 내부 경로라
                // 프론트가 바로 못 씀 → 파일 꺼내주는 통로 URL로 변환해서 내려줌
                .receiptFileUrl(toReceiptFileUrl(expense.getReceiptUrl()))
                .status(expense.getStatus())
                .requesterName(expense.getUser().getName()) // LAZY라 @Transactional 필요
                .createdAt(expense.getCreatedAt())
                .approvedAt(expense.getApprovedAt())
                .rejectReason(expense.getRejectReason())
                .canEdit(canEdit)
                .canDelete(canDelete)
                .canApprove(canApprove)
                .canReject(canReject)
                .build();

        return ExpenseDetailResponse.builder()
                .success(true)
                .expense(info)
                .build();
    }

    // DB에 저장된 경로("uploads/xxx.jpg")를 프론트가 접근 가능한 URL로 바꿔줌
    // 아까 얘기했던 "로컬 파일 꺼내주는 통로"랑 연결됨
    // 파일이 없으면(null) 그대로 null 반환 → 프론트에서 "첨부된 영수증이 없어요" 표시
    private static String toReceiptFileUrl(String receiptUrl) {
        if (receiptUrl == null) {
            return null;
        }
        // "uploads/xxx.jpg" → "/api/files/xxx.jpg" 형태로 변환
        String fileName = receiptUrl.substring(receiptUrl.lastIndexOf("/") + 1);
        return "/api/files/" + fileName;
    }
}