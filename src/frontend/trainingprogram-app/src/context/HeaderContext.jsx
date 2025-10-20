import React, { createContext, useState, useContext } from 'react';

const HeaderContext = createContext();

export function HeaderProvider({ children }) {
  const [title, setTitle] = useState("My App"); 
  const [showBackButton, setShowBackButton] = useState(false);

  const value = { title, setTitle, showBackButton, setShowBackButton };
  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
}


export function useHeader() {
  return useContext(HeaderContext);
}