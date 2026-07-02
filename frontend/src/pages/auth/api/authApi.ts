import api from "@/shared/api/api";
import { RequestSignup, ResponseSignup } from "@/types/auth";
import { AxiosResponse } from "axios";

export const signup = (signUpData: RequestSignup): Promise<AxiosResponse<ResponseSignup>> => {
    return api.post<ResponseSignup>("/api/user/signup", signUpData);
};