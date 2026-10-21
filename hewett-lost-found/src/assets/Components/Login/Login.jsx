import { useRef, useState } from "react";
import Icon from "../Icons/Icon";
import { loginUser, requestPasswordReset, resetPassword, signupUser } from "../../../api";
import "./Login.css";

const Login = ({ auth, onAuthenticated, onLogout, recoveryToken, onRecoveryComplete }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const emailInputRef = useRef(null);

  const toggleForm = () => {
    setIsSignup((current) => !current);
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email").trim();
    const password = formData.get("password");
    const remember = Boolean(formData.get("remember"));

    if (isSignup) {
      const confirmPassword = formData.get("confirm-password");
      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      if (isSignup) {
        await signupUser({
          email,
          password,
          full_name: formData.get("full_name").trim(),
        });
      }

      const session = await loginUser(email, password);
      onAuthenticated(session, remember);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = emailInputRef.current?.value.trim();
    if (!email) {
      setMessage("Enter your email address first, then choose Forgot password.");
      emailInputRef.current?.focus();
      return;
    }

    setIsSendingReset(true);
    setMessage("");
    try {
      await requestPasswordReset(email);
      setMessage("If an account exists for that email, a password reset link has been sent.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSendingReset(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get("new-password");
    if (password !== formData.get("confirm-password")) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      await resetPassword(recoveryToken, password);
      setMessage("Password updated. You can now sign in with your new password.");
      event.currentTarget.reset();
      window.setTimeout(onRecoveryComplete, 1600);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (recoveryToken) {
    return (
      <section className="login-page" id="reset-password" aria-label="Set a new password">
        <form className="login-card reset-password-card" onSubmit={handlePasswordReset}>
          <div className="login-header">
            <span className="login-brand-icon"><Icon name="brand" size={22} /></span>
            <h2>Choose a new password</h2>
            <p>Enter a new password for your account.</p>
          </div>
          <label className="login-input-group">
            <span className="visually-hidden">New password</span>
            <input name="new-password" type="password" placeholder="New password" minLength={8} required />
          </label>
          <label className="login-input-group">
            <span className="visually-hidden">Confirm new password</span>
            <input name="confirm-password" type="password" placeholder="Confirm new password" minLength={8} required />
          </label>
          <button className="login-primary-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "PLEASE WAIT…" : "UPDATE PASSWORD"}
          </button>
          <p className="login-message" role="status">{message}</p>
        </form>
      </section>
    );
  }

  if (auth?.token) {
    return (
      <section className="login-page" id="login" aria-label="Account">
        <div className="login-card signed-in-card">
          <span className="login-brand-icon"><Icon name="brand" size={22} /></span>
          <h2>You’re signed in</h2>
          <p>{auth.user?.full_name || auth.user?.email}</p>
          <button className="login-primary-btn" type="button" onClick={onLogout}>SIGN OUT</button>
        </div>
      </section>
    );
  }

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
              <input ref={emailInputRef} name="email" type="email" placeholder="Email Address" autoComplete="email" required />
            </label>
            <label className="login-input-group">
              <span className="visually-hidden">Password</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
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
                <input name="remember" type="checkbox" />
                <span className="custom-checkbox" aria-hidden="true" />
                Remember me
              </label>
              <button
                className="forgot-link"
                type="button"
                onClick={handleForgotPassword}
                disabled={isSendingReset}
              >
                {isSendingReset ? "Sending…" : "Forgot password?"}
              </button>
            </div>

            <button className="login-primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "PLEASE WAIT…" : "LOGIN"}
            </button>
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
              <input name="full_name" type="text" placeholder="Full Name" autoComplete="name" required />
            </label>
            <label className="login-input-group">
              <span className="visually-hidden">Email address</span>
              <input name="email" type="email" placeholder="Email Address" autoComplete="email" required />
            </label>
            <label className="login-input-group">
              <span className="visually-hidden">Password</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
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
                name="confirm-password"
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

            <button className="login-primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "PLEASE WAIT…" : "CREATE ACCOUNT"}
            </button>
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
