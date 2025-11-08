import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import ImageUpload from "../../components/ImageUpload";
import {
  XCircle,
  CheckCircle,
  PencilSimple,
  Prohibit,
  Trash,
  FloppyDisk,
  Image as ImageIcon,
  User,
  Storefront,
  Crown,
} from "phosphor-react";

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "buyer",
    isActive: true,
    avatarURL: "",
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setFormData({
          username: userData.username || "",
          email: userData.email || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          phone: userData.phone || "",
          role: userData.role || "buyer",
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          avatarURL: userData.avatarURL || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error(error.response?.data?.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/admin/users/${id}`, formData);
      if (response.data.success) {
        toast.success("User updated successfully!");
        setUser(response.data.data);
        setEditing(false);
        fetchUser();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await api.delete(`/admin/users/${id}`);
      if (response.data.success) {
        toast.success("User deleted successfully!");
        navigate("/admin/users");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleStatusToggle = async () => {
    try {
      const response = await api.put(`/admin/users/${id}/status`, {
        isActive: !user.isActive,
      });
      if (response.data.success) {
        toast.success(
          `User ${!user.isActive ? "activated" : "deactivated"} successfully!`
        );
        fetchUser();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleRoleChange = async (newRole) => {
    try {
      const response = await api.put(`/admin/users/${id}/role`, {
        role: newRole,
      });
      if (response.data.success) {
        toast.success("User role updated successfully!");
        fetchUser();
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "seller":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center py-16">
          <XCircle
            size={64}
            weight="fill"
            className="text-red-500 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <Link to="/admin/users" className="btn-primary inline-block">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/users"
          className="text-blue-600 hover:text-blue-800 font-semibold mb-4 inline-flex items-center"
        >
          ← Back to Users
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarURL || "https://via.placeholder.com/150"}
              alt={user.username}
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
            />
            <div>
              <h1 className="text-3xl font-bold">
                {user.username || user.email}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
                {user.emailVerified && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle size={14} weight="fill" /> Email Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <PencilSimple size={16} weight="bold" /> Edit
                </button>
                <button
                  onClick={handleStatusToggle}
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                    user.isActive
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {user.isActive ? (
                    <>
                      <Prohibit size={16} weight="bold" /> Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} weight="fill" /> Activate
                    </>
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash size={16} weight="bold" /> Delete
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    username: user.username || "",
                    email: user.email || "",
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                    phone: user.phone || "",
                    role: user.role || "buyer",
                    isActive: user.isActive,
                    avatarURL: user.avatarURL || "",
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">User Information</h2>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <ImageUpload
                  currentImage={formData.avatarURL}
                  onImageChange={(url) =>
                    setFormData((prev) => ({ ...prev, avatarURL: url }))
                  }
                  label="User Avatar"
                />

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Active Account
                  </label>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <FloppyDisk size={20} weight="fill" /> Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Avatar Display with Change Button */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src={user.avatarURL || "https://via.placeholder.com/150"}
                      alt={user.username || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2">
                      Profile Picture
                    </label>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <ImageIcon size={18} weight="duotone" /> Change Image
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Username
                    </label>
                    <p className="text-lg mt-1">
                      {user.username || (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Email
                    </label>
                    <p className="text-lg mt-1">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      First Name
                    </label>
                    <p className="text-lg mt-1">
                      {user.firstName || (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Last Name
                    </label>
                    <p className="text-lg mt-1">
                      {user.lastName || (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      Phone
                    </label>
                    <p className="text-lg mt-1">
                      {user.phone || (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">
                      User ID
                    </label>
                    <p className="text-lg mt-1 font-mono text-sm">{user._id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Addresses */}
          {user.addresses && user.addresses.length > 0 && (
            <div className="card mt-6">
              <h2 className="text-2xl font-bold mb-6">Saved Addresses</h2>
              <div className="space-y-4">
                {user.addresses.map((address, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{address.fullName}</h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{address.phone}</p>
                    <p className="text-gray-700">{address.street}</p>
                    <p className="text-gray-700">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-gray-700">{address.country}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Quick Actions */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleRoleChange("buyer")}
                disabled={user.role === "buyer"}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center gap-2"
              >
                <User size={18} weight="duotone" /> Set as Buyer
              </button>
              <button
                onClick={() => handleRoleChange("seller")}
                disabled={user.role === "seller"}
                className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center gap-2"
              >
                <Storefront size={18} weight="duotone" /> Set as Seller
              </button>
              <button
                onClick={() => handleRoleChange("admin")}
                disabled={user.role === "admin"}
                className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center gap-2"
              >
                <Crown size={18} weight="duotone" /> Set as Admin
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Member Since
                </label>
                <p className="text-lg mt-1">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Last Updated
                </label>
                <p className="text-lg mt-1">
                  {new Date(user.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {user.lastLogin && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Last Login
                  </label>
                  <p className="text-lg mt-1">
                    {new Date(user.lastLogin).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
