import Button from "@/shared/components/button/Button";
import logoSvg from "@/assets/logo.svg";
import dashboardSvg from "@/assets/dashboard.svg";
import spendingSvg from "@/assets/spending.svg";
import budgetSvg from "@/assets/budget.svg";
import memberSvg from "@/assets/member.svg";
import reportSvg from "@/assets/report.svg";

export default function Sidebar({}) {
    return (
        <div className="sidebar-container">
            <div className="logo-section">
                <Button 
                    text="BudgetOps"
                    className="logo-btn"
                    iconOnly={false}
                    iconLeft={<img src={logoSvg.src} alt="logo" />}
                    onClick={() => console.log("대시보드 페이지로 이동")}
                />
            </div>
            <div className="menu-section">
                <Button 
                    text="대시보드"
                    className="menu dashboard-btn"
                    iconOnly={false}
                    iconLeft={<img src={dashboardSvg.src} alt="dashboard" />}
                    onClick={() => console.log("대시보드 페이지로 이동")}
                />
                <Button 
                    text="지출 내역"
                    className="menu spending-btn"
                    iconOnly={false}
                    iconLeft={<img src={spendingSvg.src} alt="spending" />}
                    onClick={() => console.log("지출 내역 페이지로 이동")}
                />
                <Button 
                    text="예산 관리"
                    className="menu budget-btn"
                    iconOnly={false}
                    iconLeft={<img src={budgetSvg.src} alt="budget" />}
                    onClick={() => console.log("예산 관리 페이지로 이동")}
                />
                <Button 
                    text="멤버"
                    className="menu member-btn"
                    iconOnly={false}
                    iconLeft={<img src={memberSvg.src} alt="member" />}
                    onClick={() => console.log("멤버 페이지로 이동")}
                />
                <Button 
                    text="정산 리포트"
                    className="menu report-btn"
                    iconOnly={false}
                    iconLeft={<img src={reportSvg.src} alt="report" />}
                    onClick={() => console.log("정산 리포트 페이지로 이동")}
                />
            </div>
        </div>
    )
}