import Link from "next/link";
import { useRouter } from 'next/router';
import { useState } from "react";
import Image from "next/image";
import { getSidebarMenus } from "./menus";


export default function Sidebar({}) {

    const router = useRouter();
    const { teamId } = router.query;

    const menus = getSidebarMenus(teamId);

    const [isOpen, setIsOpen] = useState(true);
    const [showText, setShowText] = useState(true);

    const pathname = router.asPath;

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

    return (
        <aside className={`sidebar-container ${isOpen ? "" : "closed"}`}>
            <div className="logo-section">
                <Link href="/dashboard" className="logo-btn">
                    <Image src="/sidebar/logo.svg" alt="logo" width={32} height={32}/>
                    <span className={`${showText ? "" : "blind"}`}>BudgetOps</span>
                </Link>
            </div>

            <nav className="menu-section">
                {menus.map((menu) => (
                    <Link
                        key={menu.path}
                        href={menu.path}
                        className={`menu ${pathname === menu.path ? "active" : ""} ${isOpen ? "" : "closed"}`}
                    >
                        <Image src={pathname === menu.path ? menu.activeIcon : menu.icon} alt={`${menu} 로고 아이콘`} width={18} height={18}/>
                        {showText && <span>{menu.text}</span>}
                    </Link>
                ))}
            </nav>

            <button 
                className={`sidebar-toggle`}
                onClick={toggleSidebar}
            >
                <img
                    src="/sidebar/sidebar-toggle.svg"
                    alt="sidebar-open" 
                    className={`${isOpen ? "" : "rotate"}`}
                />
                <span className="blind">{`${isOpen ? "닫기" : "열기"}`}</span>
            </button>
        </aside>
    )
}