import axios, { AxiosError } from 'axios';
import { requestSignup, responseSignup } from '@/types/auth';

interface UseSignupResult {
    success: boolean;
    status?: number;
    data?: responseSignup;
}

export const useSignUp = () => {

    const executeSignup = async (signUpData: requestSignup): Promise<UseSignupResult> => {
    
        try {
            const response = await axios.post<responseSignup>('/api/user/signup', signUpData);
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
    return { executeSignup };
};