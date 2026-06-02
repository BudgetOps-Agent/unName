import { useState, SubmitEvent } from "react";

const SignupForm = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

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