export interface requestSignup {
    name: string;
    email: string;
    password: string;
    phone: string;
    birthDate: string;
}

export interface responseSignup {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string;
    birthDate: string;
    createdAt: string;
}

export interface requestSignin {
    email: string;
    password: string;
}

export interface responseSignin {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
}

export interface requestFindid {
    name: string;
    phone: string;
}

export interface responseFindid {
    email: string;
}

export interface requestVerifyUser {
    name: string;
    email: string;
}

export interface responseVerifyUser {
    message: string;
}

export interface requestResetPassword {
    email: string;
    newPassword: string;
}

export interface responseResetPassword {
    message: string;
}