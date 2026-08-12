import Link from "next/link";
import { Card } from "@/shared/components/card/Card";
import "./Signup.module.css";
import SignupForm from "@/features/auth/components/signupForm";

const Signup = () => {
    return (
        <Card className="card">
            <Link href="/auth/signin" className="link-back"><span>로그인 페이지로 돌아가기</span></Link>
            <h2 className="form-title">회원가입</h2>
            <SignupForm />
        </Card>
    )
}

export default Signup