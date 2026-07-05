import Link from "next/link";
import Dropdown from "@/shared/components/dropdown/Dropdown";
// import { responseSignin } from "@/types/auth";

// interface HeaderProps {
//     isLoggedIn: boolean;
//     user: responseSignin | null;
// }

const grouplist = [
    {
        id: 1,
        name: "GDSC 한양대학교",
        member: 24,
    },
    {
        id: 2,
        name: "스타트업 스터디",
        member: 8,
    },
]

const noticelist = [
    {
        "id": 1,
        "type": "request",
        "status": "pending",
        "title": "해커톤 참가비 승인 요청",
        "content": "이서연님이 방금 요청했어요",
        "time": "10분 전",
        "hasButton": true
    },
    {
        "id": 2,
        "type": "request",
        "status": "pending",
        "title": "외부 강사 강연료 승인 요청",
        "content": "박지호님이 요청했어요 — 위험도 높음",
        "time": "1시간 전",
        "hasButton": true
    },
    {
        "id": 3,
        "type": "notice",
        "status": "approved",
        "title": "노션 팀 플랜 승인됐어요",
        "content": "이서연 총무님이 승인했어요",
        "time": "3시간 전",
        "hasButton": false
    },
    {
        "id": 4,
        "type": "request",
        "status": "pending",
        "title": "포스터 인쇄비 승인 요청",
        "content": "정다은님이 요청했어요",
        "time": "5일 전",
        "hasButton": true
    }
]

export default function Header({}) {

    const pendingCount = noticelist.filter((item) => item.status === 'pending').length;
    
    return (
        <div className="header-container">
            <div className="header-left">
                <Dropdown
                    text="GDSC 한양대학교"
                    className="grouplist"
                    iconOnly={false}
                    iconLeft={<img src="/header/container.svg" alt="container" />}
                    iconRight={<img src="/header/vector.svg" alt="vector" />}
                    items={grouplist}
                    renderItem={(item, index) => (
                        <Link 
                            key={index}
                            href={`teams/${item.id}/dashboard`}
                            className="grouplist-item"
                        >
                            <span className="grouplist-item icon">{item.name[0]}</span>
                            <div className="grouplist-item-info">
                                <span className="grouplist-item-name">{item.name}</span>
                                <span className="grouplist-item-member">멤버 {item.member}명</span>
                            </div>
                        </Link>

                    )}
                    footerContent={
                        <Link
                            href="/teams/new"
                            className="grouplist-footer"
                        >
                            <span className="grouplist-footer icon">+</span>
                            <span className="grouplist-footer-text">새 모임 만들기</span>
                        </Link>
                    }
                />
            </div>
            <div className="header-right">
                <Dropdown
                    text="알림"
                    className="notice"
                    iconOnly={true}
                    iconLeft={<img src="/header/notice.svg" alt="notice" />}
                    headerContent={
                        <div className="notice-header">
                            <span className="title">알림</span>
                            <span className="badge">{pendingCount}건 대기</span>
                        </div>
                    }
                    items={noticelist}
                    renderItem={(item, index) => (
                        <div className={`notice-item ${item.status === 'pending' ? 'pending' : ''}`}>
                            {item.type === 'request' 
                            ? <span className="notice-item-icon request"><img className="request" src="/header/notice-yellow.svg" alt="request" /></span>
                            : <span className="notice-item-icon approved"><img className="approved" src="/header/check-green.svg" alt="approved" /></span>}

                            <div className="notice-item-info">
                                <span className="notice-item-title">{item.title}</span>
                                <span className="notice-item-content">{item.content}</span>
                                <span className="notice-item-time">{item.time}</span>
                            </div>

                            {item.status === 'pending' && <Link key={index} href={`/teams/1/expenses/${item.id}`} className="btn-primary btn-sm">검토하기</Link>}
                        </div>
                    )}
                />

                <Dropdown
                    text={<span><strong>김민준</strong> <span>관리자</span></span>}
                    className="user"
                    iconOnly={false}
                    iconLeft={
                        <span>김</span>
                    }
                    headerContent={
                        <div className="user-info">
                            <span className="user-info-name">김민준</span>
                            <span className="user-info-role">관리자</span>
                        </div>
                    }
                    items={[
                        {
                            menu: "마이페이지",
                            classname: "mypage",
                            href: "/mypage",
                            icon: "/header/mypage.svg",
                        },
                        {
                            menu: "로그아웃",
                            classname: "logout",
                            href: "/login",
                            icon: "/header/logout.svg",
                        }
                    ]}
                    renderItem={(item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`user-menu ${item.classname}`}
                        >
                            <span className="user-menu-icon">
                                <img src={item.icon} alt={item.menu} />
                            </span>
                            <span className="user-menu-text">{item.menu}</span>
                        </Link>
                    )}
                />
            </div>
        </div>
    )
}