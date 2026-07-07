import type { ReactElement } from 'react';

const NewTeam = () => {
    return (
        <div>
            새 모임 생성
        </div>
    )
}

NewTeam.getLayout = function getLayout(page: ReactElement) {
        return page;
};

export default NewTeam