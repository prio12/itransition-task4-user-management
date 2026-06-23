import type { Dispatch, SetStateAction } from "react";
import type { User } from "../types/user";
import toast from "react-hot-toast";

import { MdVerified } from "react-icons/md";
import { VscUnverified } from "react-icons/vsc";

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
      <span className="navbar-brand mb-0 h1 fs-6 fw-bold">UserBase</span>
      {token && (
        <div className="d-flex align-items-center gap-3">
          {currentUser?.is_verified ? (
            <span
              className="d-flex align-items-center text-success small gap-1 border border-success-subtle bg-success-subtle px-2 py-0.5 rounded"
              style={{ fontSize: "12px" }}
              title="Account Verified"
            >
              <MdVerified size={14} /> Verified
            </span>
          ) : (
            <span
              className="d-flex align-items-center text-warning small gap-1 border border-warning-subtle bg-warning-subtle px-2 py-0.5 rounded text-wrap text-center"
              style={{ fontSize: "11px", maxWidth: "220px" }}
              title="Please check your inbox to verify your account"
            >
              <VscUnverified size={14} className="flex-shrink-0" /> Check your
              email to verify account
            </span>
          )}

          <div className="d-flex align-items-center gap-2">
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
