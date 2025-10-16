import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './config/supabaseClient';
import Login from './pages/auth/Login';
import DashBoard from './pages/DashBoard';
import ForgotPassword from './pages/auth/ForgotPassword';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import UpdatePassword from './pages/auth/UpdatePassword';
import Register from './pages/auth/Register';
import CreatePlan from './pages/CreatePlan';

function App() {
  const [session, setSession] = useState(null); 
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const navigate = useNavigate();

   useEffect (() => {
    supabase.auth.getSession().then((result) => setSession(result.data.session))

    const {data : {subscription}} = supabase.auth.onAuthStateChange((event,session) => {
      if(event === "PASSWORD_RECOVERY"){
        setIsPasswordRecovery(true);
        navigate('/update-password')
      }
      setSession (session)
    })

    return() => {
      subscription.unsubscribe();
    };
   }, [navigate])

  return (
    <Routes>
      <Route path = "/" element = {<Login/>} />
      <Route path = "/forgot-password" element = {<ForgotPassword/>} />
      <Route path="/sign-up" element={<Register />} />
      <Route path = "update-password" element = {isPasswordRecovery? <UpdatePassword setIsPasswordRecovery={setIsPasswordRecovery}/> : <Navigate to ="/"/>} />
      <Route path='/dashboard' element={session? <DashBoard session={session} /> : <Navigate to ="/"/>} />
      <Route path='/create-plan' element={session? <CreatePlan session={session} /> : <Navigate to ="/"/>} />
    </Routes>
  )
}

export default App
