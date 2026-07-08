import Link from 'next/link';
import styles from './grouplist.module.css';


const groups = [
    {
        id: 1,
        name: "GDSC 한양대학교",
        member: 24,
        role: "관리자"
    },
    {
        id: 2,
        name: "스타트업 스터디",
        member: 8,
        role: "멤버"
    },
]

const GroupList = () => {
    return (
        <div className={styles.grouplistContainer}>
            <div className={styles.grouplistHeader}>
                <span>내 모임</span>
            </div>

            <div className={styles.grouplistItems}>
                {groups.map((group) => (
                    <Link
                        href={`/teams/${group.id}/dashboard`}
                        className={styles.itemBox}
                        key={group.id}
                    >
                        <div className={styles.boxLeft}>
                            <span className={styles.logo}>{group.name[0]}</span>

                            <div className={styles.groupInfo}>
                                <p className={styles.groupName}>{group.name}</p>
                                <p className={styles.memberCount}>멤버 {group.member}명</p>
                            </div>
                        </div>

                        <div className={styles.boxRight}>
                            <span className={`${styles.roleBadge} ${group.role === '관리자' ? styles.manager : ''}`}>
                                {group.role}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default GroupList