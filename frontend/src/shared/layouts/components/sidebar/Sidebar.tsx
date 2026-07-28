import Link from "next/link";
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import Image from "next/image";
import { getSidebarMenus } from "./menus";
import useMediaQuery from "@/shared/hook/useMediaQuery";


export default function Sidebar({}) {

    const router = useRouter();
    const { teamId, from } = router.query;
    const effectiveTeamId = teamId ?? from;

    const menus = getSidebarMenus(effectiveTeamId);

    const [isOpen, setIsOpen] = useState(false);
    const [showText, setShowText] = useState(false);

    const pathname = router.asPath;

    const isMobile = useMediaQuery("(max-width: 768px)");
    const toggleSidebar = () => {

        if (isOpen) {
            setShowText(false);
            setIsOpen(false);
        }

        else {
            setIsOpen(true);

            setTimeout(() => {
                setShowText(true);
            }, 150);
        }
    };

    const handleMenuClick = () => {
        if (isMobile) {
            setTimeout(() => {
                setIsOpen(false);
                setShowText(false);
            }, 200);
        }
    };

    return (
        <aside className={`sidebar-container ${isOpen ? "" : "closed"}`} aria-hidden={isMobile ? !isOpen : undefined}>
            <div className="logo-section">
                <Link href="/teams" className="logo-btn">
                    <Image src="/sidebar/logo.svg" alt="logo" width={32} height={32}/>
                    <span className={`${showText ? "" : "blind"}`}>BudgetOps</span>
                </Link>
            </div>

            <nav className="menu-section">
                {menus.map((menu) => (
                    <Link
                        key={menu.path}
                        href={menu.path}
                        className={`menu ${pathname.includes(menu.path) ? "active" : ""} ${isOpen ? "" : "closed"}`}
                        onClick={handleMenuClick}
                    >
                        <Image src={pathname.includes(menu.path) ? menu.activeIcon : menu.icon} alt={`${menu} 로고 아이콘`} width={18} height={18}/>
                        {showText && <span>{menu.text}</span>}
                    </Link>
                ))}
            </nav>

            <button 
                className={`sidebar-toggle`}
                onClick={toggleSidebar}
                aria-expanded={isOpen}
                aria-controls="mobile-sidebar"
            >
                <Image
                    src="/sidebar/sidebar-toggle.svg"
                    alt="sidebar-open" 
                    className={`${isOpen ? "" : "rotate"}`}
                    width={10}
                    height={15}
                />
                <span className="blind">{`${isOpen ? "닫기" : "열기"}`}</span>
            </button>
        </aside>
    )
}