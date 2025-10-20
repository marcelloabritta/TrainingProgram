import React, { useState } from "react";
import Logo from "../../assets/logo.png";
import { supabase } from "../../config/supabaseClient";
import InputField from "../../components/ui/InputField";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryLink from "../../components/ui/SecondaryLink";
import FeedbackMessage from "../../components/ui/FeedbackMessage";
import AuthForm from "../../components/auth/AuthForm";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setIsError(false);
      setMessage("Check your email for the recovery link.");
    }
  };
  return (
        <AuthForm onSubmit={handlePasswordReset}>
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={Logo} alt="Logo" className="h-14 w-14" />
          <h1 className="text-3xl text-white">
            <span>Reset Your</span>
            <span className="block font-bold">Password</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            No worries, it happens. <br/> Enter your email below and we'll send you a
            recovery link.
          </p>
        </div>

        <InputField
          label=""
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex flex-col gap-4">
          <FeedbackMessage message={message} isError={isError} />

          <PrimaryButton>SEND RECOVERY LINK</PrimaryButton>

          <SecondaryLink className="text-center" to="/">
            Back to login
          </SecondaryLink>
        </div>

        </AuthForm>
  );
}

export default ForgotPassword;
