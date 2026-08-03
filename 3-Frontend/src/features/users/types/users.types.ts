export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  gender: string;
  username: string;
  isActive: boolean;
  createdAt: string;
}
export interface UpdateUserPayload {
  id: string;
  fullName: string;
  phoneNumber?: string;
  birthDate?: string;
}
