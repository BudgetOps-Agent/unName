import { useState } from 'react';
import styles from './policymanagecard.module.css';
import Button from '@/shared/components/button/Button';
import { Badge } from '@/shared/components/badge/Badge';

type RegisterMethod = 'upload' | 'text' | 'ai';

const METHOD_OPTIONS: { id: RegisterMethod; label: string }[] = [
    { id: 'upload', label: '파일 업로드' },
    { id: 'text', label: '직접 입력' },
    { id: 'ai', label: 'AI 초안' },
];

interface PolicyVersion {
    id: number;
    version: string;
    updatedAt: string;
    updatedBy: string;
    isActive: boolean;
}

const POLICY_VERSIONS: PolicyVersion[] = [
    { id: 3, version: 'v3', updatedAt: '2025-01-20 업데이트', updatedBy: '김민준', isActive: true },
    { id: 2, version: 'v2', updatedAt: '2025-01-05 업데이트', updatedBy: '김민준', isActive: false },
    { id: 1, version: 'v1', updatedAt: '2024-12-01 업데이트', updatedBy: '김민준', isActive: false },
];

const PolicyManageCard = () => {
    const [method, setMethod] = useState<RegisterMethod>('upload');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [policyText, setPolicyText] = useState('');
    const [autoApproveLimit, setAutoApproveLimit] = useState('');
    const [escalationLimit, setEscalationLimit] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadedFile(e.target.files?.[0] ?? null);
    };

    return (
        <div className={styles.container}>
            <p className={styles.title}>회칙·규정 등록</p>
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
                    <p className={styles.uploadSubText}>PDF, Word, 텍스트 파일 지원 · AI가 자동으로 분석해요</p>
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
                    <label className={styles.paramLabel}>자동 승인 상한액</label>
                    <div className={styles.amountInput}>
                        <input
                            type="number"
                            placeholder="100000"
                            value={autoApproveLimit}
                            onChange={(e) => setAutoApproveLimit(e.target.value)}
                        />
                        <span className={styles.unit}>원</span>
                    </div>
                    <p className={styles.paramHelper}>이 금액 이하 지출은 AI가 자동으로 승인해요</p>
                </div>

                <div className={styles.paramField}>
                    <label className={styles.paramLabel}>에스컬레이션 기준액</label>
                    <div className={styles.amountInput}>
                        <input
                            type="number"
                            placeholder="500000"
                            value={escalationLimit}
                            onChange={(e) => setEscalationLimit(e.target.value)}
                        />
                        <span className={styles.unit}>원</span>
                    </div>
                    <p className={styles.paramHelper}>이 금액 초과 시 항상 관리자 검토가 필요해요</p>
                </div>

                <Button
                    className={styles.saveButton}
                    text="저장하기"
                    style='tertiary'
                    onClick={() => console.log('저장하기 클릭')}
                />
            </div>

            <div className={styles.historySection}>
                <p className={styles.sectionTitle}>회칙 버전 이력</p>

                <div className={styles.historyList}>
                    {POLICY_VERSIONS.map((item) => (
                        <div key={item.id} className={styles.historyItem}>
                            <Badge text={item.version} style={item.isActive ? 'green' : 'gray'} />

                            <div className={styles.historyInfo}>
                                <p className={styles.historyDate}>{item.updatedAt}</p>
                                <span className={styles.historyAuthor}>{item.updatedBy}</span>
                            </div>

                            {item.isActive ? (
                                <span className={styles.historyActive}>적용 중</span>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.historyLink}
                                    onClick={() => console.log('회칙 버전 보기 클릭', item.version)}
                                >
                                    보기
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PolicyManageCard;
