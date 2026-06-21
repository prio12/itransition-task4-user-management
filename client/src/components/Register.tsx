import axios from "axios";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { User } from "../types/user";
import toast from "react-hot-toast";

interface RegisterProps {
  onSwitchToLogin: () => void;
  setToken: Dispatch<SetStateAction<string | null>>;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  setView: Dispatch<SetStateAction<"login" | "register" | "dashboard">>;
  API_URL: string;
  fetchUsers: (storedToken: string) => Promise<boolean>;
}

const Register = ({
  onSwitchToLogin,
  setToken,
  setCurrentUser,
  setView,
  API_URL,
  fetchUsers,
}: RegisterProps) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
      });
      const { token: userToken, user: userData } = response.data;

      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(userData));
      //fetch all users
      await fetchUsers(userToken);

      setToken(userToken);
      setCurrentUser(userData);
      toast.success(
        response.data.message ||
          "Registration successful! Verification link sent.",
      );
      setView("dashboard");
      setLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed.");
      setLoading(false);
    }
  };
  return (
    <div className="row justify-content-center pt-4">
      <div className="col-10 col-sm-8 col-md-6 col-lg-4">
        <div className="card p-4 border shadow-sm bg-white">
          <div className="text-center mb-3">
            <p className="text-muted small mb-0">Join our application</p>
            <h3 className="h5 fw-bold text-dark">Create an Account</h3>
          </div>

          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <label className="form-label small text-secondary fw-medium">
                Full Name:
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Minimum 1 character"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success btn-sm w-100 mb-2 fw-medium"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="text-center small mt-3 pt-2 border-top border-light">
              <button
                type="button"
                className="btn btn-link btn-sm p-0 small text-decoration-none"
                onClick={onSwitchToLogin}
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
