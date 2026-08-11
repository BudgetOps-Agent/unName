import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './newexpense.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import useCreateExpense from '@/features/teams/hooks/useCreateExpense';
import useUpdateExpense from '@/features/teams/hooks/useUpdateExpense';
import useExpenseDetail from '@/features/teams/hooks/useExpenseDetail';
import { validateFile, RECEIPT_EXTENSIONS, RECEIPT_ACCEPT } from '@/features/teams/utils/fileValidator';

const NewExpense = () => {

    const router = useRouter();
    const { teamId, edit } = router.query;
    const validTeamId = typeof teamId === 'string' ? teamId : undefined;
    const editExpenseId = typeof edit === 'string' ? edit : undefined;
    const isEditMode = editExpenseId !== undefined;

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);

    const { isSubmitting: isCreating, submitExpense } = useCreateExpense(validTeamId);
    const { isSubmitting: isUpdating, submitUpdate } = useUpdateExpense(editExpenseId);
    const { expense } = useExpenseDetail(editExpenseId);
    const isSubmitting = isEditMode ? isUpdating : isCreating;

    useEffect(() => {
        if (expense) {
            setTitle(expense.title);
            setAmount(String(expense.amount));
            setDate(expense.expenseDate);
            setDescription(expense.description ?? '');
        }
    }, [expense]);

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value.replace(/[^0-9]/g, ''));
    };

    const handleReceiptChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;

        if (file) {
            const errorMessage = validateFile(file, RECEIPT_EXTENSIONS);

            if (errorMessage) {
                alert(errorMessage);
                e.target.value = ''; // 같은 파일을 다시 선택해도 onChange가 걸리도록 초기화
                return;
            }
        }

        setReceipt(file);
    };

    const isFormValid = isEditMode
        ? title.trim() !== '' && amount !== ''
        : title.trim() !== '' && amount !== '' && date !== '' && receipt !== null;

    const handleSubmit = async () => {
        if (isEditMode) {
            const result = await submitUpdate({ title, amount, description, receipt });

            if (result.success) {
                router.push(`/teams/${validTeamId}/expenses/${editExpenseId}`);
            } else {
                alert(result.message);
            }
            return;
        }

        if (!receipt) return;

        const result = await submitExpense({
            title,
            amount,
            expenseDate: date,
            description,
            receipt,
        });

        if (result.success) {
            router.push(`/teams/${validTeamId}/expenses`);
        } else {
            alert(result.message);
        }
    };

    return (
        <div className={styles.newExpenseContainer}>
            <Link href={`/teams/${teamId}/expenses`} className={`link-back ${styles.backLink}`}>
                <span>지출 내역</span>
            </Link>

            <h1 className={styles.pageTitle}>지출 요청</h1>

            <Card className={styles.formCard}>
                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="title">
                        지출 제목 <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="title"
                        className={styles.titleInput}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="어떤 지출인지 알려 주세요"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        금액 <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.amountInputWrap}>
                        <input
                            className={styles.amountInput}
                            placeholder="0"
                            inputMode="numeric"
                            value={amount ? Number(amount).toLocaleString() : ''}
                            onChange={handleAmountChange}
                        />
                        <span className={styles.amountUnit}>원</span>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="date">
                        지출 발생일 <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="date"
                        className={styles.dateInput}
                        type="date"
                        value={date}
                        disabled={isEditMode}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    {isEditMode && (
                        <p className={styles.helperText}>ⓘ 지출 발생일은 수정할 수 없어요</p>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        설명 <span className={styles.optional}>선택</span>
                    </label>
                    <textarea
                        className={styles.textarea}
                        placeholder="지출 목적이나 내용을 적어 주세요"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        영수증 {!isEditMode && <span className={styles.required}>*</span>}
                    </label>
                    <p className={styles.helperText}>
                        {isEditMode
                            ? 'ⓘ 새 파일을 선택하면 기존 영수증을 교체해요'
                            : 'ⓘ 영수증을 첨부해야 지출을 요청할 수 있어요'}
                    </p>

                    <label htmlFor="receipt" className={styles.dropzone}>
                        <input
                            id="receipt"
                            type="file"
                            accept={RECEIPT_ACCEPT}
                            className={styles.receiptInput}
                            onChange={handleReceiptChange}
                        />
                        <span className={styles.uploadIcon}>
                            <img src='/upload.svg' alt='업로드' />
                        </span>
                        {receipt ? (
                            <p className={styles.dropzoneTitle}>{receipt.name}</p>
                        ) : isEditMode ? (
                            <p className={styles.dropzoneTitle}>기존 영수증 유지 중</p>
                        ) : (
                            <>
                                <p className={styles.dropzoneTitle}>jpg, png, pdf 파일 업로드</p>
                                <p className={styles.dropzoneSub}>최대 10MB · AI가 자동으로 분석해 드려요</p>
                            </>
                        )}
                    </label>
                </div>
            </Card>

            {isEditMode ? (
                <div className={styles.editSubmitBar}>
                    <Button
                        className={styles.completeBtn}
                        text={isSubmitting ? "저장하는 중..." : "완료"}
                        style="tertiary"
                        disabled={!isFormValid || isSubmitting}
                        onClick={handleSubmit}
                    />
                </div>
            ) : (
                <Button
                    text={isSubmitting ? "요청하는 중..." : "요청하기"}
                    style="tertiary"
                    size="lg"
                    disabled={!isFormValid || isSubmitting}
                    onClick={handleSubmit}
                />
            )}
        </div>
    )
}

export default NewExpense
