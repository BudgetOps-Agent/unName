import Link from "next/link";
import styles from "./mypage.module.css";
import { Card } from "@/shared/components/card/Card";
import Button from "@/shared/components/button/Button";
import UserProfile from "@/shared/components/userProfile/UserProfile";
import GroupList from "@/shared/components/groupList/GroupList";
import { logout } from "../auth/api/authApi";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/router";
import { useMyPage } from "./useMyPage";
import Image from "next/image";

const Mypage = () => {

    const router = useRouter();
    const { from } = router.query;
    const clearAuth = useAuthStore((state) => state.logout);

    const { user, teams, isLoading, error, refetch } = useMyPage();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("로그아웃 요청 실패: ", error);
        } finally {
            clearAuth();
            router.push('/auth/signin');
        }
    
    }
    return (
        <>
            <Link href={from ? `/teams/${from}/dashboard` : "/teams"} className="link-back"><span>대시보드</span></Link>
            {error ? (
                <Card className={styles.errorCard}>
                    <div className={styles.errorContainer}>
                        <p className={styles.errorTextTitle}>⚠️ 마이페이지 정보를 불러오지 못했습니다</p>
                        <p className={styles.errorTextSub}>{error}</p>
                        <Button className={styles.errorBtn} text="다시 시도" onClick={() => refetch()} style="tertiary" />
                    </div>
                </Card>
            ) : (
                <>
                    <Card className={styles.profileCard}>
                        <UserProfile user={user ?? undefined} isLoading={isLoading} />
                    </Card>

                    <Card className={styles.grouplistCard} noPadding={true}>
                        <GroupList groups={teams} />
                    </Card>
                </>
            )}

            <button type="button" onClick={handleLogout} className={styles.logout}>
                <Image src="/logout-red.svg" alt="로그아웃" width={16} height={16} />
                <p>로그아웃</p>
            </button>
        </>
    )
}

export default Mypage