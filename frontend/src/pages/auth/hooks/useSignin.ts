import axios, { AxiosError } from "axios";
import { signin } from "@/pages/auth/api/authApi";
import { ErrorResponse, RequestSignin, ResponseSignin } from "@/types/auth";

interface UseSigninResult {
    success: boolean;
    status?: number;
    data?: ResponseSignin;
    user?: ResponseSignin['user'];
    message?: string;
}

export const useSignIn = () => {
    
    const executeSignin = async (signInData: RequestSignin): Promise<UseSigninResult> => {

        try {
            const response = await signin(signInData);

            return response.data;
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;

            return {
                success: false,
                status: axiosError.response?.status,
                message: axiosError.response?.data?.message
            };
        }
    };
    return { executeSignin };
};