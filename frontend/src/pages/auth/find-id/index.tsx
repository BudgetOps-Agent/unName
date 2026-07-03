import { Card } from "@/shared/components/card/Card";
import FindIdForm from "../components/findidForm";
import "../signin/signin.module.css";
import Link from "next/link";

const Findid = () => {
    return (
        <Card>
            <Link href="/auth/signin" className="link-back"><span>로그인 페이지로 돌아가기</span></Link>
            <h2 className="form-title">아이디 찾기</h2>
            <FindIdForm />
        </Card>
    )
}

export default Findid