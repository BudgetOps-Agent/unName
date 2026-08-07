import { useState, ChangeEvent, SubmitEvent } from 'react';
import { useRouter } from 'next/router';
import styles from './createteamform.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import useCreateTeam from '@/features/teams/hooks/useCreateTeam';
import { TeamType } from '@/types/team';

const teamTypes = ['동아리/학생회', '스터디', '친목', '동호회', '회사'];

const TEAM_TYPE_MAP: Record<string, TeamType> = {
    '동아리/학생회': '동아리_학생회',
    '스터디': '스터디',
    '친목': '친목',
    '동호회': '동호회',
    '회사': '회사',
};

const CreateTeamForm = () => {

    const router = useRouter();

    const [teamType, setTeamType] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');
    const [description, setDescription] = useState('');

    const { isSubmitting, submitTeam } = useCreateTeam();

    const handleBudgetChange = (e: ChangeEvent<HTMLInputElement>) => {
        setBudget(e.target.value.replace(/[^0-9]/g, ''));
    };

    const isFormValid = teamType !== null && name.trim() !== '' && budget.trim() !== '';

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        if (!teamType) return;

        const result = await submitTeam({
            name,
            teamType: TEAM_TYPE_MAP[teamType],
            totalBudget: Number(budget),
            description: description || undefined,
        });

        if (result.success) {
            router.push({
                pathname: '/teams/new/setup',
                query: { step: 1, teamType, teamId: result.team.id },
            });
        } else {
            alert(result.message);
        }
    };

    return (
        <form className={styles.createTeamForm} onSubmit={handleSubmit}>
            <Card className={styles.formCard}>
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
                    <label className={styles.label}>
                        모임 이름 <span className={styles.required}>*</span>
                    </label>
                    <input
                        className={styles.nameInput}
                        type="text"
                        value={name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        placeholder="우리 모임 이름을 정해 주세요"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        초기 예산 <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.budgetInputWrap}>
                        <input
                            className={styles.budgetInput}
                            placeholder="0"
                            inputMode="numeric"
                            value={budget}
                            onChange={handleBudgetChange}
                        />
                        <span className={styles.budgetUnit}>원</span>
                    </div>
                    {budget && (
                        <p className={styles.budgetPreview}>{`${Number(budget).toLocaleString()}원`}</p>
                    )}
                </div>

                <div className={styles.infoBox}>
                    <img src="/info-icon.svg" alt="info" className={styles.infoIcon} />
                    <p>무료 플랜은 최대 20명까지 함께할 수 있어요. 더 많은 멤버가 필요하면 유료 플랜으로 전환해 주세요.</p>
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
            </Card>

            <Button className={styles.submitBtn} type="submit" text={isSubmitting ? "만드는 중..." : "모임 만들고 설정 시작하기 →"} style="tertiary" size="lg" disabled={!isFormValid || isSubmitting} />
        </form>
    )
}

export default CreateTeamForm
