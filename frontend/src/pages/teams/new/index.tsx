import Link from "next/link";
import styles from './createteam.module.css';
import { Card } from "@/shared/components/card/Card";
import ContentTitle from '@/shared/components/contentTitle/ContentTitle';
import CreateTeamForm from "@/features/teams/components/CreateTeamForm/CreateTeamForm";

const CreateTeam = () => {
    return (
        <>
            <div className={styles.formTitleSection}>
                <Link href="/teams" className={`link-back ${styles.backLink}`}><span>내 모임으로 돌아가기</span></Link>
                <ContentTitle title="새 모임 만들기" subTitle="모임을 만들면 관리자가 돼요"/>
            </div>

            <Card className={styles.formCard}>
                <CreateTeamForm />
            </Card>
        </>
    )
}

export default CreateTeam