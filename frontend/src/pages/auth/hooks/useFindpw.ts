import axios, { AxiosError } from "axios";
import { 
    RequestVerifyUser,
    ResponseVerifyUser,
    RequestResetPassword,
    ResponseResetPassword,
    ErrorResponse
} from "@/types/auth";
import { findPW, resetPw } from "../api/authApi";

interface ExecuteVerifyResult {
    success: boolean;
    status?: number;
    data?: ResponseVerifyUser;
    message?: string;
}

interface ExecuteResetPasswordResult {
    success: boolean;
    status?: number;
    data?: ResponseResetPassword;
}

export const useFindPw = () => {
    const executeVerify = async (verifyData: RequestVerifyUser): Promise<ExecuteVerifyResult> => {
        try {
            const response = await findPW(verifyData);

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;

            return {
                success: false,
                status: axiosError.response?.status,
                message: axiosError.response?.data?.message
            };
        }
    };
    
    const executeResetPassword = async (resetPwData: RequestResetPassword): Promise<ExecuteResetPasswordResult> => {
        
        try {
            const response = await resetPw(resetPwData);

            return response.data;
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