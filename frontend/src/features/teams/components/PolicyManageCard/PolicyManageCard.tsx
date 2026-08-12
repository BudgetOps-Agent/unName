import { useEffect, useRef, useState } from 'react';
import styles from './policymanagecard.module.css';
import Button from '@/shared/components/button/Button';
import LoadingText from '@/shared/components/loading/LoadingText';
import useUpdateTeamSettings from '@/features/teams/hooks/useUpdateTeamSettings';
import useCreatePolicy from '@/features/teams/hooks/useCreatePolicy';
import useRecommendPolicy from '@/features/teams/hooks/useRecommendPolicy';
import useTeamSettings from '@/features/teams/hooks/useTeamSettings';
import useTeamPolicy from '@/features/teams/hooks/useTeamPolicy';
import { validateFile, POLICY_EXTENSIONS, POLICY_ACCEPT } from '@/features/teams/utils/fileValidator';

type RegisterMethod = 'upload' | 'text' | 'ai';

const METHOD_OPTIONS: { id: RegisterMethod; label: string }[] = [
    { id: 'upload', label: '파일 업로드' },
    { id: 'text', label: '직접 입력' },
    { id: 'ai', label: 'AI 추천' },
];

const MIN_AUTO_APPROVE_LIMIT = 50000;

interface PolicyManageCardProps {
    teamId: string | undefined;
}

