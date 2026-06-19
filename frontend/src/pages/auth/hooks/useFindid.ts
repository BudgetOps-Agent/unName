import axios, { AxiosError } from "axios";
import { requestFindid, responseFindid } from "@/types/auth"

interface UseFindIdResult {
    success: boolean;
    status?: number;
    data?: responseFindid;
}

export const useFindId = () => {
    const executeFindid = async (findIdData: requestFindid): Promise<UseFindIdResult> => {

        try {
            const response = await axios.post<responseFindid>('/api/user/findid', findIdData);

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