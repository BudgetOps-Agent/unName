import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './newexpense.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import Input from '@/shared/components/input/Input';
import useCreateExpense from '../../../hooks/useCreateExpense';

const categories = ['회의', 'IT/인프라', '행사', '교육', '식비', '디자인', '기타'];

const CATEGORY_VALUE: Record<string, string> = {
    'IT/인프라': 'IT_인프라',
};

const NewExpense = () => {

    const router = useRouter();
    const { teamId } = router.query;
    const validTeamId = typeof teamId === 'string' ? teamId : undefined;

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);

    const { isSubmitting, submitExpense } = useCreateExpense(validTeamId);

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value.replace(/[^0-9]/g, ''));
    };

    const handleReceiptChange = (e: ChangeEvent<HTMLInputElement>) => {
        setReceipt(e.target.files?.[0] ?? null);
    };

    const isFormValid = title.trim() !== '' && amount !== '' && category !== null && date !== '' && receipt !== null;

    const handleSubmit = async () => {
        if (!category || !receipt) return;

        const result = await submitExpense({
            title,
            amount,
            category: CATEGORY_VALUE[category] ?? category,
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
                    <Input
                        id="title"
                        className={styles.titleInput}
                        label="지출 제목"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="어떤 지출인지 알려 주세요"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>금액</label>
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
                    <label className={styles.label}>카테고리</label>
                    <div className={styles.categoryList}>
                        {categories.map((item) => (
                            <Button
                                key={item}
                                className={`${styles.categoryBtn} ${category === item ? styles.categoryBtnActive : ''}`}
                                text={item}
                                style='ghost'
                                onClick={() => setCategory(category === item ? null : item)}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <Input
                        id="date"
                        className={styles.dateInput}
                        label="지출 발생일"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
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
                        영수증 <span className={styles.required}>*필수</span>
                    </label>
                    <p className={styles.helperText}>ⓘ 영수증을 첨부해야 지출을 요청할 수 있어요</p>

                    <label htmlFor="receipt" className={styles.dropzone}>
                        <input
                            id="receipt"
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className={styles.receiptInput}
                            onChange={handleReceiptChange}
                        />
                        <span className={styles.uploadIcon}>
                            <img src='/upload.svg' alt='업로드' />
                        </span>
                        {receipt ? (
                            <p className={styles.dropzoneTitle}>{receipt.name}</p>
                        ) : (
                            <>
                                <p className={styles.dropzoneTitle}>jpg, png, pdf 파일 업로드</p>
                                <p className={styles.dropzoneSub}>최대 10MB · AI가 자동으로 분석해 드려요</p>
                            </>
                        )}
                    </label>
                </div>
            </Card>

            <Button
                text={isSubmitting ? "요청하는 중..." : "요청하기"}
                style="tertiary"
                size="lg"
                disabled={!isFormValid || isSubmitting}
                onClick={handleSubmit}
            />
        </div>
    )
}

export default NewExpense
