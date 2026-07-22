import axios, { AxiosError } from "axios";
import { 
    RequestVerifyUser,
    ResponseVerifyUser,
    RequestResetPassword,
    ResponseResetPassword,
    ErrorResponse
} from "@/types/auth";
import { findPW, resetPw } from "../api/authApi";

type UseExecuteVerifyResult = ResponseVerifyUser | ErrorResponse;
type UseExecuteResetPasswordResult = ResponseResetPassword | ErrorResponse;

export const useFindPw = () => {
    const executeVerify = async (verifyData: RequestVerifyUser): Promise<UseExecuteVerifyResult> => {
        try {
            const response = await findPW(verifyData);

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;

            return {
                success: false,
                code: axiosError.response?.data?.code ?? "UNKNOWN_ERROR",
                message: axiosError.response?.data?.message ?? "네트워크 연결이 불안정합니다. 인터넷 상태를 확인해 주세요."
            };
        }
    };
    
    const executeResetPassword = async (resetPwData: RequestResetPassword): Promise<UseExecuteResetPasswordResult> => {
        
        try {
            const response = await resetPw(resetPwData);

            return response.data;
        } catch (error) {
            const axiosError =error as AxiosError<ErrorResponse>;

            return {
                success: false,
                code: axiosError.response?.data?.code ?? "UNKNOWN_ERROR",
                message: axiosError.response?.data?.message ?? "네트워크 연결이 불안정합니다. 인터넷 상태를 확인해 주세요."
            };
        }
    }
    return { executeVerify, executeResetPassword };
}