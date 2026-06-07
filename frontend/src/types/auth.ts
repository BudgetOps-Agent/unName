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