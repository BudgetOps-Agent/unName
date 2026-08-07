import styles from './policyregisterstep.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

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
    method: RegisterMethod;
    setMethod: (method: RegisterMethod) => void;
    file: File | null;
    setFile: (file: File | null) => void;
    text: string;
    setText: (text: string) => void;
    onPrev: () => void;
    onSkip: () => void;
    onComplete: (value: PolicyRegisterValue) => void;
}

const PolicyRegisterStep = ({
    method,
    setMethod,
    file,
    setFile,
    text,
    setText,
    onPrev,
    onSkip,
    onComplete,
}: PolicyRegisterStepProps) => {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
    };

    const isCompleteDisabled =
        (method === 'upload' && file === null) ||
        (method === 'text' && text.trim() === '');

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
                    <p className={styles.aiTitle}>AI가 회칙 초안을 만들어요</p>
                    <p className={styles.aiText}>모임 정보를 바탕으로 적합한 회칙 초안을 자동 생성해요</p>
                </div>
            )}

            <div className={styles.buttonSection}>
                <Button className={styles.prevBtn} text="이전" style="secondary" size="lg" onClick={onPrev} />
                <Button className={styles.skipBtn} text="건너뛰기" style="secondary" size="lg" onClick={onSkip} />
                <Button className={styles.completeBtn} text="설정 완료" style="tertiary" size="lg" onClick={handleComplete} disabled={isCompleteDisabled} />
            </div>
        </Card>
    );
};

export default PolicyRegisterStep;
