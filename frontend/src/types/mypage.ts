export interface ResponseMyPage {
  success: true;
  user: {
    name: string,
    role: 'ADMIN' | 'USER';
    email: string;
    phone: string;
    createdAt: string;
  }
  teams: {
    teamId: number;
    name: string;
    memberCount: number;
    role: 'ADMIN' | 'ACCOUNTANT' | 'MEMBER';
  }[];
}