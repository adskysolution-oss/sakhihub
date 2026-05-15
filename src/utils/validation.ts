export const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (password.length < minLength) errors.push(`At least ${minLength} characters`);
  if (!hasUpperCase) errors.push("One uppercase letter");
  if (!hasLowerCase) errors.push("One lowercase letter");
  if (!hasNumber) errors.push("One number");
  if (!hasSpecialChar) errors.push("One special character");

  return {
    isValid: errors.length === 0,
    errors
  };
};
