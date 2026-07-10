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
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        
        const number = e.target.value.replace(/\D/g, "");
        let value = "";
        if (number.length <= 3) {
            value = number;
        } else if (number.length <= 7) {
            value = number.replace(/(\d{3})(\d+)/, "$1-$2");
        } else {
            value = number.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
        }

        setPhone(value);
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("이름을 입력해주세요.");
            return;
        }
        
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

        alert(result.message || "네트워크 연결이 불안정합니다. 인터넷 상태를 확인해 주세요.");
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input id="name" label="이름" type="text" value={name} onChange={(e) => setName(e.target.value)} required/>
            <Input id="phone" label="전화번호" type="tel" value={phone} onChange={handleChange} required/>
            <div className="buttons">
                <Button type="submit" text="아이디 찾기" size="lg"/>
            </div>
        </form>
    )
}

export default FindIdForm