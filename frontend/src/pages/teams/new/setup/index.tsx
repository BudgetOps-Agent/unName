import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './setup.module.css';
import SetupStepper from '@/features/teams/components/SetupWizard/SetupStepper';
import FeeBudgetStep from '@/features/teams/components/SetupWizard/FeeBudgetStep';
import ApprovalPolicyStep, { ApprovalPolicyValue } from '@/features/teams/components/SetupWizard/ApprovalPolicyStep';
import PolicyRegisterStep, { PolicyRegisterValue, RegisterMethod } from '@/features/teams/components/SetupWizard/PolicyRegisterStep';

const TeamSetup = () => {
    const router = useRouter();
    const step = Number(router.query.step) || 1;
    const teamType = typeof router.query.teamType === 'string' ? router.query.teamType : '';

    // step 1: 회비
    const [fee, setFee] = useState('');
    const [noFee, setNoFee] = useState(false);

    // step 2: 승인 정책
    const [alwaysReviewManually, setAlwaysReviewManually] = useState(false);
    const [threshold, setThreshold] = useState('');

    // step 3: 회칙·규정
    const [method, setMethod] = useState<RegisterMethod>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');

    const goToStep = (nextStep: number) => {
        router.push({
            pathname: '/teams/new/setup',
            query: { ...router.query, step: nextStep },
        });
    };

    const handleFeeNext = (membershipFee: number | null) => {
        console.log('PATCH /settings', { membershipFee });
        goToStep(2);
    };

    const handlePolicyNext = (value: ApprovalPolicyValue) => {
        console.log('PATCH /settings', value);
        goToStep(3);
    };

    const handleSkip = () => {
        console.log('회칙 등록 건너뜀 - 기본 정책 모드로 시작');
        router.push('/teams');
    };

    const handleComplete = (value: PolicyRegisterValue) => {
        console.log('POST /policies', value);
        router.push('/teams');
    };

    return (
        <div className={styles.setupContainer}>
            <SetupStepper currentStep={step} />

            {step === 1 && (
                <FeeBudgetStep
                    teamType={teamType}
                    fee={fee}
                    setFee={setFee}
                    noFee={noFee}
                    setNoFee={setNoFee}
                    onNext={handleFeeNext}
                />
            )}

            {step === 2 && (
                <ApprovalPolicyStep
                    alwaysReviewManually={alwaysReviewManually}
                    setAlwaysReviewManually={setAlwaysReviewManually}
                    threshold={threshold}
                    setThreshold={setThreshold}
                    onPrev={() => goToStep(1)}
                    onNext={handlePolicyNext}
                />
            )}

            {step === 3 && (
                <PolicyRegisterStep
                    method={method}
                    setMethod={setMethod}
                    file={file}
                    setFile={setFile}
                    text={text}
                    setText={setText}
                    onPrev={() => goToStep(2)}
                    onSkip={handleSkip}
                    onComplete={handleComplete}
                />
            )}
        </div>
    );
};

export default TeamSetup;
