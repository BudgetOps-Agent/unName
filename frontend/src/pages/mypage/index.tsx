import Link from "next/link";
import styles from "./mypage.module.css";
import { Card } from "@/shared/components/card/Card";
import UserProfile from "@/shared/components/userProfile/UserProfile";
import GroupList from "@/shared/components/groupList/GroupList";
import { logout } from "../auth/api/authApi";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/router";
import Image from "next/image";

const Mypage = () => {

    const router = useRouter();
    const { from } = router.query;
    const clearAuth = useAuthStore((state) => state.logout);

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
            <Card className={styles.profileCard}>
                <UserProfile />
            </Card>

            <Card className={styles.grouplistCard} noPadding={true}>
                <GroupList />
            </Card>

            <button type="button" onClick={handleLogout} className={styles.logout}>
                <Image src="/logout-red.svg" alt="로그아웃" width={16} height={16} />
                <p>로그아웃</p>
            </button>
        </>
    )
}

export default Mypage