import { useState, ChangeEvent } from 'react';
import styles from './createteamform.module.css';
import Input from '@/shared/components/input/Input';
import Button from '@/shared/components/button/Button';

const teamTypes = ['동아리/학생회', '스터디', '친목', '동호회', '회사'];

const CreateTeamForm = () => {

    const [teamType, setTeamType] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');
    const [description, setDescription] = useState('');

    const handleBudgetChange = (e: ChangeEvent<HTMLInputElement>) => {
        setBudget(e.target.value.replace(/[^0-9]/g, ''));
    };

    const isFormValid = teamType !== null && name.trim() !== '';

    return (
        <form className={styles.createTeamForm}>
            <div className={styles.formGroup}>
                <label className={styles.label}>
                    모임 유형 <span className={styles.required}>*</span>
                </label>
                <div className={styles.typeList}>
                    {teamTypes.map((type) => (
                        <Button
                            key={type}
                            className={`${styles.typeBtn} ${teamType === type ? styles.typeBtnActive : ''}`}
                            text={type}
                            style='ghost'
                            onClick={() => setTeamType(teamType === type ? null : type)}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.formGroup}>
                <Input
                    id="name"
                    label="모임 이름"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="우리 모임 이름을 정해 주세요"
                    className={styles.nameInput}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>초기 예산</label>
                <div className={styles.budgetInputWrap}>
                    <input
                        className={styles.budgetInput}
                        placeholder="0"
                        inputMode="numeric"
                        value={budget ? Number(budget).toLocaleString() : ''}
                        onChange={handleBudgetChange}
                    />
                    <span className={styles.budgetUnit}>원</span>
                </div>
            </div>

            <div className={styles.infoBox}>
                <p>ⓘ 무료 플랜은 최대 20명까지 함께할 수 있어요. 더 많은 멤버가 필요하면 유료 플랜으로 전환해 주세요.</p>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>
                    모임 소개 <span className={styles.optional}>선택</span>
                </label>
                <textarea
                    className={styles.textarea}
                    placeholder="모임을 간단히 소개해 주세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <Button className={styles.submitBtn} type="submit" text="모임 만들기" style="primary" size="lg" disabled={!isFormValid} />
        </form>
    )
}

export default CreateTeamForm
