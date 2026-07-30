export const validateName = (name: string) => {
  return name.trim().length >= 2;
};

export const validateEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return false;
    }

    return true;
};

export const validatePasswordFormat = (password: string) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;

    if (!passwordRegex.test(password) || password.length < 8) {
        return false;
    }

    return true;
};

export const validatePassword = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
        return false;
    }

    return true;
};

export const validatePhoneFormat = (phone: string) => {
    const phoneRegex = /^\d{3}-?\d{3,4}-?\d{4}$/;

    if (!phoneRegex.test(phone)) {
        return false;
    }

    return true;
};

export const validateBirthDate = (birthDate: string) => {
    const selectedDate = new Date(birthDate);
    const currentDate = new Date();
    const minDate = new Date();
    minDate.setFullYear(currentDate.getFullYear() - 100);

    if (selectedDate > currentDate || selectedDate < minDate) {
        return false;
    }

    return true;
};