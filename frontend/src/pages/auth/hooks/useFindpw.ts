import axios, { AxiosError } from "axios";
import { 
    requestVerifyUser,
    responseVerifyUser
} from "@/types/auth";

interface UseVerifyUserResult {
    success: boolean;
    status?: number;
    data?: responseVerifyUser;
}

export const useFindPw = () => {
    const executeVerify = async (verifyData: requestVerifyUser): Promise<UseVerifyUserResult> => {

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

    return { executeVerify };
}