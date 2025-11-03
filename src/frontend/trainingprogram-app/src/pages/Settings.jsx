import React, { useEffect, useState } from "react";
import { useHeader } from "../context/HeaderContext";
import InputField from "../components/ui/InputField";
import { supabase } from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import PrimaryButton from "../components/ui/PrimaryButton";
import FeedbackMessage from "../components/ui/FeedbackMessage";

function Settings({ session }) {
  const { setTitle, setShowBackButton } = useHeader();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileIsError, setProfileIsError] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordIsError, setPasswordIsError] = useState(false);

  useEffect(() => {
    setTitle("Settings");
    setShowBackButton(true);

    if (session && session.user) {
      setEmail(session.user.email);

      setName(session.user.user_metadata?.full_name || "");
    }

    return () => setShowBackButton(false);
  }, [setTitle, setShowBackButton, session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const clearMessages = () => {
    setProfileMessage("");
    setPasswordMessage("");
    setProfileIsError(false);
    setPasswordIsError(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const updates = {
        email: email,
        data: {
          full_name: name,
        },
      };

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      setProfileMessage("Profile updated successfully!"); // Seta a MENSAGEM DO PERFIL
      setProfileIsError(false);

      if (email !== session.user.email) {
        setProfileMessage(
          "Profille updated!Please check your new email address to confirm the change."
        );
      }
    } catch (err) {
      setProfileMessage(err.message);
      setProfileIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (newPassword != confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      setPasswordIsError(true);
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters long.");
      setPasswordIsError(true);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordMessage("Password updated successfully!");
      setPasswordIsError(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage(err.message);
      setPasswordIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-[#1f2937] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">My Account</h2>
        <form onSubmit={handleUpdateProfile}>
          <InputField
            type="text"
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 bg-[#303E52] mb-5"
            labelClassName="text-1xl"
          />
          <InputField
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 bg-[#303E52] mb-5"
            labelClassName="text-1xl"
          />
          {profileMessage && <FeedbackMessage isError={profileIsError} message={profileMessage}/> }
          <PrimaryButton className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </PrimaryButton>
        </form>
      </div>
      <div className="bg-[#1f2937] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">
          Change Your Password
        </h2>
        <form onSubmit={handleUpdatePassword}>
          <InputField
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="p-3 bg-[#303E52] mb-5"
            labelClassName="text-1xl"
          />
          <InputField
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 bg-[#303E52] mb-5"
            labelClassName="text-1xl"
          />
          {passwordMessage && <FeedbackMessage isError={passwordIsError} message={passwordMessage}/> }
          <PrimaryButton className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </PrimaryButton>
        </form>
      </div>

      <div className=" flex justify-center md:hidden">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer text-white "
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Settings;
