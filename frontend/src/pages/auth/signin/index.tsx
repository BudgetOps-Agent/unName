import Link from "next/link";
import { Card } from "@/shared/components/card/Card";
import "./signin.module.css";
import SigninForm from "../components/signinForm";

const Signin = () => {

    return (
        <Card>
            <h2 className="form-title">로그인</h2>
            <SigninForm />
        </Card>
    )
}

export default Signin