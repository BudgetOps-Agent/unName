import Link from "next/link";
import { usePathname } from "next/navigation";
import logoSvg from "@/assets/logo.svg";
import dashboardSvg from "@/assets/dashboard.svg";
import dashboardActiveSvg from "@/assets/dashboard-active.svg";
import expensesSvg from "@/assets/expenses.svg";
import expensesActiveSvg from "@/assets/expenses-active.svg";
import budgetSvg from "@/assets/budget.svg";
import budgetActiveSvg from "@/assets/budget-active.svg";
import memberSvg from "@/assets/member.svg";
import memberActiveSvg from "@/assets/member-active.svg";
import reportSvg from "@/assets/report.svg";
import reportActiveSvg from "@/assets/report-active.svg";

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

    const pathname = usePathname();

    return (
        <aside className="sidebar-container">
            <div className="logo-section">
                <Link href="/dashboard" className="logo-btn">
                    <img src={logoSvg.src} alt="logo" />
                    <span>BudgetOps</span>
                </Link>
            </div>

            <nav className="menu-section">
                {menus.map((menu) => (
                    <Link
                        key={menu.path}
                        href={menu.path}
                        className={`menu ${pathname === menu.path ? "active" : ""}`}
                    >
                        <span>
                            <img src={pathname === menu.path ? menu.activeIcon.src : menu.icon.src} alt="" />
                        </span>
                        <span>{menu.text}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    )
}