import { useState } from 'react';
import styles from './policyregisterstep.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

type RegisterMethod = 'upload' | 'text' | 'ai';

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
    onPrev: () => void;
    onSkip: () => void;
    onComplete: (value: PolicyRegisterValue) => void;
}

const PolicyRegisterStep = ({ onPrev, onSkip, onComplete }: PolicyRegisterStepProps) => {
    const [method, setMethod] = useState<RegisterMethod>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
    };

    const handleGenerateDraft = () => {
        console.log('POST /policy/draft');
    };

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
                    <p className={styles.uploadSubText}>PDF, Word, 텍스트 파일 지원 · AI가 자동으로 분석해요</p>
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
                    <p className={styles.aiTitle}>AI가 회칙 초안을 만들어 드려요</p>
                    <p className={styles.aiText}>모임 유형과 예산 정보를 바탕으로 적합한 회칙 초안을 자동 생성해요. 이후 수정할 수 있어요.</p>
                    <Button
                        className={styles.aiButton}
                        text="AI 초안 생성하기"
                        onClick={handleGenerateDraft}
                    />
                </div>
            )}

            <div className={styles.buttonSection}>
                <Button className={styles.prevBtn} text="이전" style="secondary" size="lg" onClick={onPrev} />
                <Button className={styles.skipBtn} text="건너뛰기" style="secondary" size="lg" onClick={onSkip} />
                <Button className={styles.completeBtn} text="설정 완료" style="tertiary" size="lg" onClick={handleComplete} />
            </div>
        </Card>
    );
};

export default PolicyRegisterStep;
