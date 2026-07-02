import { AxiosError } from 'axios';
import { signup } from "@/pages/auth/api/authApi";
import { RequestSignup, ResponseSignup, ErrorResponse, } from '@/types/auth';

type UseSignupResult = ResponseSignup | ErrorResponse;

export const useSignUp = () => {

    const executeSignup = async (signUpData: RequestSignup): Promise<UseSignupResult> => {
        try {
            const response = await signup(signUpData);

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;

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