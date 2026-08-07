import styles from './policyregisterstep.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import useRecommendPolicy from '@/features/teams/hooks/useRecommendPolicy';

export type RegisterMethod = 'upload' | 'text' | 'ai';

const METHOD_OPTIONS: { id: RegisterMethod; label: string }[] = [
    { id: 'upload', label: '파일 업로드' },
    { id: 'text', label: '직접 입력' },
    { id: 'ai', label: 'AI 초안' },
];

export interface PolicyRegisterValue {
    method: RegisterMethod;
    file: File | null;
    text: string;
}

interface PolicyRegisterStepProps {
    teamId: number | undefined;
    method: RegisterMethod;
    setMethod: (method: RegisterMethod) => void;
    file: File | null;
    setFile: (file: File | null) => void;
    text: string;
    setText: (text: string) => void;
    onPrev: () => void;
    onSkip: () => void;
    onComplete: (value: PolicyRegisterValue) => void;
    isSubmitting?: boolean;
}

const PolicyRegisterStep = ({
    teamId,
    method,
    setMethod,
    file,
    setFile,
    text,
    setText,
    onPrev,
    onSkip,
    onComplete,
    isSubmitting = false,
}: PolicyRegisterStepProps) => {
    const { isLoading: isGeneratingDraft, fetchRecommendation } = useRecommendPolicy();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
    };

    const handleGenerateDraft = async () => {
        if (!teamId) return;

        const result = await fetchRecommendation(teamId);
        if (result.success) {
            setText(result.rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n'));
        } else {
            alert(result.message);
        }
    };

    const isCompleteDisabled =
        (method === 'upload' && file === null) ||
        ((method === 'text' || method === 'ai') && text.trim() === '');

    const handleComplete = () => {
        onComplete({ method, file, text });
    };

    return (
        <Card className={styles.stepCard}>
            <p className={styles.title}>회칙·규정을 등록해 주세요</p>
            <p className={styles.subTitle}>나중에 등록해도 돼요, 없으면 기본 정책 모드로 시작해요</p>

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
                <label htmlFor="setupPolicyFile" className={styles.uploadBox}>
                    <input
                        id="setupPolicyFile"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className={styles.hiddenFileInput}
                        onChange={handleFileSelect}
                    />
                    <span className={styles.uploadIcon}>
                        <img src="/upload.svg" alt="업로드" />
                    </span>
                    {file ? (
                        <p className={styles.uploadText}>{file.name}</p>
                    ) : (
                        <p className={styles.uploadText}>회칙 문서를 업로드해 주세요</p>
                    )}
                    <p className={styles.uploadSubText}>PDF, Word · AI가 자동 분석해요</p>
                </label>
            )}

            {method === 'text' && (
                <textarea
                    className={styles.textArea}
                    placeholder="회칙 내용을 직접 입력해 주세요..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            )}

            {method === 'ai' && (
                <div className={styles.aiBox}>
                    {text ? (
                        <pre className={styles.aiDraftText}>{text}</pre>
                    ) : (
                        <>
                            <p className={styles.aiTitle}>AI가 회칙 초안을 만들어요</p>
                            <p className={styles.aiText}>모임 정보를 바탕으로 적합한 회칙 초안을 자동 생성해요</p>
                            <Button
                                className={styles.aiButton}
                                text={isGeneratingDraft ? "생성하는 중..." : "초안 생성하기"}
                                style="tertiary"
                                onClick={handleGenerateDraft}
                                disabled={isGeneratingDraft}
                            />
                        </>
                    )}
                </div>
            )}

            <div className={styles.buttonSection}>
                <Button className={styles.prevBtn} text="이전" style="secondary" size="lg" onClick={onPrev} disabled={isSubmitting} />
                <Button className={styles.skipBtn} text="건너뛰기" style="secondary" size="lg" onClick={onSkip} disabled={isSubmitting} />
                <Button className={styles.completeBtn} text={isSubmitting ? "등록하는 중..." : "설정 완료"} style="tertiary" size="lg" onClick={handleComplete} disabled={isCompleteDisabled || isSubmitting} />
            </div>
        </Card>
    );
};

export default PolicyRegisterStep;
