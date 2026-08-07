import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './setup.module.css';
import SetupStepper from '@/features/teams/components/SetupWizard/SetupStepper';
import FeeBudgetStep from '@/features/teams/components/SetupWizard/FeeBudgetStep';
import ApprovalPolicyStep, { ApprovalPolicyValue } from '@/features/teams/components/SetupWizard/ApprovalPolicyStep';
import PolicyRegisterStep, { PolicyRegisterValue, RegisterMethod } from '@/features/teams/components/SetupWizard/PolicyRegisterStep';
import useUpdateTeamSettings from '@/features/teams/hooks/useUpdateTeamSettings';
import useCreatePolicy from '@/features/teams/hooks/useCreatePolicy';

const TeamSetup = () => {
    const router = useRouter();
    const step = Number(router.query.step) || 1;
    const teamType = typeof router.query.teamType === 'string' ? router.query.teamType : '';
    const teamId = typeof router.query.teamId === 'string' ? router.query.teamId : undefined;

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

    const { isSubmitting: isSavingSettings, submitSettings } = useUpdateTeamSettings(teamId);
    const { isSubmitting: isSavingPolicy, submitPolicy } = useCreatePolicy(teamId);

    const goToStep = (nextStep: number) => {
        router.push({
            pathname: '/teams/new/setup',
            query: { ...router.query, step: nextStep },
        });
    };

    const handleFeeNext = async (membershipFee: number | null) => {
        const result = await submitSettings({ membershipFee: membershipFee ?? 0 });
        if (result.success) {
            goToStep(2);
        } else {
            alert(result.message);
        }
    };

    const handlePolicyNext = async (value: ApprovalPolicyValue) => {
        const result = await submitSettings(value);
        if (result.success) {
            goToStep(3);
        } else {
            alert(result.message);
        }
    };

    const handleSkip = () => {
        router.push('/teams');
    };

    const handleComplete = async (value: PolicyRegisterValue) => {
        const result = await submitPolicy({
            policyType: value.method === 'upload' ? 'FILE' : 'TEXT',
            content: value.method === 'upload' ? undefined : value.text,
            file: value.method === 'upload' ? value.file : undefined,
        });

        if (result.success) {
            router.push('/teams');
        } else {
            alert(result.message);
        }
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
                    isSubmitting={isSavingSettings}
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
                    isSubmitting={isSavingSettings}
                />
            )}

            {step === 3 && (
                <PolicyRegisterStep
                    teamId={teamId ? Number(teamId) : undefined}
                    method={method}
                    setMethod={setMethod}
                    file={file}
                    setFile={setFile}
                    text={text}
                    setText={setText}
                    onPrev={() => goToStep(2)}
                    onSkip={handleSkip}
                    onComplete={handleComplete}
                    isSubmitting={isSavingPolicy}
                />
            )}
        </div>
    );
};

export default TeamSetup;
