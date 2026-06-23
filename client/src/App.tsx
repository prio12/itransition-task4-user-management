/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import type { User } from "./types/user";
import toast, { Toaster } from "react-hot-toast";
import Dashboard from "./components/Dashboard";

const API_URL = "https://userbase-api.vercel.app/api/auth";

const App = () => {
  const [view, setView] = useState<"login" | "register" | "dashboard">("login");

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  //fetch Users
  const fetchUsers = async (storedToken: string) => {
    const config = { headers: { Authorization: `Bearer ${storedToken}` } };
    const response = await axios.get(`${API_URL}/users`, config);

    setUsers(response.data);
    return true;
  };

  useEffect(() => {
    const checkPersistence = async () => {
      const storedToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      console.log(storedUser, "from localstorage");

      if (storedToken && storedUser) {
        try {
          //fetch all users
          await fetchUsers(storedToken);

          setToken(storedToken);
          setCurrentUser(JSON.parse(storedUser));
          setView("dashboard");
        } catch (err) {
          console.log(err);
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

  //handleToolBar actions
  const handleToolbarActions = async (
    endpoint: string,
    payload?: { ids: number[] },
  ) => {
    if (!token) {
      console.error("Action aborted: No authentication token found in state.");

      localStorage.clear();
      sessionStorage.clear();
      setCurrentUser(null);

      setView("login");

      toast.error("Your session has expired. Please log in again.");
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (endpoint === "users/purge-unverified") {
        console.log("entered");
        const response = await axios.delete(`${API_URL}/${endpoint}`, config);
        console.log(response, "from dashboard");
        if (response.status === 200) {
          await fetchUsers(token);
        }
      } else {
        const response = await axios.post(
          `${API_URL}/${endpoint}`,
          payload,
          config,
        );
        if (response.status === 200) {
          await fetchUsers(token);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message || "Session error.";

        if (status === 403) {
          localStorage.clear();
          sessionStorage.clear();
          setToken(null);
          setCurrentUser(null);

          setView("login");

          toast.error(`Session Terminated: ${backendMessage}`);
          return;
        }
      }
    }
  };

  useEffect(() => {
    if (!currentUser || !users || users.length === 0) return;

    const updatedUserProfile = users.find((user) => user.id === currentUser.id);

    if (
      updatedUserProfile &&
      updatedUserProfile.is_verified !== currentUser.is_verified
    ) {
      setCurrentUser(updatedUserProfile);

      const storageType = localStorage.getItem("token")
        ? "localStorage"
        : "sessionStorage";
      window[storageType].setItem("user", JSON.stringify(updatedUserProfile));
    }
  }, [users, currentUser]);

  if (loadingSession) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-muted small fw-medium">Loading session...</div>
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
            <Dashboard
              initialUsers={users}
              handleToolbarActions={handleToolbarActions}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
