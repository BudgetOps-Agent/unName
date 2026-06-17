import axios, { AxiosError } from "axios";
import { requestSignin, responseSignin } from "@/types/auth";

interface UseSigninResult {
    success: boolean;
    status?: number;
    data?: responseSignin;
}

export const useSignIn = () => {
    
    const executeSignin = async (signInData: requestSignin): Promise<UseSigninResult> => {

        try {
            const response = await axios.post<responseSignin>('/api/user/login', signInData);
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