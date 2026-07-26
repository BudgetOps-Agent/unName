import Link from "next/link"
import styles from "./ContentTitle.module.css"
import Button from "../button/Button";

interface TitleProps {
    title: string;
    subTitle?: string;
    btnText?: string;
    href?: string;
    onClick?: () => void;
    children?: React.ReactNode;
}

const ContentTitle = ({ title, subTitle, btnText, href, onClick, children }: TitleProps) => {
    return (
        <div className={styles.teamsHeader}>
            <div className={styles.headerLeft}>
                <p className={styles.title}>{title}</p>
                {subTitle && (
                    <p className={styles.subTitle}>{subTitle}</p>
                )}
                
            </div>
            
            {href && (
                <Link className={styles.linkBtn} href={href}>+ {btnText}</Link>
            )}


            {onClick && (
                <Button
                    className={styles.linkBtn}
                    text={`+ ${btnText}`}
                    style="tertiary"
                    onClick={onClick}
                />
            )}

            {children && (
                <div className={styles.headerRight}>
                    {children}
                </div>
            )}
        </div>
  )
}
export default ContentTitle