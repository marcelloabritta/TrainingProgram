import React from "react";
import { useLocation } from "react-router-dom";
import SideBar from "./SideBar";
import Header from "./Header";
import MobileFooter from "./MobileFooter";
import { useHeader } from "../../context/HeaderContext";

function MainLayout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { title } = useHeader();
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="hidden md:block flex-shrink-0">
        <SideBar />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex-shrink-0">
          <Header title={title} />
        </header>

        <main className="flex-grow overflow-y-auto p-6">
          {children}
        </main>

        <footer className="flex-shrink-0">
          <MobileFooter currentPath={currentPath} />
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;
