export interface User {
  id: number;
  name: string;
  email: string;
  status: "active" | "blocked";
  is_verified: boolean;
  last_login_at: string;
  created_at: string;
}
