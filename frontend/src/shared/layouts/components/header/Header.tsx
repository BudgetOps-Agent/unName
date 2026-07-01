import Button from "@/shared/components/button/Button";
import containerSvg from "@/assets/container.svg";
import vertorSvg from "@/assets/vector.svg";
import noticeSvg from "@/assets/notice.svg";
import { responseSignin } from "@/types/auth";

interface HeaderProps {
    isLoggedIn: boolean;
    user: responseSignin | null;
}
export default function Header({}) {
    return (
        <div className="header-container">
            <div className="header-left">
                <Button
                    text="GDSC 한양대학교"
                    className="group-list" 
                    iconOnly={false}
                    iconLeft={<img src={containerSvg.src} alt="container" />}
                    iconRight={<img src={vertorSvg.src} alt="vertor" />}
                    onClick={() => console.log('클릭')}
                />
            </div>
            <div className="header-right">
                <Button 
                    className="notice-icon"
                    iconOnly={true}
                    iconLeft={<img src={noticeSvg.src} alt="notice" />}
                    onClick={() => console.log('클릭')}
                />
                <Button 
                    text={<span><strong>김민준</strong> <span>관리자</span></span>}
                    className="user-info"
                    iconOnly={false}
                    iconLeft={
                        <span style={{
                            display: 'inline-block',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50px',
                            backgroundColor: 'blue',
                            verticalAlign: 'middle'
                        }} />
                    }
                />
            </div>
        </div>
    )
}