import { useState, SubmitEvent } from "react";
import { useRouter } from "next/router";
import { useSignUp } from "../hooks/useSignup";
import Input from "@/shared/components/input/Input";
import Button from "@/shared/components/button/Button";
import {
  validateEmailFormat,
  validatePasswordFormat,
  validatePassword,
  validatePhoneFormat,
  validateBirthDate
} from "../utils/signupValidator";
import Link from "next/link";
import { Card } from "@/shared/components/card/Card";
import styles from "./Signup.module.css";

const Signup = () => {

  const { executeSignup } = useSignUp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

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
      alert(`${result.user.name}님, 회원가입이 완료되었습니다.`);
      router.push('/auth/signin');
      return;
    }
    
    if (!result.success) {
        alert(result.message);
        return;
    }

  };

  return (
    <Card className="form-container">
        <Link href="/auth/signin" className="link-back">로그인 페이지로 돌아가기</Link>
        <h2 className={styles["form-title"]}>회원가입</h2>
        <form onSubmit={handleSubmit}>
            <Input id="name" label="이름" type="text" value={name} placeholder="이름을 입력해주세요" onChange={(e) => setName(e.target.value)} required/>
            <Input id="email" label="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <Input id="password" label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <Input id="confirmPassword" label="비밀번호 확인" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
            <Input id="phone" label="전화번호" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required/>
            <Input id="birthDate" label="생년월일" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required/>
            <Button type="submit" size="lg" text="가입하기"/>
        </form>
    </Card>
  )
}

export default Signup