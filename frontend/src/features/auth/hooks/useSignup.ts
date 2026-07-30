import { AxiosError } from 'axios';
import { signup } from "@/features/auth/api/authApi";
import { RequestSignup, ResponseSignup, ErrorResponse, } from '@/types/auth';

type UseSignupResult = ResponseSignup | ErrorResponse;

export const useSignUp = () => {

    const executeSignup = async (signUpData: RequestSignup): Promise<UseSignupResult> => {
        try {
            const response = await signup(signUpData);

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            
            if (!axiosError.response) {
                return {
                    success: false,
                    code: "NETWORK_ERROR",
                    message: "네트워크 연결을 확인해주세요.",
                };
            }
            return (
                axiosError.response?.data ?? {
                    success: false,
                    code: "UNKNOWN_ERROR",
                    message: "알 수 없는 오류가 발생했습니다.",
                }
            );
        }
    };
    return { executeSignup };
};