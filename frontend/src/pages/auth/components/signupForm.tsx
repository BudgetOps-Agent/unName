import { useState, SubmitEvent } from "react";
import {
  validateEmailFormat,
  validatePasswordFormat,
  validatePassword,
  validatePhoneFormat,
  validateBirthDate
} from "../utils/signupValidator";

const SignupForm = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

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

    console.log({
      name, email, password, confirmPassword, phone, birthDate
    })
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required/> <br/>
      <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required/> <br/>
      <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required/> <br/>
      <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}required/> <br/>
      <input type="tel" placeholder="전화번호" value={phone} onChange={(e) => setPhone(e.target.value)} required/> <br/>
      <input type="date" placeholder="생년월일" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required/> <br/>
      <button type="submit">회원가입</button>
    </form>
  )
}

export default SignupForm