export interface RequestSignup {
    name: string;
    email: string;
    password: string;
    phone: string;
    birthDate: string;
}

export interface ResponseSignup {
    success: true;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        phone: string;
        birthDate: string;
        createdAt: string;
    };
}

export interface RequestSignin {
    email: string;
    password: string;
}

export interface ResponseSignin {
    success: boolean;
    user: {
        id: number;
        email: string;
        name: string;
        role: 'ADMIN' | 'USER';
    };
}

export interface RequestFindid {
    name: string;
    phone: string;
}

export interface ResponseFindid {
    email: string;
}

export interface RequestVerifyUser {
    name: string;
    email: string;
}

export interface ResponseVerifyUser {
    message: string;
}

export interface RequestResetPassword {
    email: string;
    newPassword: string;
}

export interface ResponseResetPassword {
    message: string;
}

export interface ErrorResponse {
    success: false;
    code: string;
    message: string;
}