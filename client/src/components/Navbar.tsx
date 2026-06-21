import type { Dispatch, SetStateAction } from "react";
import type { User } from "../types/user";
import toast from "react-hot-toast";

interface NavbarProps {
  token: string | null;
  currentUser: User | null;
  setToken: Dispatch<SetStateAction<string | null>>;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  setView: Dispatch<SetStateAction<"login" | "register" | "dashboard">>;
}

const Navbar = ({
  token,
  currentUser,
  setToken,
  setCurrentUser,
  setView,
}: NavbarProps) => {
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setToken(null);
    setCurrentUser(null);
    toast.success("Log out successful!");
    setView("login");
  };
  return (
    <nav className="navbar navbar-dark bg-dark px-3 mb-4">
      <span className="navbar-brand mb-0 h1 fs-6 fw-bold">THE APP</span>
      {token && (
        <div className="d-flex align-items-center gap-3">
          <span className="text-light small">
            Hello, {currentUser?.name || "User"}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-light py-0 px-2 small"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
