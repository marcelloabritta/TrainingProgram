import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import InputField from "../../components/InputField";
import Logo from "../../assets/logo.png";
import SecondaryLink from "../../components/SecondaryLink";
import FeedbackMessage from "../../components/FeedbackMessage";
import PrimaryButton from "../../components/PrimaryButton";
import AuthForm from "../../components/AuthForm";

function UpdatePassword({ setIsPasswordRecovery }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (newPassword != confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setIsError(false);
      setMessage("Password updated successfully!");
      setTimeout(() => {
        setIsPasswordRecovery(false);
        navigate("/");
      }, 2000);
    }
  };
  return (
    <AuthForm onSubmit={handleUpdatePassword}>
      <div className="flex flex-col items-center gap-4 text-center">
        <img src={Logo} alt="Logo" className="h-14 w-14" />
        <h1 className="text-3xl text-white">
          <span>Create a New</span>
          <span className="block font-bold">Password</span>
        </h1>
      </div>

      <InputField
        label="NEW PASSWORD"
        type="password"
        placeholder="new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <InputField
        label="CONFIRM NEW PASSWORD"
        type="password"
        placeholder="confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <FeedbackMessage message={message} isError={isError} />

      <PrimaryButton>SET NEW PASSWORD</PrimaryButton>

      <SecondaryLink to="/" className="text-center">
        Back to Login
      </SecondaryLink>
    </AuthForm>
  );
}

export default UpdatePassword;
