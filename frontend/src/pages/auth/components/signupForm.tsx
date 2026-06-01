const SignupForm = () => {
  return (
    <form>
      <input type="text" placeholder="이름" required/> <br/>
      <input type="email" placeholder="이메일" required/> <br/>
      <input type="password" placeholder="비밀번호" required/> <br/>
      <input type="password" placeholder="비밀번호 확인" required/> <br/>
      <input type="tel" placeholder="전화번호" required/> <br/>
      <input type="date" placeholder="생년월일" required/> <br/>
      <button type="submit">회원가입</button>
    </form>
  )
}

export default SignupForm