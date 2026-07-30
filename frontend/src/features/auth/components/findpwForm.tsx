import { useState, SubmitEvent, useRef } from "react";
import { useRouter } from "next/router";
import { useFindPw } from "../hooks/useFindpw";
import Input from "@/shared/components/input/Input";
import Button from "@/shared/components/button/Button";
import {
    validateEmailFormat,
    validatePasswordFormat,
    validatePassword
} from "../utils/signupValidator";

const FindPwForm = () => {
    const { executeVerify, executeResetPassword } = useFindPw();

    const [isUserVerified, setIsUserVerified] = useState(false);
    const [verifyToken, setVerifyToken] = useState(''); 

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const newPasswordRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

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
            setVerifyToken(verifyResult.verifyToken);
            setIsUserVerified(true);
            return;
        }

        alert(verifyResult.message || "네트워크 연결이 불안정합니다. 인터넷 상태를 확인해 주세요.");
    }

    const handleResetPasswordSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (!validatePasswordFormat(newPassword)) {
            alert("비밀번호는 최소 8자 이상이어야 하며, 문자와 숫자를 포함해야 합니다.");
            return;
        }

        if (!validatePassword(newPassword, confirmPassword)) {
            alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        const resetPasswordData = {
            email,
            newPassword,
            verifyToken
        };

        const resetPasswordResult = await executeResetPassword(resetPasswordData);

        if (resetPasswordResult.success) {
            alert("비밀번호 변경이 완료되었습니다. 로그인 페이지로 이동합니다.");
            router.push('/auth/signin');
            return;
        }

        if(resetPasswordResult.code === "SAME_PASSWORD") {
          alert(resetPasswordResult.message);
          setNewPassword('');
          newPasswordRef.current?.focus();
          setConfirmPassword('');
          return;
        } 
        
        if (resetPasswordResult.code !== "SAME_PASSWORD") {
            alert(resetPasswordResult.message || "네트워크 연결이 불안정합니다. 인터넷 상태를 확인해 주세요.");
            setIsUserVerified(false);
            setVerifyToken('');
            return;
        }

        alert(resetPasswordResult.message);
    }

    return (
        <div>
            {!isUserVerified ? (
                <form onSubmit={handleVerifySubmit}>
                    <Input id="name" label="이름" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input id="email" label='이메일' type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <div className="buttons">
                        <Button type="submit" text="비밀번호 찾기" size="lg"/>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleResetPasswordSubmit}>
                    <Input id="newPassword" label="비밀번호" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} ref={newPasswordRef}  required/>
                    <Input id="confirmPassword" label="비밀번호 확인" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
                    <div className="buttons">
                        <Button type="submit" text="비밀번호 변경하기" size="lg"/>
                    </div>
                </form>
            )}
        </div>
    )
}

export default FindPwForm