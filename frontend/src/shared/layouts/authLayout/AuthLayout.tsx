import Image from "next/image";
type Props = {
  children: React.ReactNode;
  showLogo?: boolean;
};

export default function AuthLayout({ children, showLogo = true, }: Props) {
  return (
    <div className="auth-layout">
      {showLogo && 
        <div className="logo">
            <Image src="/globe.svg" alt="Budget Ops Logo" width={56} height={56} />
            <h1 className="logo-title">BudgetOps</h1>
            <p className="logo-desc">팀 예산을 더 스마트하게</p>
        </div>
      }
      <main>{children}</main>
    </div>
  );
}