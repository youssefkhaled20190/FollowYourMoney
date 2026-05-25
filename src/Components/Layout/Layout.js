import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    // Detect screen size changes
    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
            
            // Close sidebar when switching to mobile/tablet
            if (!desktop) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(open => !open);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    isSidebarOpen={isSidebarOpen} 
                    closeSidebar={closeSidebar}
                    isDesktop={isDesktop}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 overflow-y-auto mt-16 md:mt-20 lg:mt-24">
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default Layout;