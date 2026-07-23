import styles from './userprofile.module.css';
import Button from '@/shared/components/button/Button';
import Skeleton from '@/shared/components/skeleton/Skeleton';
import { Badge } from '@/shared/components/badge/Badge';

interface UserInfo {
    name: string;
    role: "ADMIN" | "USER";
    email: string;
    phone: string;
    createdAt: string;
}

interface UserProfileProps {
    user?: UserInfo;
    isLoading?: boolean;
}

const ROLE_LABEL: Record<UserInfo['role'], string> = {
    ADMIN: "관리자",
    USER: "멤버",
}

const ROLE_BADGE_STYLE: Record<UserInfo['role'], 'blue' | 'gray'> = {
    ADMIN: "blue",
    USER: "gray",
}

const formatData = (isoString: string) => {
    if(!isoString) return "";
    return isoString.slice(0, 10);
}

const formatPhone = (phone: string) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    if (digits.length === 11) return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    return phone;
}

const UserProfile = ({ user, isLoading = false }: UserProfileProps) => {
    if (isLoading || !user) {
        return (
            <div className={styles.profileContainer}>
                <div className={styles.profileHeader}>
                    <div>
                        <Skeleton width={100} height={20} delay={0} />
                        <Skeleton width={48} height={20} radius={16} delay={0.1} />
                    </div>
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.infoBox}>
                        <Skeleton width={60} height={14} delay={0.2} />
                        <Skeleton width={140} height={14} delay={0.25} />
                    </div>
                    <div className={styles.infoBox}>
                        <Skeleton width={60} height={14} delay={0.3} />
                        <Skeleton width={140} height={14} delay={0.35} />
                    </div>
                    <div className={styles.infoBox}>
                        <Skeleton width={60} height={14} delay={0.4} />
                        <Skeleton width={140} height={14} delay={0.45} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <div>
                    <p className={styles.name}>{user.name}</p>
                    <Badge text={ROLE_LABEL[user.role]} style={ROLE_BADGE_STYLE[user.role]} />
                </div>
            </div>

            <div className={styles.userInfo}>
                <div className={styles.infoBox}>
                    <span>이메일</span>
                    <p>{user.email}</p>
                </div>
                <div className={styles.infoBox}>
                    <span>전화번호</span>
                    <p>{formatPhone(user.phone)}</p>
                </div>
                <div className={styles.infoBox}>
                    <span>가입일</span>
                    <p>{formatData(user.createdAt)}</p>
                </div>
            </div>

            {/* <Button className={styles.modifyBtn} style="secondary" text="프로필 수정" /> */}
        </div>
    )
}

export default UserProfile
