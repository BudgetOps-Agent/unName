import { useState, SubmitEvent } from "react";
import { useFindPw } from "../hooks/useFindpw";
import Input from "@/shared/components/input/Input";
import Button from "@/shared/components/button/Button";
import {
    validateEmailFormat,
    validatePasswordFormat,
    validatePassword
} from "../utils/signupValidator";

const FindPwForm = () => {
    const { executeVerify } = useFindPw();

    const [isUserVerified, setIsUserVerified] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleVerifySubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (!validateEmailFormat(email)) {
            alert("유효한 이메일 형식이 아닙니다.");
            return;
        }

        const verifyUserData = {
            name,
            email
        };

        const verifyResult = await executeVerify(verifyUserData);

        if (verifyResult.success) {
            alert("유저 정보가 확인되었습니다. 새 비밀번호를 입력해주세요.");
            setIsUserVerified(true);
        }
    }

    const handleResetPasswordSubmit = (e: SubmitEvent) => {
        e.preventDefault();

        if (!validatePasswordFormat(password)) {
            alert("비밀번호는 최소 8자 이상이어야 하며, 문자와 숫자를 포함해야 합니다.");
            return;
        }

        if (!validatePassword(password, confirmPassword)) {
            alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            return;
        }
    }

    return (
        <div>
            {!isUserVerified ? (
                <form onSubmit={handleVerifySubmit}>
                    <Input id="name" label="이름" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input id="email" label='이메일' type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Button type="submit" text="비밀번호 찾기" />
                </form>
            ) : (
                <form onSubmit={handleResetPasswordSubmit}>
                    <Input id="password" label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    <Input id="confirmPassword" label="비밀번호 확인" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/> <br/>
                    <Button type="submit" text="비밀번호 변경하기" />
                </form>
            )}
        </div>
    )
}

export default FindPwForm