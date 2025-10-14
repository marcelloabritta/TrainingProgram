import { useState } from "react";
import Logo from "../../assets/logo.png";
import { supabase } from "./../../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryLink from "../../components/SecondaryLink";
import FeedbackMessage from "../../components/FeedbackMessage";
import AuthForm from "../../components/AuthForm";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsError(true);
      setMessage("Incorrect email or password.");
    } else {
      setIsError(false);
      navigate("/dashboard");
    }
  };

  return (
    <AuthForm onSubmit={handleLogin}>
      <div className="flex justify-center items-center gap-0 ">
        <img src={Logo} alt="" className="h-15 w-15" />
        <h1 className="text-center text-3xl text-white font-bold ">Sign In</h1>
      </div>

      <InputField
        label="EMAIL"
        type="email"
        placeholder="you@example.com"
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

      <div className="flex flex-col gap-1">
        <FeedbackMessage message={message} isError={isError} />

        <SecondaryLink to="/forgot-password">
          Forgot your password?
        </SecondaryLink>

        <PrimaryButton>SIGN IN</PrimaryButton>

        <SecondaryLink to="/sign-up">
          Don't have an account? Sign Up
        </SecondaryLink>
      </div>
    </AuthForm>
  );
}

export default Login;
