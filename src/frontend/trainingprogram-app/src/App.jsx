import { useState } from "react";
import "./App.css";
import Login from "./pages/auth/Login";
import DashBoard from "./pages/DashBoard";
import ForgotPassword from "./pages/auth/ForgotPassword";
import { Navigate, Route, Routes } from "react-router-dom";
import UpdatePassword from "./pages/auth/UpdatePassword";
import Register from "./pages/auth/Register";
import CreatePlan from "./pages/CreatePlan";
import PlanDetails from "./pages/PlanDetails";
import MainLayout from "./components/layout/MainLayout";
import WeekDetails from "./pages/WeekDetails";
import { HeaderProvider } from "./context/HeaderContext";
import AuthListener from "./components/auth/AuthListener";
import TrainingSessionDetails from "./pages/TrainingSessionDetails";

function App() {
  const [session, setSession] = useState(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  return (
    <HeaderProvider>
      <AuthListener
        setSession={setSession}
        setIsPasswordRecovery={setIsPasswordRecovery}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/sign-up" element={<Register />} />
        <Route
          path="update-password"
          element={
            isPasswordRecovery ? (
              <UpdatePassword setIsPasswordRecovery={setIsPasswordRecovery} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            session ? (
              <MainLayout>
                <DashBoard session={session} />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/create-plan"
          element={
            session ? (
              <MainLayout>
                <CreatePlan session={session} />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/dashboard/:planId"
          element={
            session ? (
              <MainLayout>
                <PlanDetails session={session} />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/plan/:planId/week/:weekNumber"
          element={
            session ? (
              <MainLayout>
                <WeekDetails session={session} />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/plan/:planId/session/:sessionId"
          element={
            session ? (
              <MainLayout>
                <TrainingSessionDetails session={session} />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </HeaderProvider>
  );
}

export default App;
