import axios, { AxiosError } from "axios";
import { signin } from "@/pages/auth/api/authApi";
import { RequestSignin, ResponseSignin } from "@/types/auth";

interface UseSigninResult {
    success: boolean;
    status?: number;
    data?: ResponseSignin;
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
            const axiosError = error as AxiosError;

            return {
                success: false,
                status: axiosError.response?.status
            };
        }
    };
    return { executeSignin };
};