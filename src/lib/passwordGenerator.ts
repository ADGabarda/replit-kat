// Password generation utility with patterns for different user types

export interface GeneratedCredentials {
  username: string;
  password: string;
}

// Character sets for password generation
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SPECIAL_CHARS = '!@#$%^&*';

// Generate random character from a given set
function getRandomChar(charset: string): string {
  return charset.charAt(Math.floor(Math.random() * charset.length));
}

// Generate random string from charset
function getRandomString(charset: string, length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += getRandomChar(charset);
  }
  return result;
}

// Generate admin password: ADM + 3 random chars (uppercase, numbers, special)
export function generateAdminPassword(): string {
  const prefix = 'ADM';
  const charset = UPPERCASE + NUMBERS + SPECIAL_CHARS;
  const randomPart = getRandomString(charset, 3);
  return prefix + randomPart;
}

// Generate regular user password: usr + 3 random chars (lowercase, numbers)
export function generateUserPassword(): string {
  const prefix = 'usr';
  const charset = LOWERCASE + NUMBERS;
  const randomPart = getRandomString(charset, 3);
  return prefix + randomPart;
}

// Generate username based on name (first name + random number)
export function generateUsername(fullName: string): string {
  const firstName = fullName.split(' ')[0].toLowerCase();
  const randomNum = Math.floor(Math.random() * 999) + 1;
  return firstName + randomNum.toString().padStart(3, '0');
}

// Generate complete credentials for a user
export function generateCredentials(fullName: string, role: 'admin' | 'user'): GeneratedCredentials {
  const username = generateUsername(fullName);
  const password = role === 'admin' ? generateAdminPassword() : generateUserPassword();
  
  return {
    username,
    password
  };
}