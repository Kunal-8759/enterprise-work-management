import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { loginSchema } from "../utils/validator.js";
import { loginUser } from "../store/slices/authSlice.js";
import useAuth from "../hooks/useAuth.js";

import "./Login.css";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error, resetError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated]);


    const onSubmit = async (formData) => {
        console.log("Form submitted:", formData); // add this

        const { rememberMe, ...credentials } = formData;

        const result = await dispatch(loginUser(credentials));


        if (loginUser.fulfilled.match(result)) {
            if (rememberMe) {
                localStorage.setItem("accessToken", result.payload.accessToken);
            } else {
                sessionStorage.setItem("accessToken", result.payload.accessToken);
            }
            toast.success("Welcome back!");
            navigate("/dashboard");
        }


        if (loginUser.rejected.match(result)) {
            toast.error(result.payload || "Login failed");
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your account to continue"
        >
            <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
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

                {/* Remember Me */}
                <div className="form-footer">
                    <label className="remember-me">
                        <input type="checkbox" {...register("rememberMe")} />
                        Remember me
                    </label>
                </div>

                {/* Submit */}
                <button type="submit" className="btn-auth" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                {/* Redirect */}
                <p className="auth-divider">
                    Don't have an account?{" "}
                    <Link to="/signup" className="auth-link">
                        Create one
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Login;