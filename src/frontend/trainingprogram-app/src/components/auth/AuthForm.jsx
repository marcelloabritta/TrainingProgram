import React from 'react'

function AuthForm({onSubmit, children}) {
  return (
    <div className="flex h-screen items-center justify-center">
      <form className="flex flex-col gap-4 rounded-3xl bg-[#111827] p-8 shadow-lg" onSubmit={onSubmit}>
        {children}
      </form>
    </div>
  )
}

export default AuthForm
