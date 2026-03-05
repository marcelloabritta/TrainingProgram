import { useState } from "react";
import "./App.css";
import Login from "./pages/auth/Login";
import DashBoard from "./pages/DashBoard";
import ForgotPassword from "./pages/auth/ForgotPassword";
import { Navigate, Route, Routes } from "react-router-dom";
import UpdatePassword from "./pages/auth/UpdatePassword";
import Register from "./pages/auth/Register";
import PlanDetails from "./pages/PlanDetails";
import MainLayout from "./components/layout/MainLayout";
import WeekDetails from "./pages/WeekDetails";
import { HeaderProvider } from "./context/HeaderContext";
import AuthListener from "./components/auth/AuthListener";
import TrainingSessionDetails from "./pages/TrainingSessionDetails";
import Settings from "./pages/Settings";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  return (
    <HeaderProvider>
      <AuthListener
        setSession={setSession}
        setIsLoading={setIsLoading}
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
            isLoading ? null : session ? (
              <MainLayout>
                <DashBoard session={session} />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/dashboard/:planId"
          element={
            isLoading ? null : session ? (
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
            isLoading ? null : session ? (
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
            isLoading ? null : session ? (
              <MainLayout>
                <TrainingSessionDetails session={session} />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isLoading ? null : session ? (
              <MainLayout>
                <Settings session={session} />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/library"
          element={
            isLoading ? null : session ? (
              <MainLayout>
                <ExerciseLibrary session={session} />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/analytics"
          element={
            isLoading ? null : session ? (
              <MainLayout>
                <Analytics session={session} />
              </MainLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HeaderProvider>
  );
}

export default App;
