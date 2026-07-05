import React, { useEffect } from 'react'
import { useState, SubmitEvent } from "react";
import { useRouter } from "next/router";
import { useSignUp } from "../hooks/useSignup";
import {
  validateEmailFormat,
  validatePasswordFormat,
  validatePassword,
  validatePhoneFormat,
  validateBirthDate,
  validateName
} from "../utils/signupValidator";
import useMediaQuery from '@/shared/hook/useMediaQuery';
import styles from "./signupForm.module.css";
import Input from '@/shared/components/input/Input';
import Button from '@/shared/components/button/Button';


const SignupForm = () => {
    const { executeSignup } = useSignUp();
    const [state, setState] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        birthDate: "",
    });
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        birthDate: "",
    });
    const [step, setStep] = useState(1);

    const router = useRouter();

    const isMobile = useMediaQuery("(max-width: 768px)");
    if (isMobile === null) return null;

    const handleChange = (
        field: keyof typeof state,
        value: string
    ) => {
        if (field === "phone") {
            const number = value.replace(/\D/g, "");

            if (number.length <= 3) {
                value = number;
            } else if (number.length <= 7) {
                value = number.replace(/(\d{3})(\d+)/, "$1-$2");
            } else {
                value = number.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
            }
        }

        setState(prev => ({
            ...prev,
            [field]: value
        }));

        let error = "";
        if (field === "name") {
            if (!validateName(value)) {
                error = "이름을 입력해주세요.";
            } else if (isMobile) {
                setStep(2);
            }
        }

        if (field === "email") {
            if (!validateEmailFormat(value)) {
                error = "올바른 이메일 형식이 아닙니다.";
            } else if (isMobile && step === 2) {
                setStep(3);
            }
        }

        if (field === "password") {
            if (!validatePasswordFormat(value)) {
                error = "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다.";
            }
            if (state.confirmPassword) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword:
                        validatePassword(value, state.confirmPassword)
                            ? ""
                            : "비밀번호가 일치하지 않습니다."
                }));
            }
            if (isMobile && step === 3 && validatePasswordFormat(value)) {
                setStep(4);
            }
        }

        if (field === "confirmPassword") {
            if (!validatePassword(state.password, value)) {
                error = "비밀번호가 일치하지 않습니다.";
            } else if (isMobile && step === 4) {
                setStep(5);
            }
        }

        if (field === "phone") {
            if (!validatePhoneFormat(value)) {
                error = "전화번호 형식이 올바르지 않습니다.";
            } else if (isMobile && step === 5) {
                setStep(6);
            }
        }

        if (field === "birthDate") {
            if (!validateBirthDate(value)) {
                error = "생년월일을 확인해주세요.";
            } else if (isMobile && step === 6) {
                setStep(7);
            }
        }

        setErrors(prev => ({
            ...prev,
            [field]: error,
        }));
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        let hasError = false;

        const newErrors = {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            birthDate: "",
        };

        if (!validateName(state.name)) {
            newErrors.name = "이름을 입력해주세요.";
            hasError = true;
        }

        if (!validateEmailFormat(state.email)) {
            newErrors.email = "올바른 이메일 형식이 아닙니다.";
            hasError = true;
        }

        if (!validatePasswordFormat(state.password)) {
            newErrors.password = "비밀번호는 최소 8자 이상이어야 하며, 문자와 숫자를 포함해야 합니다.";
            hasError = true;
        }

        if (!validatePassword(state.password, state.confirmPassword)) {
            newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
            hasError = true;
        }

        if (!validatePhoneFormat(state.phone)) {
            newErrors.phone = "유효한 전화번호 형식이 아닙니다.";
            hasError = true;
        }

        if (!validateBirthDate(state.birthDate)) {
            newErrors.birthDate = "유효한 생년월일을 입력해주세요.";
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
            return;
        }

        const signUpData = {
            name: state.name,
            email: state.email,
            password: state.password,
            phone: state.phone.replace(/\D/g, ""),
            birthDate: state.birthDate
        };

        const result = await executeSignup(signUpData);

        if (result.success) {
            alert(`${result.user.name}님, 회원가입이 완료되었습니다.`);
            router.push('/auth/signin');
        }

        if (!result.success) {
            alert(result.message);
        }
    };

    const isFormValid =
        validateName(state.name) &&
        validateEmailFormat(state.email) &&
        validatePasswordFormat(state.password) &&
        validatePassword(state.password, state.confirmPassword) &&
        validatePhoneFormat(state.phone) &&
        validateBirthDate(state.birthDate);

    return (
        <form onSubmit={handleSubmit}>
            <Input 
                id="name" 
                label="이름" 
                type="text" 
                value={state.name} 
                placeholder="이름을 입력해주세요" 
                onChange={(e) => handleChange("name", e.target.value)} 
                required 
                error={errors.name}
            />
                
            <div className={`${styles.step} ${!isMobile || step >= 2 ? styles.show : ""}`}>
                <Input 
                    id="email" 
                    label="이메일" 
                    type="email" 
                    value={state.email} 
                    placeholder="이메일을 입력해주세요" 
                    onChange={(e) => handleChange("email", e.target.value)} 
                    onFocus={() => {if (isMobile && step < 2) setStep(2);}}
                    required 
                    error={errors.email}
                />
            </div>
            <div className={`${styles.step} ${!isMobile || step >= 3 ? styles.show : ""}`}>
                <Input 
                    id="password" 
                    label="비밀번호" 
                    type="password" 
                    value={state.password} 
                    placeholder="숫자,문자 포함 최소 8자 이상 입력해주세요" 
                    onChange={(e) => handleChange("password", e.target.value)} 
                    onFocus={() => {if (isMobile && step < 3) setStep(3);}}
                    required  
                    error={errors.password}
                />
            </div>
            <div className={`${styles.step} ${!isMobile || step >= 4 ? styles.show : ""}`}>
                <Input 
                    id="confirmPassword" 
                    label="비밀번호 확인" 
                    type="password" 
                    value={state.confirmPassword} 
                    placeholder="비밀번호를 확인해주세요" 
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    onFocus={() => {if (isMobile && step < 4) setStep(4);}}
                    required 
                    error={errors.confirmPassword}
                />
            </div>
            <div className={`${styles.step} ${!isMobile || step >= 5 ? styles.show : ""}`}>
                <Input 
                    id="phone" 
                    label="전화번호" 
                    type="tel" 
                    value={state.phone} 
                    placeholder="전화번호를 입력해주세요" 
                    onChange={(e) => handleChange("phone", e.target.value)} 
                    onFocus={() => {if (isMobile && step < 5) setStep(5);}}
                    required 
                    error={errors.phone}
                />
            </div>
            <div className={`${styles.step} ${!isMobile || step >= 6 ? styles.show : ""}`}>
                <Input 
                    id="birthDate" 
                    label="생년월일" 
                    type="date" 
                    value={state.birthDate} 
                    placeholder="생년월일을 선택해주세요"
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                    onFocus={() => {if (isMobile && step < 6) setStep(6);}}
                    required 
                    error={errors.birthDate}/>
            </div>
            <div className="buttons fixed">
                <Button type="submit" size="lg" text="가입하기" disabled={isMobile ? step < 7 : !isFormValid}/>
            </div>            
        </form>
    )
}

export default SignupForm