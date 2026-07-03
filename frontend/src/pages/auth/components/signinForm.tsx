import { useState, SubmitEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSignIn } from "..//hooks/useSignin";
import { useAuthStore } from "@/store/authStore";
import Input from "@/shared/components/input/Input";
import Button from "@/shared/components/button/Button";
import {
    validateEmailFormat,
    validatePasswordFormat
} from "../utils/signupValidator";

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

            alert(`${result.data?.name}님, 반갑습니다.`);

            if (result.data) {
                login(result.data);
            }

            router.push('/');
            return;
        }

        switch (result.status) {
            case 400:
                alert("잘못된 요청입니다. 입력한 정보를 다시 확인해 주세요.");
                break;
            case 409: // 회원가입과 마찬가지로 추후 백엔드와 협의하여 커스텀 코드를 정의하는 것이 좋을 것 같습니다.
                alert("이미 다른 기기에서 로그인 중입니다.");
                break;
            case 500:
                alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                break;
            default:
                alert("네트워크 연결이 불안정합니다. 인터넷 상태를 확인해 주세요.");
                break;
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input id="email" label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <Input id="password" label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <div className="links">
                <Link href="/auth/find-id" className="link">
                    <span>아이디 찾기</span>
                </Link>
                <Link href="/auth/find-pw" className="link">
                    <span>비밀번호 찾기</span>
                </Link>
            </div>
            <div className="buttons">
                <Button type="submit" text="로그인" size="lg"/>
                <Button type="submit" text="회원가입" size="lg" style="secondary"/>
            </div>
        </form>
    )
}

export default SigninForm