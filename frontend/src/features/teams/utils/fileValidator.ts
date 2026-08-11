// 백엔드 FileStorageService의 제한과 동일하게 맞춤 (여기서 막아도 서버가 다시 검증함)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const RECEIPT_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];
export const POLICY_EXTENSIONS = ['pdf', 'docx'];

// input의 accept 속성용 문자열 (파일 선택 창에서 1차로 걸러줌)
export const RECEIPT_ACCEPT = '.jpg,.jpeg,.png,.pdf';
export const POLICY_ACCEPT = '.pdf,.docx';

const extensionOf = (fileName: string) => {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot === -1 ? '' : fileName.slice(lastDot + 1).toLowerCase();
};

// 통과하면 null, 문제가 있으면 사용자에게 보여줄 메시지를 반환
export const validateFile = (file: File, allowedExtensions: string[]): string | null => {
    if (!allowedExtensions.includes(extensionOf(file.name))) {
        return `${allowedExtensions.join(', ')} 파일만 업로드할 수 있어요.`;
    }

    if (file.size > MAX_FILE_SIZE) {
        return '파일 크기는 10MB를 넘을 수 없어요.';
    }

    return null;
};
