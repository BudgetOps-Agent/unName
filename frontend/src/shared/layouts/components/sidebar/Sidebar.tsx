import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import logoSvg from "@/assets/logo.svg";
import dashboardSvg from "@/assets/sidebar/dashboard.svg";
import dashboardActiveSvg from "@/assets/sidebar/dashboard-active.svg";
import expensesSvg from "@/assets/sidebar/expenses.svg";
import expensesActiveSvg from "@/assets/sidebar/expenses-active.svg";
import budgetSvg from "@/assets/sidebar/budget.svg";
import budgetActiveSvg from "@/assets/sidebar/budget-active.svg";
import memberSvg from "@/assets/sidebar/member.svg";
import memberActiveSvg from "@/assets/sidebar/member-active.svg";
import reportSvg from "@/assets/sidebar/report.svg";
import reportActiveSvg from "@/assets/sidebar/report-active.svg";
import toggleIcon from "@/assets/sidebar/sidebar-toggle.svg";

const menus = [
    {
        text: "대시보드",
        path: "/dashboard",
        icon: dashboardSvg,
        activeIcon: dashboardActiveSvg,
    },
    {
        text: "지출 내역",
        path: "/expenses",
        icon: expensesSvg,
        activeIcon: expensesActiveSvg,
    },
    {
        text: "예산 관리",
        path: "/budget",
        icon: budgetSvg,
        activeIcon: budgetActiveSvg,
    },
    {
        text: "멤버",
        path: "/member",
        icon: memberSvg,
        activeIcon: memberActiveSvg,
    },
    {
        text: "정산 리포트",
        path: "/report",
        icon: reportSvg,
        activeIcon: reportActiveSvg,
    },
];

export default function Sidebar({}) {

    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

    const toggleSidebar = () => {
        setIsOpen(prev => !prev);
    }

    return (
        <aside className={`sidebar-container ${isOpen ? "" : "closed"}`}>
            <div className="logo-section">
                <Link href="/dashboard" className="logo-btn">
                    <img src={logoSvg.src} alt="logo" />
                    {isOpen && <span>BudgetOps</span>}
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
                                ? menu.activeIcon.src 
                                : menu.icon.src} 
                                alt="" 
                            />
                        </span>
                        {isOpen && <span>{menu.text}</span>}
                    </Link>
                ))}
            </nav>

            <button 
                className={`sidebar-toggle`}
                onClick={toggleSidebar}
            >
                <img
                    src={toggleIcon.src} 
                    alt="sidebar-open" 
                    className={`${isOpen ? "" : "rotate"}`}
                />
            </button>
        </aside>
    )
}