import Link from "next/link";
import { Card } from "@/shared/components/card/Card";
import FindPwForm from "@/features/auth/components/findpwForm";

const findpw = () => {
    return (
        <Card className="card">
            <Link href="/auth/signin" className="link-back"><span>로그인 페이지로 돌아가기</span></Link>
            <h2 className="form-title">비밀번호 찾기</h2>
            <FindPwForm />
        </Card>
    )
}

export default findpw