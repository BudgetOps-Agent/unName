import styles from './userprofile.module.css';
import Button from '@/shared/components/button/Button';

const UserProfile = () => {
    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <div>
                    <p className={styles.name}>김민준</p>
                    <span className={styles.role}>관리자</span>
                </div>
            </div>

            <div className={styles.userInfo}>
                <div className={styles.infoBox}>
                    <span>이메일</span>
                    <p>minjun.kim@hyu.ac.kr</p>
                </div>
                <div className={styles.infoBox}>
                    <span>전화번호</span>
                    <p>010-1234-5678</p>
                </div>
                <div className={styles.infoBox}>
                    <span>가입일</span>
                    <p>2024-09-01</p>
                </div>
            </div>

            <Button className={styles.modifyBtn} style="secondary" text="프로필 수정" />
        </div>
    )
}

export default UserProfile