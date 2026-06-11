import { useState, SubmitEvent } from "react";
import { useSignUp } from "..//hooks/useSignup";
import Input from "@/shared/components/input/Input";
import Button from "@/shared/components/button/Button";
import {
  validateEmailFormat,
  validatePasswordFormat,
  validatePassword,
  validatePhoneFormat,
  validateBirthDate
} from "../utils/signupValidator";

const SignupForm = () => {

  const { executeSignup } = useSignUp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

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

    if (!validatePassword(password, confirmPassword)) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (!validatePhoneFormat(phone)) {
      alert("유효한 전화번호 형식이 아닙니다.");
      return;
    }

    if (!validateBirthDate(birthDate)) {
      alert("유효한 생년월일을 입력해주세요.");
      return;
    }

    const signUpData = {
      name,
      email,
      password,
      phone,
      birthDate
    };

    const result = await executeSignup(signUpData);

    if (result.success) {
      alert(`${result.data?.name}님, 회원가입이 완료되었습니다.`);
      // Todo:회원가입 성공 후 로그인 페이지로 이동 구현
      return;
    }

    switch (result.status) {
      case 400:
        alert("잘못된 요청입니다. 입력한 정보를 다시 확인해 주세요.");
        break;
      case 409: // 어떤 데이터가 중복되는지 명확히 알려주는 것이 좋기 때문에 추후 백엔드와 협의하여 커스텀 코드를 정의하는 것이 좋을 것 같습니다.
        alert("이미 존재하는 사용자입니다.");
        break;
      case 500:
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        break;
      default:
        alert("네트워크 연결이 불안정합니다. 인터넷 상태를 확인해 주세요.")
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input id="name" label="이름" type="text" value={name} onChange={(e) => setName(e.target.value)} required/> <br/>
      <Input id="email" label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/> <br/>
      <Input id="password" label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/> <br/>
      <Input id="confirmPassword" label="비밀번호 확인" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/> <br/>
      <Input id="phone" label="전화번호" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required/> <br/>
      <Input id="birthDate" label="생년월일" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required/> <br/>
      <Button type="submit" text="회원가입" />
    </form>
  )
}

export default SignupForm