import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
/* import logoSvg from "@/public/sidebar/logo.svg";
import dashboardSvg from "@/public/sidebar/dashboard.svg";
import dashboardActiveSvg from "@/public/sidebar/dashboard-active.svg";
import expensesSvg from "@/public/sidebar/expenses.svg";
import expensesActiveSvg from "@/public/sidebar/expenses-active.svg";
import budgetSvg from "@/public/sidebar/budget.svg";
import budgetActiveSvg from "@/public/sidebar/budget-active.svg";
import memberSvg from "@/public/sidebar/member.svg";
import memberActiveSvg from "@/public/sidebar/member-active.svg";
import reportSvg from "@/public/sidebar/report.svg";
import reportActiveSvg from "@/public/sidebar/report-active.svg";
import toggleIcon from "@/public/sidebar/sidebar-toggle.svg"; */

const menus = [
    {
        text: "대시보드",
        path: "/dashboard",
        icon: "/sidebar/dashboard.svg",
        activeIcon: "/sidebar/dashboard-active.svg",
    },
    {
        text: "지출 내역",
        path: "/expenses",
        icon: "/sidebar/expenses.svg",
        activeIcon: "/sidebar/expenses-active.svg",
    },
    {
        text: "예산 관리",
        path: "/budget",
        icon: "/sidebar/budget.svg",
        activeIcon: "/sidebar/budget-active.svg",
    },
    {
        text: "멤버",
        path: "/member",
        icon: "/sidebar/member.svg",
        activeIcon: "/sidebar/member-active.svg",
    },
    {
        text: "정산 리포트",
        path: "/report",
        icon: "/sidebar/report.svg",
        activeIcon: "/sidebar/report-active.svg",
    },
];

export default function Sidebar({}) {

    const [isOpen, setIsOpen] = useState(true);
    const [showText, setShowText] = useState(true);

    const pathname = usePathname();

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
                    <img src="/sidebar/logo.svg" alt="logo" />
                    {showText && <span>BudgetOps</span>}
                </Link>
            </div>

            <nav className="menu-section">
                {menus.map((menu) => (
                    <Link
                        key={menu.path}
                        href={menu.path}
                        className={`menu ${pathname === menu.path ? "active" : ""} ${isOpen ? "" : "closed"}`}
                    >
                        <span>
                            <img src={
                                pathname === menu.path 
                                ? menu.activeIcon 
                                : menu.icon} 
                                alt="" 
                            />
                        </span>
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
            </button>
        </aside>
    )
}