import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import type { User } from "./types/user";
import { Toaster } from "react-hot-toast";

const API_URL = "http://localhost:5000/api/auth";

export default function App() {
  const [view, setView] = useState<"login" | "register" | "dashboard">("login");

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // THE PERSISTENCE SOLUTION: Prevents login flash on browser reloads
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  //fetch Users
  const fetchUsers = async (storedToken: string) => {
    setLoadingUsers(true);
    try {
      const config = { headers: { Authorization: `Bearer ${storedToken}` } };
      const response = await axios.get(`${API_URL}/users`, config);
      setUsers(response.data);
      setLoadingUsers(false);
      return true; // <-- Signal success
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setLoadingUsers(false);
      throw error;
    }
  };

  useEffect(() => {
    const checkPersistence = async () => {
      const storedToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          //fetch all users
          await fetchUsers(storedToken);

          setToken(storedToken);
          setCurrentUser(JSON.parse(storedUser));
          setView("dashboard");
        } catch (err) {
          localStorage.clear();
          sessionStorage.clear();
          setToken(null);
          setCurrentUser(null);
          setView("login");
        }
      }
      setLoadingSession(false);
    };

    checkPersistence();
  }, []);

  console.log(users);

  if (loadingSession) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-muted small fw-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Toaster position="top-right" />
      <Navbar
        token={token}
        currentUser={currentUser}
        setToken={setToken}
        setCurrentUser={setCurrentUser}
        setView={setView}
      />

      <div className="container">
        {!token && error && (
          <div className="alert alert-danger py-2 small mb-3">{error}</div>
        )}
        {!token && success && (
          <div className="alert alert-success py-2 small mb-3">{success}</div>
        )}

        {view === "login" && !token && (
          <Login
            onSwitchToRegister={() => {
              setView("register");
              setError("");
              setSuccess("");
            }}
            setToken={setToken}
            setCurrentUser={setCurrentUser}
            setView={setView}
            API_URL={API_URL}
            fetchUsers={fetchUsers}
          />
        )}

        {view === "register" && !token && (
          <Register
            onSwitchToLogin={() => {
              setView("login");
              setError("");
              setSuccess("");
            }}
            setToken={setToken}
            setCurrentUser={setCurrentUser}
            setView={setView}
            API_URL={API_URL}
            fetchUsers={fetchUsers}
          />
        )}

        {view === "dashboard" && token && (
          <div className="card p-3 border shadow-sm">
            <h2 className="h6 text-secondary mb-0">
              User Matrix Workspace Placeholder
            </h2>
            {/* We will map our Dashboard component right here next */}
          </div>
        )}
      </div>
    </div>
  );
}
