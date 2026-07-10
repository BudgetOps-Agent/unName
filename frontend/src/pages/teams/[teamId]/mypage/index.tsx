import Link from "next/link";
import styles from "./mypage.module.css";
import { Card } from "@/shared/components/card/Card";
import UserProfile from "../../components/UserProfile/UserProfile";
import GroupList from "../../components/GroupList/GroupList";

const NewTeam = () => {
    return (
        <>
            <Link href="/teams/[teamId]/dashboard" className="link-back"><span>대시보드</span></Link>
            <Card className={styles.profileCard}>
                <UserProfile />
            </Card>

            <Card className={styles.grouplistCard} noPadding={true}>
                <GroupList />
            </Card>

            <Link href="/auth/signin" className={styles.logout}>
                <img src="/logout-red.svg" alt="로그아웃" />
                <p>로그아웃</p>
            </Link>
        </>
    )
}

export default NewTeam