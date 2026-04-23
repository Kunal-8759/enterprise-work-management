import { useSelector, useDispatch } from "react-redux";
import { clearError, logoutUser } from "../store/slices/authSlice.js";

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector(state => state.auth);

  const logout = () => dispatch(logoutUser());
  const resetError = () => dispatch(clearError());

  return {
    user,
    isAuthenticated,
    loading,
    error,
    logout,
    resetError,
  };
};

export default useAuth;