import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";

const UserContext = React.createContext();

// set axios to include credentials with every request
axios.defaults.withCredentials = true;

export const UserContextProvider = ({ children }) => {
  const serverUrl = "https://tmbackend-4.onrender.com";  
  const router = useRouter();
  const [user, setUser] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [userState, setUserState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // register user
  const registerUser = async (e) => {
    e.preventDefault();
    if (
      !userState.email.includes("@") ||
      !userState.password ||
      userState.password.length < 6
    ) {
      toast.error("Please enter a valid email and password (min 6 characters)");
      return;
    }

    try {
      const res = await axios.post(`${serverUrl}/api/v1/register`, userState);
      console.log("User registered successfully", res.data);
      toast.success("User registered successfully");

      // clear the form
      setUserState({
        name: "",
        email: "",
        password: "",
      });

      // redirect to login page
      router.push("/login");
    } catch (error) {
      console.log("Error registering user", error);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
    }
  };

  // login the user
  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/login`,
        {
          email: userState.email,
          password: userState.password,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("User logged in successfully");

      // clear the form
      setUserState({
        email: "",
        password: "",
      });

      // refresh the user details
      await getUser(); // fetch before redirecting

      // push user to the dashboard page
      router.push("/");
    } catch (error) {
      console.log("Error logging in user", error);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
    }
  };

  // get user login status
  const userLoginStatus = async () => {
    let loggedIn = false;
    try {
      const res = await axios.get(`${serverUrl}/api/v1/login-status`, {
        withCredentials: true,
      });

      loggedIn = !!res.data;
      setLoading(false);

      if (!loggedIn) {
        router.push("/login");
      }
    } catch (error) {
      console.log("Error getting user login status", error);
    }

    return loggedIn;
  };

  // logout user
  const logoutUser = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/v1/logout`, {
        withCredentials: true,
      });

      toast.success("User logged out successfully");
      setUser({});
      router.push("/login");
    } catch (error) {
      console.log("Error logging out user", error);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
    }
  };

  // get user details
  const getUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/v1/user`, {
        withCredentials: true,
      });

      setUser((prevState) => ({
        ...prevState,
        ...res.data,
      }));

      setLoading(false);
    } catch (error) {
      console.log("Error getting user details", error);
      setLoading(false);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
    }
  };

  // update user details
  const updateUser = async (e, data) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.patch(`${serverUrl}/api/v1/user`, data, {
        withCredentials: true,
      });

      setUser((prevState) => ({
        ...prevState,
        ...res.data,
      }));

      toast.success("User updated successfully");
      setLoading(false);
    } catch (error) {
      console.log("Error updating user details", error);
      setLoading(false);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
    }
  };

  // email verification
  const emailVerification = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/v1/verify-email`,
        {},
        {
          withCredentials: true,
        }
      );

      toast.success("Email verification sent successfully");
      setLoading(false);
    } catch (error) {
      console.log("Error sending email verification", error);
      setLoading(false);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
    }
  };

  // verify user/email
  const verifyUser = async (token) => {
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/v1/verify-user/${token}`,
        {},
        {
          withCredentials: true,
        }
      );

      toast.success("User verified successfully");
      getUser();
      setLoading(false);
      router.push("/");
    } catch (error) {
      console.log("Error verifying user", error);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
      setLoading(false);
    }
  };

  // forgot password email
  const forgotPasswordEmail = async (email) => {
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/v1/forgot-password`,
        { email },
        { withCredentials: true }
      );

      toast.success("Forgot password email sent successfully");
      setLoading(false);
    } catch (error) {
      console.log("Error sending forgot password email", error);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
      setLoading(false);
    }
  };

  // reset password
  const resetPassword = async (token, password) => {
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/v1/reset-password/${token}`,
        { password },
        { withCredentials: true }
      );

      toast.success("Password reset successfully");
      setLoading(false);
      router.push("/login");
    } catch (error) {
      console.log("Error resetting password", error);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
      setLoading(false);
    }
  };

  // change password
  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      await axios.patch(
        `${serverUrl}/api/v1/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );

      toast.success("Password changed successfully");
      setLoading(false);
    } catch (error) {
      console.log("Error changing password", error);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
      setLoading(false);
    }
  };

  // admin routes
  const getAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${serverUrl}/api/v1/admin/users`, {
        withCredentials: true,
      });

      setAllUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.log("Error getting all users", error);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
      setLoading(false);
    }
  };

  // dynamic form handler
  const handlerUserInput = (name) => (e) => {
    const value = e.target.value;

    setUserState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // delete user
  const deleteUser = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${serverUrl}/api/v1/admin/users/${id}`, {
        withCredentials: true,
      });

      toast.success("User deleted successfully");
      setLoading(false);
      getAllUsers();
    } catch (error) {
      console.log("Error deleting user", error);
      const message = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loginStatusGetUser = async () => {
      const isLoggedIn = await userLoginStatus();

      if (isLoggedIn) {
        await getUser();
      }
    };

    loginStatusGetUser();
  }, []);

  useEffect(() => {
    if (user.role === "admin") {
      getAllUsers();
    }
  }, [user.role]);

  return (
    <UserContext.Provider
      value={{
        registerUser,
        userState,
        handlerUserInput,
        loginUser,
        logoutUser,
        userLoginStatus,
        user,
        updateUser,
        emailVerification,
        verifyUser,
        forgotPasswordEmail,
        resetPassword,
        changePassword,
        allUsers,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};
