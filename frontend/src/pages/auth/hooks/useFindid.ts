import axios, { AxiosError } from "axios";
import { RequestFindid, ResponseFindid } from "@/types/auth"

interface UseFindIdResult {
    success: boolean;
    status?: number;
    data?: ResponseFindid;
    message?: string;
}

export const useFindId = () => {
    const executeFindid = async (findIdData: RequestFindid): Promise<UseFindIdResult> => {

        try {
            const response = await axios.post<ResponseFindid>('/api/user/findid', findIdData);

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
    return { executeFindid };
}