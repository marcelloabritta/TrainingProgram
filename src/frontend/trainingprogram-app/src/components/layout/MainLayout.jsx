import React from 'react'
import { useLocation } from 'react-router-dom'
import SideBar from './SideBar';
import Header from './Header';
import MobileFooter from './MobileFooter';

function MainLayout({children, headerTitle}) {
    const location = useLocation();
    const currentPath = location.pathname;
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="hidden md:block flex-shrink-0">
        <SideBar />
      </div>

      <div className="flex flex-col flex-grow overflow-hidden">
        <header className="flex-shrink-0">
          <Header title={headerTitle} />     
        </header>
          <main className="flex-grow overflow-y-auto p-6">
          {children} 
        </main>
        <footer className="flex-shrink-0">
          <MobileFooter currentPath={currentPath} />
        </footer>
      </div>
    </div>
  )
}

export default MainLayout
