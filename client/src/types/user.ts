export interface User {
  id: number;
  name: string;
  email: string;
  status: "unverified" | "active" | "blocked";
  last_login_at: string;
  created_at: string;
}
