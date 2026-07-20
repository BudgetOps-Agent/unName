import { useState, SubmitEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSignIn } from "../hooks/useSignin";
import { useAuthStore } from "@/store/authStore";
import Input from "@/shared/components/input/Input";
import Button from "@/shared/components/button/Button";
import {
    validateEmailFormat,
    validatePasswordFormat
} from "../utils/signupValidator";
import { ResponseSignin } from "@/types/auth";

const SigninForm = () => {

    const { executeSignin } = useSignIn();

    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (!validateEmailFormat(email)) {
            alert("유효한 이메일 형식이 아닙니다.");
            return;
        }

        if (!validatePasswordFormat(password)) {
            alert("비밀번호는 최소 8자 이상이어야 하며, 문자와 숫자를 포함해야 합니다.");
            return;
        }

        const signInData = {
            email,
            password
        };

        const result = await executeSignin(signInData);

        if (result.success) {
            alert(`${result.user?.name}님, 반갑습니다.`);

            login(result as ResponseSignin); 

            router.push('/');
            return;
        }

        alert(result.message || "네트워크 연결이 불안정합니다. 인터넷 상태를 확인해 주세요.");
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input id="email" label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <Input id="password" label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <div className="links">
                <Link href="/auth/findId" className="link">
                    <span>아이디 찾기</span>
                </Link>
                <Link href="/auth/findPw" className="link">
                    <span>비밀번호 찾기</span>
                </Link>
            </div>
            <div className="buttons">
                <Button type="submit" text="로그인" size="lg"/>
                <Button href="/auth/signup" text="회원가입" size="lg" style="secondary"/>
            </div>
        </form>
    )
}

export default SigninForm