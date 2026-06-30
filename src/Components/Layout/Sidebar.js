import React, { useRef, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import useTranslate from "../../Hooks/Translation/useTranslate";
import { SET_LANGUAGE } from "../../Redux/actions/languageActions";
import { logout } from '../../Redux/actions/authAction';
import "remixicon/fonts/remixicon.css";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isSidebarOpen, closeSidebar, isDesktop, isCollapsed, toggleCollapsed }) => {
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const { t } = useTranslate();
    const location = useLocation();
    const dispatch = useDispatch();
    const currentLang = useSelector((state) => state.language.lang);
    const navigate = useNavigate();

    const languageDropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target))
                setIsLanguageDropdownOpen(false);
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target))
                setIsProfileDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleLanguage = (lang) => {
        dispatch({ type: SET_LANGUAGE, payload: lang });
        setIsLanguageDropdownOpen(false);
    };

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
        setIsProfileDropdownOpen(false);
    };

    const USFlag = () => (
        <svg className="w-9 h-9 rounded-full" viewBox="0 0 512 512">
            <rect width="512" height="512" fill="#fff" />
            <g fill="#b22234">
                <rect width="512" height="39.38" y="0" />
                <rect width="512" height="39.38" y="78.77" />
                <rect width="512" height="39.38" y="157.54" />
                <rect width="512" height="39.38" y="236.31" />
                <rect width="512" height="39.38" y="315.08" />
                <rect width="512" height="39.38" y="393.85" />
                <rect width="512" height="39.38" y="472.62" />
            </g>
            <rect width="204.8" height="275.69" fill="#3c3b6e" />
        </svg>
    );

    const EgyptFlag = () => (
        <svg className="w-5 h-5 rounded-full" viewBox="0 0 512 512">
            <rect width="512" height="170.67" fill="#ce1126" />
            <rect width="512" height="170.67" y="170.67" fill="#fff" />
            <rect width="512" height="170.67" y="341.33" fill="#000" />
            <circle cx="256" cy="256" r="50" fill="#c09300" />
        </svg>
    );

    const menuItems = [
        {
            id: 1,
            title: t("Dashboard"),
            icon: "ri-dashboard-line",
            path: "/dashboard",
        },
        {
            id: 2,
            title: t("Monthly Plan"),
            icon: "ri-calendar-line",
            path: "/monthly-plan/page",
        },
        {
            id: 3,
            title: t("Re-Plan"),
            icon: "ri-arrow-left-right-fill",
            path: "/Replan/page",
        },
        {
            id: 4,
            title: t("Gameyas"),
            icon: "ri-donut-chart-line",
            path: "/Gameyas/GameyaList",
        },
        {
            id: 5,
            title: t("Installments"),
            icon: "ri-cash-line",
            path: "/installments/InstallmentsList",
        },
        {
            id: 6,
            title: t("WishList"),
            icon: "ri-poker-hearts-line",
            path: "/wishlist/page",
        },
        {
            id: 7,
            title: t("Expenses"),
            icon: "ri-receipt-line",
            path: "/expenses/page",
        },
        {
            id: 8,
            title: t("History"),
            icon: "ri-history-line",
            path: "/history/page",
        }
    ];

    const isActiveLink = (path) => location.pathname === path;

    return (
        <>
            {/* Sidebar */}
            <aside
                style={{
                    width: isCollapsed ? "72px" : "280px",
                    minWidth: isCollapsed ? "72px" : "280px",
                    transition: "width 0.3s ease, min-width 0.3s ease",
                }}
                className={`
                    relative
                    h-full
                    bg-primary-600
                    border-gray-200
                    ltr:border-r rtl:border-l
                    shadow-lg
                    overflow-hidden
                    z-40
                    flex-shrink-0
                    flex flex-col
                `}
            >
                {/* Logo / Brand Section */}
                <div
                    className="flex items-center py-5 px-4 border-b border-white border-opacity-10 flex-shrink-0"
                    style={{ height: "73px" }}
                >
                    {/* Icon always visible */}
                    <i className="ri-cash-line text-black text-2xl flex-shrink-0" />

                    {/* Name — fades out when collapsed */}
                    {!isCollapsed && (
                        <span className="text-primary text-xl font-Cairo font-bold ltr:ml-3 rtl:mr-3 whitespace-nowrap flex-1">
                            Money Follow
                        </span>
                    )}

                    {/* Toggle button — close on mobile, collapse/expand on desktop */}
                    <button
                        onClick={isDesktop ? toggleCollapsed : closeSidebar}
                        title={
                            !isDesktop
                                ? t("Close menu")
                                : isCollapsed
                                    ? t("Expand Sidebar")
                                    : t("Collapse Sidebar")
                        }
                        className="
                            flex-shrink-0
                            p-1.5 rounded-lg
                            text-black text-opacity-70
                            hover:bg-gray-300 hover:text-opacity-100
                            active:bg-gray-400 active:text-opacity-100
                            transition-all duration-200
                            ltr:ml-2 rtl:mr-2
                        "
                    >
                        <i
                            className={`
                                ${isDesktop ? "ri-arrow-left-s-line" : "ri-close-line"} text-xl
                                transition-transform duration-300
                                ${isDesktop && isCollapsed ? "rotate-180" : ""}
                            `}
                        />
                    </button>



                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 scrollbar-thin scrollbar-thumb-white scrollbar-thumb-opacity-20 scrollbar-track-transparent">

                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <Link
                                    to={item.path}
                                    onClick={!isDesktop ? closeSidebar : undefined}
                                    title={isCollapsed ? item.title : undefined}
                                    className={`
                                        flex items-center
                                        ${isCollapsed ? "justify-center px-0 py-3" : "px-4 py-3"}
                                        text-sm font-Cairo font-medium
                                        transition-all duration-200
                                        group relative
                                        border-l-4 rtl:border-l-0 rtl:border-r-4
                                        ${isActiveLink(item.path)
                                            ? "bg-gray-100 text-black shadow-md border-primary"
                                            : "hover:bg-gray-100 hover:bg-opacity-80 border-transparent"
                                        }
                                    `}
                                >
                                    <i className={`${item.icon} text-xl text-black flex-shrink-0 ${!isCollapsed ? "ltr:mr-3 rtl:ml-3" : ""}`} />
                                    {!isCollapsed && <span className="whitespace-nowrap text-black">{item.title}</span>}

                                    {/* Tooltip when collapsed */}
                                    {isCollapsed && (
                                        <span className="
                                            absolute ltr:left-full rtl:right-full
                                            ltr:ml-3 rtl:mr-3
                                            bg-gray-900 text-white text-xs font-Cairo
                                            px-2.5 py-1.5 rounded-md
                                            whitespace-nowrap
                                            opacity-0 group-hover:opacity-100
                                            pointer-events-none
                                            transition-opacity duration-200
                                            z-50
                                            shadow-lg
                                        ">
                                            {item.title}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Language and Profile Dropdowns */}
                <div className="border-t border-white border-opacity-10 py-3 px-2 space-y-2 flex-shrink-0">
                    <hr className="border-gray-500 border-opacity-20" />
                    {/* Language Dropdown */}
                    <div className="relative" ref={languageDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsLanguageDropdownOpen(v => !v)}
                            className={`w-full inline-flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-3"} rounded-lg text-sm text-black transition-all duration-200 group relative`}
                        >
                            <div className="flex items-center">
                                {currentLang === 'en' ? <USFlag /> : <EgyptFlag />}
                                {!isCollapsed && <span className="ltr:ml-2 rtl:mr-2 hidden sm:inline text-black">{currentLang === 'en' ? 'English' : 'العربية'}</span>}
                            </div>
                            {!isCollapsed && <i className={`ri-arrow-down-s-line transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`}></i>}
                            {isCollapsed && (
                                <span className="absolute ltr:left-full rtl:right-full ltr:ml-3 rtl:mr-3 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                                    {currentLang === 'en' ? 'English' : 'العربية'}
                                </span>
                            )}
                        </button>
                        {isLanguageDropdownOpen && !isCollapsed && (
                            <div className="absolute ltr:right-0 rtl:left-0 bottom-full mb-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <ul className="py-2">
                                    <li>
                                        <button
                                            onClick={() => toggleLanguage('en')}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <USFlag />
                                            <span className="ltr:ml-3 rtl:mr-3">English (US)</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => toggleLanguage('ar')}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <EgyptFlag />
                                            <span className="ltr:ml-3 rtl:mr-3">العربية</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsProfileDropdownOpen(v => !v)}
                            className={`w-full inline-flex items-center ${isCollapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-3"} rounded-lg text-black transition-all duration-200 group relative`}
                        >
                            <div className="flex items-center">
                                <div className={`${isCollapsed ? "w-6 h-6" : "w-10 h-10"} rounded-full bg-gray-300 bg-opacity-20 flex items-center justify-center text-black font-Cairo font-bold`}>
                                    <i className="ri-user-line"></i>
                                </div>
                                {!isCollapsed && <span className="ltr:ml-2 rtl:mr-2 text-sm text-black">Profile</span>}
                            </div>
                            {!isCollapsed && <i className={`ri-arrow-down-s-line transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}></i>}
                            {isCollapsed && (
                                <span className="absolute ltr:left-full rtl:right-full ltr:ml-3 rtl:mr-3 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                                    Profile
                                </span>
                            )}
                        </button>
                        {isProfileDropdownOpen && !isCollapsed && (
                            <div className="absolute ltr:right-0 rtl:left-0 bottom-full mb-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="text-sm font-medium text-gray-900">{t("John Doe")}</p>
                                    <p className="text-xs text-gray-500 truncate">user@example.com</p>
                                </div>
                                <ul className="py-2">
                                    <li>
                                        <button className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left" onClick={() => setIsProfileDropdownOpen(false)}>
                                            <i className="ri-user-line ltr:mr-3 rtl:ml-3"></i>
                                            {t("My Profile")}
                                        </button>
                                    </li>
                                    <li>
                                        <button className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left" onClick={() => setIsProfileDropdownOpen(false)}>
                                            <i className="ri-settings-3-line ltr:mr-3 rtl:ml-3"></i>
                                            {t("Settings")}
                                        </button>
                                    </li>
                                </ul>
                                <div className="py-2 border-t border-gray-200">
                                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 transition-colors text-left">
                                        <i className="ri-logout-box-line ltr:mr-3 rtl:ml-3"></i>
                                        {t("Logout")}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </aside>
        </>
    );
};

export default Sidebar;