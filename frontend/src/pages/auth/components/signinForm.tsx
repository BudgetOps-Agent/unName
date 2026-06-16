import { useState, SubmitEvent } from "react";
import Input from "@/shared/components/input/Input";
import Button from "@/shared/components/button/Button";
import {
    validateEmailFormat,
    validatePasswordFormat
} from "../utils/signupValidator";

const SigninForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();

        if (!validateEmailFormat(email)) {
            alert("유효한 이메일 형식이 아닙니다.");
            return;
        }

        if (!validatePasswordFormat(password)) {
            alert("비밀번호는 최소 8자 이상이어야 하며, 문자와 숫자를 포함해야 합니다.");
            return;
        }

        console.log(email, password);
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input id="email" label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/> <br/>
            <Input id="password" label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/> <br/>
            <Button type="submit" text="로그인" />
        </form>
    )
}

export default SigninForm