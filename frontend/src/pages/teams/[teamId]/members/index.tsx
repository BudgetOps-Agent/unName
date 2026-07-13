import styles from "./members.module.css";
import Button from "@/shared/components/button/Button";
import { Card } from "@/shared/components/card/Card";
import { Badge } from "@/shared/components/badge/Badge";
import MemberList from "../../components/MemberList/MemberList";

const memberlist = [
    {
        id: 1,
        name: "김민준",
        role: "관리자",
        email: "minjun.kim@hyu.ac.kr"
    },
    {
        id: 2,
        name: "이서연",
        role: "총무",
        email: "seoyeon.lee@hyu.ac.kr"
    },
    {
        id: 3,
        name: "박지호",
        role: "멤버",
        email: "jiho.park@hyu.ac.kr"
    },
    {
        id: 4,
        name: "최수아",
        role: "멤버",
        email: "sua.choi@hyu.ac.kr"
    },
    {
        id: 5,
        name: "정다은",
        role: "멤버",
        email: "daeun.jung@hyu.ac.kr"
    },
]

const rolelist = [
    {
        id: 1,
        role: '관리자',
        content: '예산 관리, 멤버 초대ㆍ강퇴, 모든 지출 승인ㆍ반려, 관리자 권한 위임, 정산 리포트 조회, 모든 지출 내역 조회, 회칙 변경'
    },
    {
        id: 2,
        role: '총무',
        content: '지출 승인ㆍ반려, 예산 항목 관리, 정산 리포트 조회'
    },
    {
        id: 1,
        role: '멤버',
        content: '지출 요청, 내 지출 내역 조회'
    },
]

const members = () => {
    return (
        <div className={styles.membersContainer}>
            <div className={styles.membersHeader}>
                <div className={styles.headerLeft}>
                    <p className={styles.title}>멤버</p>
                    <p className={styles.subTitle}>총 {memberlist.length}명이에요</p>
                </div>

                <Button className={styles.inviteBtn} text="+ 초대하기" style="tertiary" />
            </div>

            <Card className={styles.membersCard} noPadding={true}>
                <MemberList members={memberlist} />
            </Card>

            <Card className={styles.roleGuide}>
                <span className={styles.guideTitle}>역할 안내</span>

                <div className={styles.guideContent}>
                    {rolelist.map((role) => (
                        <div className={styles.roleItem} key={role.id}>
                            <Badge 
                                text={role.role} 
                                style={
                                    role.role === '관리자' ? 'blue'
                                    : role.role === '총무' ? 'purple'
                                    : 'gray'
                                }
                            />
                            <p className={styles.roleContent}>{role.content}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

export default members