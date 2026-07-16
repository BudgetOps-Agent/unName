import styles from './memberskeleton.module.css';

const MemberSkeleton = () => {
    const dummyItems = [1, 2, 3];

    return (
        <div className={styles.listContainer}>
            {dummyItems.map((id) => (
                <div className={styles.memberItem} key={id}>
                    <div className={styles.itemLeft}>
                        <div className={styles.nameBox}>
                            <div className={styles.skeletonName} />
                            <div className={styles.skeletonBadge} />
                        </div>
                        <div className={styles.skeletonEmail} />
                    </div>

                    <div className={styles.itemRight}>
                        <div className={styles.skeletonButton} />
                        <div className={styles.skeletonButton} />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MemberSkeleton