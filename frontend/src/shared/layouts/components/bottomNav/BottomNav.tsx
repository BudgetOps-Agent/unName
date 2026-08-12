import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { getSidebarMenus } from "../sidebar/menus";
import useMyTeamRole from "@/features/teams/hooks/useMyTeamRole";

// 모바일 전용 하단 탭바. 사이드바와 같은 메뉴 목록(getSidebarMenus)을 쓰므로
// 역할별 노출 규칙도 자동으로 같이 적용된다.
// 보이고 숨기는 건 CSS 미디어 쿼리가 맡음 — JS로 하면 초기 렌더에서 깜빡임이 생김
export default function BottomNav() {

    const router = useRouter();
    const { teamId, from } = router.query;
    const effectiveTeamId = teamId ?? from;
    const validTeamId = Array.isArray(effectiveTeamId) ? effectiveTeamId[0] : effectiveTeamId;

    const { role } = useMyTeamRole(validTeamId);
    const menus = getSidebarMenus(effectiveTeamId, role);

    const pathname = router.asPath;

    if (menus.length === 0) {
        return null;
    }

    return (
        <nav className="bottom-nav">
            {menus.map((menu) => {
                const isActive = pathname.includes(menu.path);

                return (
                    <Link
                        key={menu.path}
                        href={menu.path}
                        className={`bottom-nav-item ${isActive ? "active" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <Image
                            src={isActive ? menu.activeIcon : menu.icon}
                            alt=""
                            width={20}
                            height={20}
                        />
                        <span>{menu.mobileText}</span>
                    </Link>
                );
            })}
        </nav>
    );
}