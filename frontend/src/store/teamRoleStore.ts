import { create } from 'zustand';

// 권한 위임·변경은 멤버 페이지에서 일어나지만, 그 결과를 보여주는 건
// 헤더(역할 뱃지)와 사이드바(역할별 메뉴)라 서로 다른 트리에 있다.
// 값을 직접 공유하는 대신 "다시 불러와라" 신호만 올려서 각자 새로 조회하게 함
interface TeamRoleState {
    version: number;
    refreshRole: () => void;
}

export const useTeamRoleStore = create<TeamRoleState>((set) => ({
    version: 0,
    refreshRole: () => set((state) => ({ version: state.version + 1 })),
}));