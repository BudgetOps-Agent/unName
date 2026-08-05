import { useState } from 'react';
import styles from './policymanagecard.module.css';
import Button from '@/shared/components/button/Button';

type RegisterMethod = 'upload' | 'text' | 'ai';

const METHOD_OPTIONS: { id: RegisterMethod; label: string }[] = [
    { id: 'upload', label: '파일 업로드' },
    { id: 'text', label: '직접 입력' },
    { id: 'ai', label: 'AI 추천' },
];

const PolicyManageCard = () => {
    const [method, setMethod] = useState<RegisterMethod>('upload');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [policyText, setPolicyText] = useState('');
    const [autoApproveLimit, setAutoApproveLimit] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadedFile(e.target.files?.[0] ?? null);
    };

    const MIN_AUTO_APPROVE_LIMIT = 50000;

    const handleAutoApproveLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAutoApproveLimit(e.target.value.replace(/[^0-9]/g, ''));
    };

    const autoApproveLimitNumber = Number(autoApproveLimit) || 0;
    const isAutoApproveLimitValid = autoApproveLimitNumber >= MIN_AUTO_APPROVE_LIMIT;

    const isPolicyProvided =
        (method === 'upload' && uploadedFile !== null) ||
        (method === 'text' && policyText.trim() !== '') ||
        method === 'ai';

    const isFormValid = isPolicyProvided || isAutoApproveLimitValid;

    return (
        <div className={styles.container}>
            <p className={styles.title}>회칙·규정 수정</p>
            <p className={styles.subTitle}>회칙을 등록하면 AI가 지출 심사 기준으로 활용해요</p>

            <div className={styles.methodTabs}>
                {METHOD_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        className={`${styles.methodTab} ${method === option.id ? styles.methodTabActive : ''}`}
                        onClick={() => setMethod(option.id)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {method === 'upload' && (
                <label htmlFor="policyFile" className={styles.uploadBox}>
                    <input
                        id="policyFile"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className={styles.hiddenFileInput}
                        onChange={handleFileSelect}
                    />
                    <span className={styles.uploadIcon}>
                        <img src="/upload.svg" alt="업로드" />
                    </span>
                    {uploadedFile ? (
                        <p className={styles.uploadText}>{uploadedFile.name}</p>
                    ) : (
                        <p className={styles.uploadText}>회칙 문서를 업로드해 주세요</p>
                    )}
                    <p className={styles.uploadSubText}>PDF, Word · AI가 자동으로 분석해요</p>
                </label>
            )}

            {method === 'text' && (
                <textarea
                    className={styles.textArea}
                    placeholder="회칙 내용을 직접 입력해 주세요..."
                    value={policyText}
                    onChange={(e) => setPolicyText(e.target.value)}
                />
            )}

            {method === 'ai' && (
                <div className={styles.aiBox}>
                    <p className={styles.aiTitle}>AI가 회칙 초안을 만들어 드려요</p>
                    <p className={styles.aiText}>모임 유형과 예산 정보를 바탕으로 적합한 회칙 초안을 자동 생성해요. 이후 수정할 수 있어요.</p>
                    <Button
                        className={styles.aiButton}
                        text="AI 초안 생성하기"
                        onClick={() => console.log('AI 초안 생성하기 클릭')}
                    />
                </div>
            )}

            <div className={styles.paramSection}>
                <p className={styles.sectionTitle}>승인 정책 파라미터</p>
                <p className={styles.sectionSubTitle}>관리자만 수정할 수 있어요</p>

                <div className={styles.paramField}>
                    <label className={styles.paramLabel}>관리자 승인 필수 금액</label>
                    <div className={styles.amountInput}>
                        <input
                            inputMode="numeric"
                            placeholder="50,000"
                            value={autoApproveLimit}
                            onChange={handleAutoApproveLimitChange}
                        />
                        <span className={styles.unit}>원</span>
                    </div>

                    {autoApproveLimit !== '' && (
                        isAutoApproveLimitValid ? (
                            <p className={styles.paramPreview}>{`${autoApproveLimitNumber.toLocaleString()}원`}</p>
                        ) : (
                            <p className={styles.paramErrorText}>최소 금액은 50,000원이에요</p>
                        )
                    )}

                    <p className={styles.paramHelper}>이 금액 초과 시 항상 관리자 검토가 필요해요</p>
                </div>

                <Button
                    className={styles.saveButton}
                    text="저장하기"
                    style='tertiary'
                    disabled={!isFormValid}
                    onClick={() => console.log('저장하기 클릭')}
                />
            </div>
        </div>
    );
};

export default PolicyManageCard;
