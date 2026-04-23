import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { registerSchema } from "../utils/validator.js";
import { registerUser } from "../store/slices/authSlice.js";
import useAuth from "../hooks/useAuth.js";

import "./Signup.css"

const Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error, resetError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });


    const onSubmit = async (formData) => {
        const { confirmPassword, ...userData } = formData;

        const result = await dispatch(
            registerUser({ ...userData, role: "Employee" })
        );

        if (registerUser.fulfilled.match(result)) {
            toast.success("Account created successfully!");
            navigate("/login");
        }
    };

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Get started with Enterprise WMS today"
        >
            <form className="signup-form" onSubmit={handleSubmit(onSubmit)}>
                {/* Name */}
                <div className="form-group">
                    <label className="form-label">Full name</label>
                    <input
                        type="text"
                        className={`input-field ${errors.name ? "input-field-error" : ""}`}
                        placeholder="Kunal Kumar"
                        {...register("name")}
                    />
                    {errors.name && (
                        <span className="input-error">{errors.name.message}</span>
                    )}
                </div>

                {/* Email */}
                <div className="form-group">
                    <label className="form-label">Email address</label>
                    <input
                        type="email"
                        className={`input-field ${errors.email ? "input-field-error" : ""}`}
                        placeholder="you@example.com"
                        {...register("email")}
                    />
                    {errors.email && (
                        <span className="input-error">{errors.email.message}</span>
                    )}
                </div>

                {/* Password */}
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className={`input-field ${errors.password ? "input-field-error" : ""}`}
                        placeholder="••••••••"
                        {...register("password")}
                    />
                    {errors.password && (
                        <span className="input-error">{errors.password.message}</span>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                    <label className="form-label">Confirm password</label>
                    <input
                        type="password"
                        className={`input-field ${errors.confirmPassword ? "input-field-error" : ""}`}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <span className="input-error">{errors.confirmPassword.message}</span>
                    )}
                </div>

                {/* Submit */}
                <button type="submit" className="btn-auth" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                </button>

                {/* Redirect */}
                <p className="auth-divider">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Signup;