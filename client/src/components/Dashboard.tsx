import { useState } from "react";
import type { User } from "../types/user";

import { FiLock, FiUnlock, FiTrash2 } from "react-icons/fi";
import { MdLayersClear } from "react-icons/md";

interface DashboardProps {
  initialUsers: User[];
  handleToolbarActions: (
    endpoint: string,
    payload?: { ids: number[] },
  ) => Promise<void>;
}

const Dashboard = ({ initialUsers, handleToolbarActions }: DashboardProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const sortedUsers = [...initialUsers].sort((a, b) => {
    const timeA = a.last_login_at ? new Date(a.last_login_at).getTime() : 0;
    const timeB = b.last_login_at ? new Date(b.last_login_at).getTime() : 0;
    return timeB - timeA;
  });

  // Master Checkbox indicators
  const isAllSelected =
    sortedUsers.length > 0 && selectedIds.length === sortedUsers.length;

  const selectedUsers = sortedUsers.filter((user) =>
    selectedIds.includes(user.id),
  );

  const isBlockDisabled =
    selectedIds.length === 0 ||
    selectedUsers.every((user) => user.status?.toLowerCase() === "blocked");

  const isUnblockDisabled =
    selectedIds.length === 0 ||
    selectedUsers.every((user) => user.status?.toLowerCase() !== "blocked");

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      const allIds = sortedUsers.map((user) => user.id);
      setSelectedIds(allIds);
    }
  };

  const handleRowCheckboxToggle = (userId: number) => {
    if (selectedIds.includes(userId)) {
      setSelectedIds(selectedIds.filter((id) => id !== userId));
    } else {
      setSelectedIds([...selectedIds, userId]);
    }
  };

  // Toolbar actions
  const executeBlockAction = async () => {
    if (isBlockDisabled) return; // Guard clause updated
    await handleToolbarActions("users/block", { ids: selectedIds });
    setSelectedIds([]);
  };

  const executeUnblockAction = async () => {
    if (isUnblockDisabled) return; // Guard clause updated
    await handleToolbarActions("users/unblock", { ids: selectedIds });
    setSelectedIds([]);
  };

  const executeDeleteAction = async () => {
    if (selectedIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} user(s)?`,
      )
    ) {
      await handleToolbarActions("users/delete", { ids: selectedIds });
      setSelectedIds([]);
    }
  };

  const executeUnverifiedAction = async () => {
    if (
      window.confirm("Are you sure you want to delete all unverified accounts?")
    ) {
      await handleToolbarActions("users/purge-unverified");
      setSelectedIds([]);
    }
  };

  const formatStatusBadge = (userStatus: string, isVerified: boolean) => {
    if (userStatus?.toLowerCase() === "blocked") {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 small text-nowrap">
          Blocked
        </span>
      );
    }

    if (!isVerified) {
      return (
        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 small text-nowrap">
          Unverified
        </span>
      );
    }

    return (
      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small text-nowrap">
        Active
      </span>
    );
  };

  const formatTimeStr = (isoString?: string) => {
    if (!isoString) return "Never";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="card p-0 border shadow-sm bg-white mt-2">
      {/* Toolbar layout */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between p-2 bg-light border-bottom gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1.5 fw-medium text-nowrap"
            onClick={executeBlockAction}
            disabled={isBlockDisabled}
            title={
              isBlockDisabled && selectedIds.length > 0
                ? "Selected users are already blocked"
                : "Block selected accounts"
            }
          >
            <FiLock size={14} className="me-1" /> Block
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center text-nowrap"
            onClick={executeUnblockAction}
            disabled={isUnblockDisabled}
            title={
              isUnblockDisabled && selectedIds.length > 0
                ? "Selected users are already active"
                : "Unblock selected accounts"
            }
            style={{ width: "32px", height: "31px", padding: 0 }}
          >
            <FiUnlock size={15} />
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center text-nowrap"
            onClick={executeDeleteAction}
            disabled={selectedIds.length === 0}
            title="Delete selected records"
            style={{ width: "32px", height: "31px", padding: 0 }}
          >
            <FiTrash2 size={15} />
          </button>

          <div className="vr mx-1 my-1 text-secondary opacity-25 d-none d-sm-block"></div>

          <button
            type="button"
            className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1.5 small text-nowrap"
            onClick={executeUnverifiedAction}
            title="Purge all unverified registrations"
          >
            <MdLayersClear size={15} className="me-1" /> Clear Unverified
          </button>
        </div>

        <div className="text-muted small px-1 text-nowrap">
          {selectedIds.length > 0 ? (
            <span className="fw-medium text-primary">
              {selectedIds.length} row(s) selected
            </span>
          ) : (
            <span>Select items to unlock actions</span>
          )}
        </div>
      </div>

      {/* Responsive table */}
      <div className="table-responsive w-100">
        <table
          className="table table-sm table-hover align-middle mb-0 text-dark small"
          style={{ fontSize: "13px" }}
        >
          <thead className="table-light text-secondary border-bottom">
            <tr>
              <th
                scope="col"
                className="text-center py-2"
                style={{ width: "45px" }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={isAllSelected}
                  onChange={handleSelectAllToggle}
                  title="Select or deselect all items"
                />
              </th>
              <th scope="col" className="fw-semibold py-2 text-nowrap">
                Name
              </th>
              <th scope="col" className="fw-semibold py-2 text-nowrap">
                E-mail
              </th>
              <th scope="col" className="fw-semibold py-2 text-nowrap">
                Status
              </th>
              <th scope="col" className="fw-semibold py-2 text-nowrap">
                Last Seen
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-muted py-4 text-nowrap"
                >
                  No operational records found in database workspace matrix.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => {
                const isRowChecked = selectedIds.includes(user.id);
                return (
                  <tr
                    key={user.id}
                    className={
                      isRowChecked
                        ? "table-primary-subtle align-middle"
                        : "align-middle"
                    }
                    onClick={() => handleRowCheckboxToggle(user.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td
                      className="text-center py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isRowChecked}
                        onChange={() => handleRowCheckboxToggle(user.id)}
                      />
                    </td>
                    <td className="fw-medium text-dark py-2 text-nowrap">
                      {user.status?.toLowerCase() === "blocked" ? (
                        <del className="text-muted">{user.name}</del>
                      ) : (
                        <span>{user.name}</span>
                      )}
                    </td>
                    <td className="text-secondary py-2 text-nowrap">
                      {user.email}
                    </td>
                    <td className="py-2 text-nowrap">
                      {formatStatusBadge(user.status, user.is_verified)}
                    </td>
                    <td
                      className="text-muted py-2 text-nowrap"
                      title={`Full Timestamp: ${formatTimeStr(user.last_login_at)}`}
                    >
                      {formatTimeStr(user.last_login_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
