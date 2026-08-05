import styles from './setupstepper.module.css';

const STEPS = [
    { id: 1, label: '회비' },
    { id: 2, label: '승인 정책' },
    { id: 3, label: '회칙·규정' },
];

interface SetupStepperProps {
    currentStep: number;
}

const SetupStepper = ({ currentStep }: SetupStepperProps) => {
    return (
        <div className={styles.stepper}>
            {STEPS.map((step, index) => (
                <div className={styles.stepWrap} key={step.id}>
                    <div className={styles.step}>
                        <span
                            className={`${styles.circle} ${step.id < currentStep ? styles.done : ''} ${step.id === currentStep ? styles.active : ''}`}
                        >
                            {step.id < currentStep ? '✓' : step.id}
                        </span>
                        <span className={`${styles.label} ${step.id === currentStep ? styles.labelActive : ''}`}>
                            {step.label}
                        </span>
                    </div>

                    {index < STEPS.length - 1 && (
                        <span className={`${styles.line} ${step.id < currentStep ? styles.lineDone : ''}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default SetupStepper;
