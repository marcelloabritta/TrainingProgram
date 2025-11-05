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
import Settings from "./pages/Settings";
import ExerciseLibrary from "./pages/ExerciseLibrary";

function App() {
  const [session, setSession] = useState(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [loading, setLoading] = useState(true);

  if(loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111827] text-white">
        Loading...
      </div>
      );
  }

  return (
    <HeaderProvider>
      <AuthListener
        setSession={setSession}
        setIsPasswordRecovery={setIsPasswordRecovery}
        setLoading={setLoading}
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
                <Route
          path="/settings"
          element={
            session ? (
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
            session ? (
              <MainLayout>
                <ExerciseLibrary session={session} />
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
