import { useState } from "react";
import Icon from "../Icons/Icon";
import "./Login.css";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  const toggleForm = () => {
    setIsSignup((current) => !current);
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("Authentication is not connected yet.");
  };

  return (
    <section className="login-page" id="login" aria-label="Login or create account">
      <div className={`login-card ${isSignup ? "show-signup" : ""}`}>
        <div className="login-card-inner">
          <form
            className="login-form login-section"
            onSubmit={handleSubmit}
            inert={isSignup}
            aria-hidden={isSignup}
          >
            <div className="login-header">
              <span className="login-brand-icon"><Icon name="brand" size={22} /></span>
              <h2>Welcome</h2>
              <p>Login to continue your journey</p>
            </div>

            <label className="login-input-group">
              <span className="visually-hidden">Email address</span>
              <input type="email" placeholder="Email Address" autoComplete="email" required />
            </label>
            <label className="login-input-group">
              <span className="visually-hidden">Password</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </label>

            <div className="login-options">
              <label className="remember-option">
                <input type="checkbox" />
                <span className="custom-checkbox" aria-hidden="true" />
                Remember me
              </label>
              <a href="#contact" className="forgot-link">Forgot password?</a>
            </div>

            <button className="login-primary-btn" type="submit">LOGIN</button>
            <p className="login-message" role="status">{message}</p>
            <div className="login-social">
              <p>Or continue with</p>
              <div className="login-social-icons" aria-label="Social sign-in options">
                <button type="button" aria-label="Google sign in">G</button>
                <button type="button" aria-label="Facebook sign in">f</button>
                <button type="button" aria-label="LinkedIn sign in">in</button>
              </div>
            </div>
            <p className="login-switch-prompt">
              Don&apos;t have an account? Use the plus button to sign up.
            </p>
          </form>

          <form
            className="login-form signup-section"
            onSubmit={handleSubmit}
            inert={!isSignup}
            aria-hidden={!isSignup}
          >
            <div className="login-header">
              <span className="login-brand-icon"><Icon name="brand" size={22} /></span>
              <h2>Create Account</h2>
              <p>Start your journey with us</p>
            </div>

            <label className="login-input-group">
              <span className="visually-hidden">Full name</span>
              <input type="text" placeholder="Full Name" autoComplete="name" required />
            </label>
            <label className="login-input-group">
              <span className="visually-hidden">Email address</span>
              <input type="email" placeholder="Email Address" autoComplete="email" required />
            </label>
            <label className="login-input-group">
              <span className="visually-hidden">Password</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </label>
            <label className="login-input-group">
              <span className="visually-hidden">Confirm password</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showConfirmPassword ? "Hide confirmation" : "Show confirmation"}
                onClick={() => setShowConfirmPassword((visible) => !visible)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </label>

            <button className="login-primary-btn" type="submit">CREATE ACCOUNT</button>
            <p className="login-message" role="status">{message}</p>
            <p className="login-switch-prompt">
              Already have an account? Use the cross button to return to login.
            </p>
          </form>
        </div>

        <button
          className={`login-toggle-btn ${isSignup ? "is-close" : ""}`}
          type="button"
          onClick={toggleForm}
          aria-label={isSignup ? "Back to login" : "Create an account"}
          aria-pressed={isSignup}
        >
          {isSignup ? "×" : "+"}
        </button>
      </div>
    </section>
  );
};

export default Login;
