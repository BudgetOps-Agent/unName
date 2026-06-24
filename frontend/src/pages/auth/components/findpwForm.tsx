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
    const { executeVerify, executeResetPassword } = useFindPw();

    const [isUserVerified, setIsUserVerified] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
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

        switch (verifyResult.status) {
            case 400:
                alert("요청 형식이 올바르지 않습니다.");
                break;
            case 404:
                alert("일치하는 회원 정보가 없습니다. 입력하신 정보를 다시 확인해 주세요.");
                break;
            case 500:
                alert("서버가 일시적으로 원활하지 않습니다. 잠시 후 다시 시도해 주세요.");
                break;
            default:
                alert("네트워크 연결이 불안정합니다. 인터넷 상태를 확인해 주세요.");
                break;
        }
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
            newPassword
        };

        const resetPasswordResult = await executeResetPassword(resetPasswordData);

        if (resetPasswordResult.success) {
            alert("비밀번호 변경이 완료되었습니다. 로그인 페이지로 이동합니다.");
            return;
        }

        switch (resetPasswordResult.status) {
            case 400:
                alert("이전에 사용하던 비밀번호와 동일합니다. 새로운 비밀번호를 입력해 주세요.");
                break;
            case 401:
                alert("인증 정보가 올바르지 않거나 만료되었습니다. 처음부터 다시 시도해 주세요.");
                setIsUserVerified(false); 
                break;
            case 500:
                alert("서버 오류로 인해 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
                break;
            default:
                alert("네트워크 연결이 원활하지 않습니다.");
                break;
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
                    <Input id="newPassword" label="비밀번호" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/>
                    <Input id="confirmPassword" label="비밀번호 확인" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/> <br/>
                    <Button type="submit" text="비밀번호 변경하기" />
                </form>
            )}
        </div>
    )
}

export default FindPwForm