const PolicyManageCard = ({ teamId }: PolicyManageCardProps) => {
    const [method, setMethod] = useState<RegisterMethod>('upload');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    // policyDraft는 textarea에 입력 중인 값, policyText는 '수정'으로 확정해 저장 대상이 된 값
    const [policyDraft, setPolicyDraft] = useState('');
    const [policyText, setPolicyText] = useState('');
    const [autoApproveLimit, setAutoApproveLimit] = useState('');
    const [membershipFee, setMembershipFee] = useState('');
    const [noFee, setNoFee] = useState(false);
    const [alwaysReviewManually, setAlwaysReviewManually] = useState(false);
    const [aiDraft, setAiDraft] = useState('');
    const [aiApplied, setAiApplied] = useState(false);
    const didInitMethod = useRef(false);

    const { settings, isLoading: isLoadingSettings, refetch: refetchSettings } = useTeamSettings(teamId);
    const { policy, isLoading: isLoadingPolicy, hasFetched: hasFetchedPolicy, refetch: refetchPolicy } = useTeamPolicy(teamId);
    const { isSubmitting: isSavingSettings, submitSettings } = useUpdateTeamSettings(teamId);
    const { isSubmitting: isSavingPolicy, submitPolicy } = useCreatePolicy(teamId);
    const { isLoading: isGeneratingDraft, fetchRecommendation } = useRecommendPolicy();

    // 저장된 회칙 본문 (FILE이면 본문이 없음). 변경 여부 판단 기준으로도 씀
    const savedContent = policy?.policyType === 'TEXT' ? (policy.content ?? '') : '';

    // 승인 정책은 값이 아니라 모드(직접 확인 여부)라 placeholder로 표현할 수 없어 토글 상태에 직접 반영
    useEffect(() => {
        if (!settings) return;
        setAlwaysReviewManually(!settings.autoApprove);
    }, [settings]);

    // 저장된 회칙을 각 탭의 초기값으로 채우고, 저장돼 있던 방식의 탭을 먼저 보여줌
    useEffect(() => {
        if (!policy) return;

        if (policy.policyType === 'TEXT') {
            const content = policy.content ?? '';
            setPolicyDraft(content);
            setPolicyText(content);
            // 직접 입력과 AI 추천은 저장되면 둘 다 TEXT라 구분이 없음 — 두 탭 모두 현재 회칙을 보여준다
            setAiDraft(content);
        }

        // 탭은 처음 들어왔을 때만 맞춰줌. 저장 후 재조회에서도 바꾸면 보고 있던 탭이 튄다
        if (!didInitMethod.current) {
            setMethod(policy.policyType === 'TEXT' ? 'text' : 'upload');
            didInitMethod.current = true;
        }

        setAiApplied(false);
    }, [policy]);

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

    // textarea에서 고친 내용을 저장 대상으로 확정 (실제 서버 반영은 아래 저장하기에서)
    const handleConfirmPolicyEdit = () => {
        setPolicyText(policyDraft);
    };

    const autoApproveLimitNumber = Number(autoApproveLimit) || 0;
    const isAutoApproveLimitValid = autoApproveLimitNumber >= MIN_AUTO_APPROVE_LIMIT;
    const membershipFeeNumber = Number(membershipFee) || 0;

    const isFeeProvided = noFee || membershipFee !== '';

    // 금액을 비워두면 "현재값 유지"라는 뜻이므로, 저장할 땐 저장된 값을 그대로 다시 보낸다
    const storedLimit = settings?.autoApproveLimit ?? MIN_AUTO_APPROVE_LIMIT;
    const effectiveLimit = autoApproveLimit !== '' ? autoApproveLimitNumber : storedLimit;

    // 토글만 바꾸고 금액은 그대로 두는 경우도 저장돼야 해서, 저장된 값과 달라졌는지로 판단
    const isApprovalModeChanged = settings != null && alwaysReviewManually !== !settings.autoApprove;
    const isApprovalPolicyProvided = isApprovalModeChanged || (autoApproveLimit !== '' && isAutoApproveLimitValid);

    // 저장된 내용과 같으면 다시 등록할 이유가 없으므로 변경분만 저장 대상으로 본다
    const isPolicyProvided =
        (method === 'upload' && uploadedFile !== null) ||
        (method === 'text' && policyText.trim() !== '' && policyText !== savedContent) ||
        (method === 'ai' && aiApplied && aiDraft.trim() !== '' && aiDraft !== savedContent);

    const isFormValid = isFeeProvided || isApprovalPolicyProvided || isPolicyProvided;
    const isSaving = isSavingSettings || isSavingPolicy;
    const isLoading = isLoadingSettings || isLoadingPolicy;

    // 첨부된 파일 다운로드는 서버가 attachment로 내려주므로 링크만 걸면 됨
    const policyDownloadUrl = policy
        ? `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '')}/api/policies/${policy.id}/download`
        : null;

    const handleSave = async () => {
        // 회칙 미입력은 세 방식 모두 isPolicyProvided에서 걸러져 저장 블록을 건너뛴다.
        // 예전엔 파일 업로드만 여기서 return으로 막혀서, 회칙을 건드릴 생각 없이
        // 회비·승인정책만 바꿔도 저장이 통째로 취소됐다
        if (isFeeProvided || isApprovalPolicyProvided) {
            const result = await submitSettings({
                ...(isFeeProvided && { membershipFee: noFee ? 0 : membershipFeeNumber }),
                ...(isApprovalPolicyProvided && {
                    autoApprove: !alwaysReviewManually,
                    autoApproveLimit: alwaysReviewManually ? undefined : effectiveLimit,
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

        // 저장한 값이 다시 현재값이 되도록 다시 조회 (placeholder·회칙 표시 갱신)
        setMembershipFee('');
        setAutoApproveLimit('');
        setUploadedFile(null);
        refetchSettings();
        refetchPolicy();

        alert('저장됐어요.');
    };

    if (isLoading && !hasFetchedPolicy) {
        return (
            <div className={styles.container}>
                <LoadingText />
            </div>
        );
    }

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
                <>
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
                        {/* 새로 고른 파일이 우선, 없으면 이미 등록된 파일명을 보여줌 */}
                        {uploadedFile ? (
                            <p className={styles.uploadText}>{uploadedFile.name}</p>
                        ) : policy?.policyType === 'FILE' && policy.fileName ? (
                            <p className={styles.uploadText}>{policy.fileName}</p>
                        ) : (
                            <p className={styles.uploadText}>회칙 문서를 업로드해 주세요</p>
                        )}
                        <p className={styles.uploadSubText}>PDF, Word · AI가 자동으로 분석해요</p>
                    </label>

                    {policy?.policyType === 'FILE' && policyDownloadUrl && (
                        <a href={policyDownloadUrl} className={styles.downloadLink}>
                            <img src="/download-blue.svg" alt="다운로드" />
                            파일 내려받기
                        </a>
                    )}
                </>
            )}

            {method === 'text' && (
                <>
                    <textarea
                        className={styles.textArea}
                        placeholder="회칙 내용을 직접 입력해 주세요..."
                        value={policyDraft}
                        onChange={(e) => setPolicyDraft(e.target.value)}
                    />

                    {/* 확정된 값(policyText)과 달라졌을 때만 활성화되고, 누르면 다시 같아져 비활성화된다 */}
                    <div className={styles.textActions}>
                        <Button
                            className={styles.editConfirmButton}
                            text="수정"
                            style="tertiary"
                            size="md"
                            disabled={policyDraft === policyText}
                            onClick={handleConfirmPolicyEdit}
                        />
                    </div>

                    {policyText !== savedContent && policyText.trim() !== '' && (
                        <p className={styles.policyEditNote}>아래 저장하기를 눌러야 반영돼요</p>
                    )}
                </>
            )}

            {method === 'ai' && (
                <div className={styles.aiBox}>
                    {aiDraft ? (
                        <>
                            <pre className={styles.aiDraftText}>{aiDraft}</pre>

                            <div className={styles.aiActions}>
                                {/* 호출할 때마다 새 초안이 오고 저장은 되지 않음 */}
                                <Button
                                    className={styles.aiRefreshButton}
                                    text={isGeneratingDraft ? "생성하는 중..." : "새로 추천받기"}
                                    style="secondary"
                                    size="md"
                                    onClick={handleGenerateAiDraft}
                                    disabled={isGeneratingDraft}
                                />

                                {/* 이 버튼은 서버에 저장하지 않고 "이 초안을 쓰겠다"는 선택만 함.
                                    실제 등록은 아래 저장하기(handleSave)에서 일어나므로 문구로 구분해 준다 */}
                                <Button
                                    className={styles.aiButton}
                                    text={aiApplied ? "선택됨" : "이 초안 사용하기"}
                                    size="md"
                                    onClick={handleApplyAiDraft}
                                    disabled={aiApplied || aiDraft === savedContent}
                                />
                            </div>

                            {aiDraft === savedContent && (
                                <p className={styles.aiApplyNote}>지금 적용된 회칙이에요</p>
                            )}
                            {aiApplied && (
                                <p className={styles.aiApplyNote}>아래 저장하기를 눌러야 반영돼요</p>
                            )}
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
                        {/* 현재 저장값을 placeholder로 보여주고, 비워두면 그대로 유지됨 */}
                        <input
                            inputMode="numeric"
                            placeholder={settings ? settings.membershipFee.toLocaleString() : '0'}
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
                                    placeholder={settings?.autoApproveLimit != null ? settings.autoApproveLimit.toLocaleString() : '50,000'}
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