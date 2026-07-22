import styles from './Skeleton.module.css';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    radius?: number | string;
    delay?: number;
    className?: string;
}

const Skeleton = ({ width = '100%', height = 20, radius = 4, className = '' }: SkeletonProps) => {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={{ width, height, borderRadius: radius }}
        />
    );
};

export default Skeleton;
