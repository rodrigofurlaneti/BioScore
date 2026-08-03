export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  birthDate: string;     // ISO date
  gender: 0 | 1 | 2;   // 0 = Female, 1 = Male, 2 = Other
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    username: string;
  };
}
