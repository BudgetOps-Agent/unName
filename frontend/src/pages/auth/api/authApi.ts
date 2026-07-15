import api from "@/shared/api/api";
import { RequestSignin, RequestSignup, RequestFindid, ResponseSignin, ResponseSignup, ResponseFindid } from "@/types/auth";
import { AxiosResponse } from "axios";

export const signup = (signUpData: RequestSignup): Promise<AxiosResponse<ResponseSignup>> => {
    return api.post<ResponseSignup>("/api/user/signup", signUpData);
};

export const signin = (signInData: RequestSignin): Promise<AxiosResponse<ResponseSignin>> => {
    return api.post<ResponseSignin>("/api/user/login", signInData);
};
export const findId = (findIdData: RequestFindid): Promise<AxiosResponse<ResponseFindid>> => {
    return api.post<ResponseFindid>("/api/user/findid", findIdData);
}
