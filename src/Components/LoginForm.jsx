import React, { useState } from "react";
import axios from "axios";
import './LoginForm.css'; // Use the updated CSS file
import { useNavigate, Link } from "react-router-dom"; // Import Link
import Lottie from "lottie-react";
import loginAnimation from "../login-animation.json"; // Ensure path is correct

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false); // To style message as error/success
  // Removed profile state as it wasn't displayed after message

  const ADMIN_EMAIL = "admin@example.com"; // Use environment variables for sensitive data
  const ADMIN_PASSWORD = "admin123";

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setIsError(false);

    // Basic Frontend Validation (optional but recommended)
    if (!email || !password) {
      setMessage("Email and Password are required.");
      setIsError(true);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email) && email !== ADMIN_EMAIL) { // Simple email format check
      setMessage("Please enter a valid email address.");
      setIsError(true);
      return;
    }


    // --- Admin check ---
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setMessage("Admin login successful! Redirecting...");
      setIsError(false);
      localStorage.setItem("token", "admin-token"); // Consider more secure token handling
      localStorage.setItem("userRole", "admin"); // Store role if needed elsewhere
      setTimeout(() => navigate("/admin-dashboard"),1000); // Redirect after message
      return;
    }

    // --- Sponsor/Influencer login ---
    try {
      const response = await axios.post("http://localhost:2020/api/auth/login", { // Use environment variable for API URL
        email,
        password,
      });

      // Assuming login endpoint returns token AND user info (like role)
      const { token, user } = response.data; // Adjust based on your actual API response

      if (!token || !user || !user.role) {
        throw new Error("Invalid response from server."); // Handle incomplete data
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", user.role); // Store role

      setMessage("Login successful! Redirecting...");
      setIsError(false);

      // Redirect based on role from login response
      setTimeout(() => {
        if (user.role === "sponsor") {
          navigate("/sponsor-dashboard/home");
        } else if (user.role === "influencer") {
          navigate("/influencer/dashboard"); // Ensure this route exists
        } else {
          // Handle unexpected roles or redirect to a default page
          navigate("/");
        }
      }, 1500); // Redirect after showing message

    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      // Set user-friendly error message
      setMessage(error.response?.data?.message || "Login failed. Please check your credentials or try again later.");
      setIsError(true);
    }
  };


  return (
    <div className="login-wrapper">
      {/* Left side with animation */}
      <div className="login-left">
        <Lottie animationData={loginAnimation} loop={true} className="lottie-animation" />
      </div>

      {/* Right side with the form */}
      <div className="login-right">
        <div className="form-container">
          <h2>Welcome Back 👋</h2>
          <p className="subtitle">Please enter your details to sign in.</p>

          {/* Display Login Message */}
          {message && (
            <p className={`message ${isError ? 'error' : 'success'}`}>
              {message}
            </p>
          )}

          <form onSubmit={handleLogin} className="login-form" noValidate>
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className="input-field" // Use the consistent input class
                aria-label="Email Address"
              />
              {/* Optional: Add frontend validation message display here if needed */}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="input-field" // Use the consistent input class
                aria-label="Password"
              />
              {/* Optional: Add frontend validation message display here if needed */}
            </div>

            {/* Submit Button */}
            <button type="submit" className="primary-btn">
              Login
            </button>
          </form>

          {/* Link to Sign Up Page */}
          <p className="extra-link">
            Don't have an account?{' '}
            <Link to="/signup"> {/* Use Link component for internal navigation */}
              Sign Up
            </Link>
          </p>

          {/* Removed profile display div */}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;