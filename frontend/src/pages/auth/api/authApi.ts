import api from "@/shared/api/api";
import { RequestSignin, RequestSignup, ResponseSignin, ResponseSignup } from "@/types/auth";
import { AxiosResponse } from "axios";

export const signup = (signUpData: RequestSignup): Promise<AxiosResponse<ResponseSignup>> => {
    return api.post<ResponseSignup>("/api/user/signup", signUpData);
};

export const signin = (signInData: RequestSignin): Promise<AxiosResponse<ResponseSignin>> => {
    return api.post<ResponseSignin>("/api/user/login", signInData);
};