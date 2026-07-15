import axios, { AxiosError } from "axios";
import { ErrorResponse, RequestFindid, ResponseFindid } from "@/types/auth"
import { findId } from "../api/authApi";

type UseFindIdResult = ResponseFindid | ErrorResponse;

export const useFindId = () => {

    const executeFindid = async (findIdData: RequestFindid): Promise<UseFindIdResult> => {

        try {
            const response = await findId(findIdData);
            
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
    return { executeFindid };
}