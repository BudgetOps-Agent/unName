import { useState } from 'react';
import styles from './policymanagecard.module.css';
import Button from '@/shared/components/button/Button';
import useUpdateTeamSettings from '@/features/teams/hooks/useUpdateTeamSettings';
import useCreatePolicy from '@/features/teams/hooks/useCreatePolicy';
import useRecommendPolicy from '@/features/teams/hooks/useRecommendPolicy';
import { validateFile, POLICY_EXTENSIONS, POLICY_ACCEPT } from '@/features/teams/utils/fileValidator';

type RegisterMethod = 'upload' | 'text' | 'ai';

const METHOD_OPTIONS: { id: RegisterMethod; label: string }[] = [
    { id: 'upload', label: '파일 업로드' },
    { id: 'text', label: '직접 입력' },
    { id: 'ai', label: 'AI 추천' },
];

interface PolicyManageCardProps {
    teamId: string | undefined;
}

const PolicyManageCard = ({ teamId }: PolicyManageCardProps) => {
    const [method, setMethod] = useState<RegisterMethod>('upload');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [policyText, setPolicyText] = useState('');
    const [autoApproveLimit, setAutoApproveLimit] = useState('');
    const [membershipFee, setMembershipFee] = useState('');
    const [noFee, setNoFee] = useState(false);
    const [alwaysReviewManually, setAlwaysReviewManually] = useState(false);
    const [aiDraft, setAiDraft] = useState('');
    const [aiApplied, setAiApplied] = useState(false);

    const { isSubmitting: isSavingSettings, submitSettings } = useUpdateTeamSettings(teamId);
    const { isSubmitting: isSavingPolicy, submitPolicy } = useCreatePolicy(teamId);
    const { isLoading: isGeneratingDraft, fetchRecommendation } = useRecommendPolicy();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;

        if (selected) {
            const errorMessage = validateFile(selected, POLICY_EXTENSIONS);

            if (errorMessage) {
                alert(errorMessage);
                e.target.value = ''; // 같은 파일을 다시 선택해도 onChange가 걸리도록 초기화
                return;
            }
        }

        setUploadedFile(selected);
    };

    const MIN_AUTO_APPROVE_LIMIT = 50000;

    const handleAutoApproveLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAutoApproveLimit(e.target.value.replace(/[^0-9]/g, ''));
    };

    const handleMembershipFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMembershipFee(e.target.value.replace(/[^0-9]/g, ''));
    };

    const handleNoFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setNoFee(checked);
        if (checked) {
            setMembershipFee('');
        }
    };

    const handleGenerateAiDraft = async () => {
        if (!teamId) return;

        const result = await fetchRecommendation(Number(teamId));
        if (result.success) {
            setAiDraft(result.rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n'));
            setAiApplied(false);
        } else {
            alert(result.message);
        }
    };

    const handleApplyAiDraft = () => {
        setAiApplied(true);
    };

    const autoApproveLimitNumber = Number(autoApproveLimit) || 0;
    const isAutoApproveLimitValid = autoApproveLimitNumber >= MIN_AUTO_APPROVE_LIMIT;
    const membershipFeeNumber = Number(membershipFee) || 0;

    const isFeeProvided = noFee || membershipFee !== '';
    const isApprovalPolicyProvided = alwaysReviewManually || isAutoApproveLimitValid;

    const isPolicyProvided =
        (method === 'upload' && uploadedFile !== null) ||
        (method === 'text' && policyText.trim() !== '') ||
        (method === 'ai' && aiApplied);

    const isFormValid = isFeeProvided || isApprovalPolicyProvided || isPolicyProvided;
    const isSaving = isSavingSettings || isSavingPolicy;

    const handleSave = async () => {
        if (method === 'upload' && !uploadedFile) {
            alert('회칙 파일을 첨부해주세요.');
            return;
        }
        
        if (isFeeProvided || isApprovalPolicyProvided) {
            const result = await submitSettings({
                ...(isFeeProvided && { membershipFee: noFee ? 0 : membershipFeeNumber }),
                ...(isApprovalPolicyProvided && {
                    autoApprove: !alwaysReviewManually,
                    autoApproveLimit: alwaysReviewManually ? undefined : autoApproveLimitNumber,
                }),
            });

            if (!result.success) {
                alert(result.message);
                return;
            }
        }

        if (isPolicyProvided) {
            const result = await submitPolicy({
                policyType: method === 'upload' ? 'FILE' : 'TEXT',
                content: method === 'upload' ? undefined : (method === 'text' ? policyText : aiDraft),
                file: method === 'upload' ? uploadedFile : undefined,
            });

            if (!result.success) {
                alert(result.message);
                return;
            }
        }

        alert('저장됐어요.');
    };

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
                        accept={POLICY_ACCEPT}
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
                    {aiDraft ? (
                        <>
                            <pre className={styles.aiDraftText}>{aiDraft}</pre>
                            <Button
                                className={styles.aiButton}
                                text={aiApplied ? "적용됨" : "적용하기"}
                                onClick={handleApplyAiDraft}
                                disabled={aiApplied}
                            />
                        </>
                    ) : (
                        <>
                            <p className={styles.aiTitle}>AI가 회칙을 만들어 드려요</p>
                            <p className={styles.aiText}>모임 유형과 예산 정보를 바탕으로 적합한 회칙을 자동 생성해요. 이후 수정할 수 있어요.</p>
                            <Button
                                className={styles.aiButton}
                                text={isGeneratingDraft ? "생성하는 중..." : "AI 추천 받아보기"}
                                onClick={handleGenerateAiDraft}
                                disabled={isGeneratingDraft}
                            />
                        </>
                    )}
                </div>
            )}

            <div className={styles.paramSection}>
                <div className={styles.feeSectionHeader}>
                    <div>
                        <p className={styles.sectionTitle}>회비 수정</p>
                        <p className={styles.sectionSubTitle}>관리자만 수정할 수 있어요</p>
                    </div>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={noFee}
                            onChange={handleNoFeeChange}
                        />
                        없음
                    </label>
                </div>

                <div className={styles.paramField}>
                    <label className={styles.paramLabel}>월 회비</label>
                    <div className={styles.amountInput}>
                        <input
                            inputMode="numeric"
                            placeholder="0"
                            value={membershipFee}
                            disabled={noFee}
                            onChange={handleMembershipFeeChange}
                        />
                        <span className={styles.unit}>원</span>
                    </div>

                    {!noFee && membershipFee !== '' && (
                        <p className={styles.paramPreview}>{`${membershipFeeNumber.toLocaleString()}원`}</p>
                    )}
                </div>
            </div>

            <div className={styles.paramSection}>
                <p className={styles.sectionTitle}>승인 정책 수정</p>
                <p className={styles.sectionSubTitle}>관리자만 수정할 수 있어요</p>

                <div className={`${styles.collapsible} ${alwaysReviewManually ? styles.collapsed : ''}`}>
                    <div className={styles.collapsibleInner}>
                        <div className={styles.paramField}>
                            <label className={styles.paramLabel}>관리자 승인 필수 금액</label>
                            <div className={styles.amountInput}>
                                <input
                                    inputMode="numeric"
                                    placeholder="50,000"
                                    value={autoApproveLimit}
                                    disabled={alwaysReviewManually}
                                    onChange={handleAutoApproveLimitChange}
                                />
                                <span className={styles.unit}>원</span>
                            </div>

                            {!alwaysReviewManually && autoApproveLimit !== '' && (
                                isAutoApproveLimitValid ? (
                                    <p className={styles.paramPreview}>{`${autoApproveLimitNumber.toLocaleString()}원`}</p>
                                ) : (
                                    <p className={styles.paramErrorText}>최소 금액은 50,000원이에요</p>
                                )
                            )}

                            <p className={styles.paramHelper}>이 금액 초과 시 항상 관리자 검토가 필요해요</p>
                        </div>
                    </div>
                </div>

                <div className={styles.toggleRow}>
                    <div>
                        <p className={styles.toggleTitle}>모든 지출을 직접 확인할래요</p>
                        <p className={styles.toggleDesc}>AI는 심사는 하되, 최종 결정은 항상 관리자가 해요</p>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={alwaysReviewManually}
                            onChange={(e) => setAlwaysReviewManually(e.target.checked)}
                        />
                        <span className={styles.slider} />
                    </label>
                </div>

                <Button
                    className={styles.saveButton}
                    text={isSaving ? "저장하는 중..." : "저장하기"}
                    style='tertiary'
                    disabled={!isFormValid || isSaving}
                    onClick={handleSave}
                />
            </div>
        </div>
    );
};

export default PolicyManageCard;
