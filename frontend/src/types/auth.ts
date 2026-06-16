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