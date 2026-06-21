import { useState, type Dispatch, type SetStateAction } from "react";
import type { User } from "../types/user";
import axios from "axios";
import toast from "react-hot-toast";

interface LoginProps {
  onSwitchToRegister: () => void;
  setToken: Dispatch<SetStateAction<string | null>>;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  setView: Dispatch<SetStateAction<"login" | "register" | "dashboard">>;
  API_URL: string;
  fetchUsers: (storedToken: string) => Promise<boolean>;
}

const Login = ({
  onSwitchToRegister,
  setToken,
  setCurrentUser,
  setView,
  API_URL,
  fetchUsers,
}: LoginProps) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token: userToken, user: userData } = response.data;

      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success(`Welcome back! ${userData?.name}`);
      //fetch all users
      await fetchUsers(userToken);
      setToken(userToken);
      setCurrentUser(userData);
      setView("dashboard");
      setLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Login failed. Please check details.",
      );
      setLoading(false);
    }
  };
  return (
    <div className="row justify-content-center pt-4">
      <div className="col-10 col-sm-8 col-md-6 col-lg-4">
        <div className="card p-4 border shadow-sm bg-white">
          <div className="text-center mb-3">
            <p className="text-muted small mb-0">Start your journey</p>
            <h3 className="h5 fw-bold text-dark">Sign In to The App</h3>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label className="form-label small text-secondary fw-medium">
                E-mail:
              </label>
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small text-secondary fw-medium">
                Password:
              </label>
              <input
                type="password"
                className="form-control form-control-sm"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm w-100 mb-2 fw-medium"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="text-center small mt-3 pt-2 border-top border-light">
              <button
                type="button"
                className="btn btn-link btn-sm p-0 small text-decoration-none"
                onClick={onSwitchToRegister}
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
