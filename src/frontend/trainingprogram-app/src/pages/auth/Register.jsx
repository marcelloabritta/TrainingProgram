import AuthForm from "../../components/auth/AuthForm";
import InputField from "../../components/ui/InputField";
import Logo from "../../assets/logo.png";
import { useState } from "react";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryLink from "../../components/ui/SecondaryLink";
import { supabase } from "../../config/supabaseClient";
import FeedbackMessage from "../../components/ui/FeedbackMessage";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (password != confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setIsError(false);
      setMessage(
        "Success! Please check your email for a confirmation link to complete your registration."
      );
    }
  };
  return (
    <AuthForm onSubmit={handleRegister}>
      <div className="flex flex-col items-center gap-4 text-center ">
        <img src={Logo} alt="" className="h-14 w-14" />
        <h1 className="text-center text-3xl text-white font-bold ">Sign Up</h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome! Let's get you set up with a new account.
        </p>
      </div>

      <InputField
        label="EMAIL"
        type="email"
        placeholder="you@example"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <InputField
        label="PASSWORD"
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <InputField
        label="CONFIRM PASSWORD"
        type="password"
        placeholder="confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <FeedbackMessage message={message} isError={isError} />

        <PrimaryButton>SIGN UP</PrimaryButton>

        <SecondaryLink to="/" className="text-center">
          Back to login
        </SecondaryLink>
      </div>
    </AuthForm>
  );
}

export default Register;
