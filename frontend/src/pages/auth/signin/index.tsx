import { Card } from "@/shared/components/card/Card";
import SigninForm from "../components/signinForm";

const Signin = () => {

    return (
        <Card className="card">
            <h2 className="form-title">로그인</h2>
            <SigninForm />
        </Card>
    )
}

export default Signin