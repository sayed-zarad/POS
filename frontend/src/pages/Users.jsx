import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../api/users.api";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [listError, setListError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
    isActive: true,
  });

  useEffect(() => {
    if (isAuthLoading || currentUser?.role !== "ADMIN") {
      return undefined;
    }

    fetchUsers();
  }, [isAuthLoading, currentUser?.role, search, roleFilter]);

  async function fetchUsers() {
    setIsLoading(true);
    setListError(null);
    try {
      const params = { page: 1, limit: 100 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "ALL") params.role = roleFilter;

      const result = await getUsers(params);
      setUsers(result.data || []);
    } catch (err) {
      setListError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "CASHIER",
      isActive: true,
    });
    setFormError(null);
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEditing(userToEdit) {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      password: "",
      role: userToEdit.role,
      isActive: userToEdit.isActive,
    });
    setFormError(null);
    setSuccessMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (trimmedName.length < 2) {
      setFormError("Name must contain at least 2 characters.");
      return;
    }

    if (!trimmedEmail) {
      setFormError("Email is required.");
      return;
    }

    if (!editingUser && (!formData.password || formData.password.length < 8)) {
      setFormError("Password must contain at least 8 characters.");
      return;
    }

    if (editingUser && formData.password && formData.password.length < 8) {
      setFormError("Password must contain at least 8 characters if changing it.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingUser) {
        const updatePayload = {
          name: trimmedName,
          email: trimmedEmail,
          role: formData.role,
          isActive: formData.isActive,
        };

        if (formData.password) {
          updatePayload.password = formData.password;
        }

        const result = await updateUser(editingUser.id, updatePayload);
        setSuccessMessage(`User "${result.data.name}" updated successfully.`);
      } else {
        const createPayload = {
          name: trimmedName,
          email: trimmedEmail,
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive,
        };

        const result = await createUser(createPayload);
        setSuccessMessage(`User "${result.data.name}" created successfully.`);
      }

      resetForm();
      await fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(userToDelete) {
    if (userToDelete.id === currentUser?.id) {
      alert("You cannot delete your own logged-in account.");
      return;
    }

    const confirmMsg = `Are you sure you want to remove user "${userToDelete.name}" (${userToDelete.email})?\n\nIf this user has recorded sales transactions, their account will be deactivated instead of deleted.`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    setFormError(null);
    setSuccessMessage(null);

    try {
      const result = await deleteUser(userToDelete.id);
      if (result.data?.deactivated) {
        setSuccessMessage(result.data.message);
      } else {
        setSuccessMessage(`User "${userToDelete.name}" deleted successfully.`);
      }

      if (editingUser?.id === userToDelete.id) {
        resetForm();
      }
      await fetchUsers();
    } catch (err) {
      setFormError(err.message);
    }
  }

  if (isAuthLoading) {
    return null;
  }

  if (currentUser?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="page user-management-page">
      <div className="container user-management-layout">
        <section className="user-management-intro-section">
          <p className="pos-section-eyebrow">User Management</p>
          <h1 className="page-title">Users</h1>
          <p className="user-management-intro">
            Create, update, or deactivate system users. Assign roles to grant appropriate administrative or cashier permissions.
          </p>
        </section>

        {/* User Form Card (Create / Edit) */}
        <section className="user-form-card">
          <h2>{editingUser ? `Edit User: ${editingUser.name}` : "Create New User"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="user-name">
                Full Name
              </label>
              <input
                className="form-input"
                id="user-name"
                name="name"
                onChange={handleInputChange}
                placeholder="e.g. John Doe"
                required
                value={formData.name}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-email">
                Email Address
              </label>
              <input
                className="form-input"
                id="user-email"
                name="email"
                onChange={handleInputChange}
                placeholder="e.g. john@pos.local"
                required
                type="email"
                value={formData.email}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-password">
                Password {editingUser && <span className="user-form-optional">(Leave blank to keep unchanged)</span>}
              </label>
              <input
                className="form-input"
                id="user-password"
                name="password"
                onChange={handleInputChange}
                placeholder={editingUser ? "New password (optional)" : "Min. 8 characters"}
                required={!editingUser}
                type="password"
                value={formData.password}
              />
            </div>

            <div className="form-row-two-col">
              <div className="form-group">
                <label className="form-label" htmlFor="user-role">
                  Role
                </label>
                <select
                  className="form-input"
                  id="user-role"
                  name="role"
                  onChange={handleInputChange}
                  value={formData.role}
                >
                  <option value="CASHIER">Cashier</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group form-checkbox-group">
                <label className="checkbox-label" htmlFor="user-isActive">
                  <input
                    checked={formData.isActive}
                    disabled={editingUser?.id === currentUser?.id}
                    id="user-isActive"
                    name="isActive"
                    onChange={handleInputChange}
                    type="checkbox"
                  />
                  <span>Active Account</span>
                </label>
                {editingUser?.id === currentUser?.id && (
                  <span className="form-hint">You cannot deactivate your own account</span>
                )}
              </div>
            </div>

            {formError && <p className="form-error user-form-error">{formError}</p>}
            {successMessage && <p className="form-success user-form-success">{successMessage}</p>}

            <div className="user-form-actions">
              {editingUser && (
                <button className="btn btn-secondary" onClick={resetForm} type="button">
                  Cancel
                </button>
              )}
              <button className="btn btn-primary" disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </form>
        </section>

        {/* User List Card */}
        <section className="user-list-card">
          <div className="user-list-header">
            <div>
              <h2>System Users</h2>
              <span className="user-count-badge">{users.length} total</span>
            </div>
            <div className="user-list-filters">
              <input
                className="user-search-input"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                value={search}
              />
              <select
                className="user-role-select"
                onChange={(e) => setRoleFilter(e.target.value)}
                value={roleFilter}
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admins</option>
                <option value="CASHIER">Cashiers</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="user-list-state">Loading users...</p>
          ) : listError ? (
            <p className="form-error user-form-error">{listError}</p>
          ) : users.length === 0 ? (
            <p className="user-list-state">No users found.</p>
          ) : (
            <div className="user-list">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <article className={`user-list-item ${!u.isActive ? "user-item-inactive" : ""}`} key={u.id}>
                    <div className="user-item-avatar">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-item-details">
                      <div className="user-item-title-row">
                        <h3>{u.name}</h3>
                        {isSelf && <span className="user-badge-self">You</span>}
                        <span className={`user-badge-role ${u.role === "ADMIN" ? "role-admin" : "role-cashier"}`}>
                          {u.role}
                        </span>
                        <span className={`user-badge-status ${u.isActive ? "status-active" : "status-inactive"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="user-item-email">{u.email}</p>
                      <span className="user-item-meta">
                        Sales recorded: {u.salesCount || 0}
                      </span>
                    </div>
                    <div className="user-item-actions">
                      <button
                        className="user-edit-button"
                        onClick={() => startEditing(u)}
                        type="button"
                      >
                        Edit
                      </button>
                      {!isSelf && (
                        <button
                          className="user-delete-button"
                          onClick={() => handleDelete(u)}
                          type="button"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
