import React from 'react'
import { supabase } from '../config/supabaseClient';

function DashBoard() {
  const handleLogout = async () => {
    
    await supabase.auth.signOut()
  }
  return (
    <div>
      <header className="flex justify-between items-center pt-10 p-4  bg-[#111827]">
        <h1>My plans</h1>
        <i></i>

      </header>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default DashBoard
