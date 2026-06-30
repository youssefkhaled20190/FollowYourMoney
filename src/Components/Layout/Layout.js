import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

/** Breakpoint matching the Tailwind `tab-lg` screen (iPad Pro / landscape tablets) */
const DESKTOP_BREAKPOINT = 1024;

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);     // mobile/tablet drawer
    const [isCollapsed, setIsCollapsed] = useState(false);           // desktop icon-only mode
    const [isDesktop, setIsDesktop] = useState(
        () => typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT
    );

    /* ── Responsive listener ─────────────────────────────── */
    useEffect(() => {
        const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);

        const onChange = (e) => {
            setIsDesktop(e.matches);
            if (!e.matches) setIsSidebarOpen(false);   // close drawer when shrinking
            if (e.matches) setIsSidebarOpen(false);     // reset drawer state on grow
        };

        // Modern browsers
        if (mql.addEventListener) {
            mql.addEventListener("change", onChange);
        } else {
            mql.addListener(onChange);
        }

        return () => {
            if (mql.removeEventListener) {
                mql.removeEventListener("change", onChange);
            } else {
                mql.removeListener(onChange);
            }
        };
    }, []);

    const toggleSidebar = useCallback(() => setIsSidebarOpen((o) => !o), []);
    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
    const toggleCollapsed = useCallback(() => setIsCollapsed((c) => !c), []);

    return (
        <div className="h-screen flex overflow-hidden bg-background">
            {/* ── Mobile / Tablet overlay backdrop ──────────────── */}
            {isSidebarOpen && !isDesktop && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar ───────────────────────────────────────── */}
            {/*
                Mobile & Tablet (< tab-lg):
                  – Fixed overlay drawer, slides in from the left (RTL: right)
                Desktop (≥ tab-lg):
                  – Static sidebar in the flex flow
            */}
            <div
                style={
                    !isDesktop
                        ? {
                              position: "fixed",
                              top: 0,
                              bottom: 0,
                              left: 0,
                              zIndex: 40,
                              transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
                              transition: "transform 300ms ease-in-out",
                          }
                        : { position: "relative", flexShrink: 0 }
                }
            >
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    closeSidebar={closeSidebar}
                    isDesktop={isDesktop}
                    isCollapsed={isDesktop ? isCollapsed : false}
                    toggleCollapsed={toggleCollapsed}
                />
            </div>

            {/* ── Main column (Navbar + content) ────────────────── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar
                    toggleSidebar={toggleSidebar}
                    isDesktop={isDesktop}
                />

                {/*
                    Progressive padding across every breakpoint:
                      xs  → p-3          (320 px)
                      sm  → p-4          (390 px)
                      tab-sm → p-5       (600 px)
                      tab-md → p-6       (768 px)
                      tab-lg → p-7       (1024 px)
                      lg  → p-8          (1280 px)
                      xl  → p-10         (1440 px)
                      2xl → p-12         (1680 px)
                      3xl → p-14         (1920 px)
                      4xl → p-16         (2560 px)
                */}
                <main
                    className="
                        flex-1 overflow-y-auto
                        bg-surface
                        p-3
                        sm:p-4
                        tab-sm:p-5
                        tab-md:p-6
                        tab-lg:p-7
                        lg:p-8
                        xl:p-10
                        2xl:p-12
                        3xl:p-14
                        4xl:p-16
                    "
                >
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;