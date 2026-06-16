import { useState } from "react";
import Input from "@/shared/components/input/Input";
import Button from "@/shared/components/button/Button";

const SigninForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <form>
            <Input id="email" label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/> <br/>
            <Input id="password" label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/> <br/>
            <Button type="submit" text="로그인" />
        </form>
    )
}

export default SigninForm