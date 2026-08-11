export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function validateLogin(values: { email: string; password: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6) errors.password = 'Password is too short';
  return errors;
}

export function validateSignup(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name?.trim()) errors.name = 'Name is required';
  else if (values.name.trim().length < 4) errors.name = 'Name must be at least 4 characters';
  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function validateContribution(values: {
  name: string;
  email: string;
  description: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name?.trim()) errors.name = 'Name is required';
  if (!values.email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email';
  if (!values.description?.trim()) errors.description = 'Description is required';
  return errors;
}
