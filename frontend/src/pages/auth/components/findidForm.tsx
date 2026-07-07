import { useState, SubmitEvent } from "react";
import { useRouter } from "next/router";
import { useFindId } from "../hooks/useFindid";
import Input from "@/shared/components/input/Input";
import Button from "@/shared/components/button/Button";
import { validatePhoneFormat } from "../utils/signupValidator";

const FindIdForm = () => {

    const { executeFindid } = useFindId();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const router = useRouter();

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (!validatePhoneFormat(phone)) {
            alert("유효한 전화번호 형식이 아닙니다.");
            return;
        }

        const findIdData = {
            name,
            phone
        };

        const result = await executeFindid(findIdData);

        if (result.success) {
            alert(`${result.data?.email}`);
            router.push('/auth/signin');
            return;
        }

        switch (result.status) {
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

    return (
        <form onSubmit={handleSubmit}>
            <Input id="name" label="이름" type="text" value={name} onChange={(e) => setName(e.target.value)} required/>
            <Input id="phone" label="전화번호" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required/>
            <div className="buttons">
                <Button type="submit" text="아이디 찾기" size="lg"/>
            </div>
        </form>
    )
}

export default FindIdForm