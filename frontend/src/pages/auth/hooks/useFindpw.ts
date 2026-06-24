import axios, { AxiosError } from "axios";
import { 
    requestVerifyUser,
    responseVerifyUser,
    requestResetPassword,
    responseResetPassword
} from "@/types/auth";

interface ExecuteVerifyResult {
    success: boolean;
    status?: number;
    data?: responseVerifyUser;
}

interface ExecuteResetPasswordResult {
    success: boolean;
    status?: number;
    data?: responseResetPassword;
}

export const useFindPw = () => {
    const executeVerify = async (verifyData: requestVerifyUser): Promise<ExecuteVerifyResult> => {

        try {
            const response = await axios.post<responseVerifyUser>('/api/user/verify-user', verifyData);

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
    
    const executeResetPassword = async (resetPwData: requestResetPassword): Promise<ExecuteResetPasswordResult> => {
        
        try {
            const response = await axios.post<responseResetPassword>('/api/user/reset-password', resetPwData);

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
    }
    return { executeVerify, executeResetPassword };
}