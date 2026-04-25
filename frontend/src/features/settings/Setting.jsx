import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { updateProfile, changePassword } from "../../store/slices/authSlice.js";
import useAuth from "../../hooks/useAuth.js";
import "./Setting.css";

const Settings = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();

    // Profile form
    const [name, setName] = useState(user?.name || "");
    const [profileLoading, setProfileLoading] = useState(false);

    // Password form
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (name.trim() === user?.name) {
            toast.info("No changes to save");
            return;
        }
        setProfileLoading(true);
        const result = await dispatch(updateProfile({ name }));
        if (updateProfile.fulfilled.match(result)) {
            toast.success("Profile updated successfully");
        } else {
            toast.error(result.payload || "Failed to update profile");
        }
        setProfileLoading(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        setPasswordLoading(true);
        const result = await dispatch(
            changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            })
        );
        if (changePassword.fulfilled.match(result)) {
            toast.success("Password changed successfully");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } else {
            toast.error(result.payload || "Failed to change password");
        }
        setPasswordLoading(false);
    };

    const toggleShow = (field) =>
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

    return (
        <div className="settings-page">
            <div className="settings-grid">

                {/*  Profile  */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon">
                            <User size={18} />
                        </div>
                        <div>
                            <h2 className="settings-card-title">Profile</h2>
                            <p className="settings-card-desc">Update your display name</p>
                        </div>
                    </div>

                    <form className="settings-form" onSubmit={handleProfileSubmit}>
                        {/* Avatar preview */}
                        <div className="settings-avatar-row">
                            <div className="settings-avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="settings-avatar-info">
                                <span className="settings-avatar-name">{user?.name}</span>
                                <span className="settings-avatar-meta">
                                    {user?.email} · {user?.role}
                                </span>
                            </div>
                        </div>

                        <div className="settings-field">
                            <label className="settings-label">Display Name</label>
                            <input
                                className="settings-input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div className="settings-field">
                            <label className="settings-label">Email Address</label>
                            <input
                                className="settings-input settings-input-disabled"
                                type="email"
                                value={user?.email || ""}
                                disabled
                            />
                            <p className="settings-hint">Email cannot be changed</p>
                        </div>

                        <div className="settings-actions">
                            <button
                                className="btn-settings-save"
                                type="submit"
                                disabled={profileLoading}
                            >
                                {profileLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>

                {/*  Change Password  */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon">
                            <Lock size={18} />
                        </div>
                        <div>
                            <h2 className="settings-card-title">Change Password</h2>
                            <p className="settings-card-desc">Keep your account secure</p>
                        </div>
                    </div>

                    <form className="settings-form" onSubmit={handlePasswordSubmit}>
                        {[
                            { key: "current", label: "Current Password", field: "currentPassword" },
                            { key: "new", label: "New Password", field: "newPassword" },
                            { key: "confirm", label: "Confirm New Password", field: "confirmPassword" },
                        ].map(({ key, label, field }) => (
                            <div className="settings-field" key={key}>
                                <label className="settings-label">{label}</label>
                                <div className="settings-input-wrapper">
                                    <input
                                        className="settings-input settings-input-password"
                                        type={showPasswords[key] ? "text" : "password"}
                                        value={passwords[field]}
                                        onChange={(e) =>
                                            setPasswords((prev) => ({ ...prev, [field]: e.target.value }))
                                        }
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="settings-eye-btn"
                                        onClick={() => toggleShow(key)}
                                        tabIndex={-1}
                                    >
                                        {showPasswords[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="settings-actions">
                            <button
                                className="btn-settings-save"
                                type="submit"
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? "Changing..." : "Change Password"}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Settings;