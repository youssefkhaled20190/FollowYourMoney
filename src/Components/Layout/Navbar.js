// Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import EgyptAirLogo from "../../Assets/Images/HourasLogo.png";
import "remixicon/fonts/remixicon.css";
import useTranslate from "../../Hooks/Translation/useTranslate";
import { SET_LANGUAGE } from "../../Redux/actions/languageActions";

const Navbar = ({ toggleSidebar }) => {
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const { t } = useTranslate();
    const dispatch = useDispatch();
    const currentLang = useSelector((state) => state.language.lang);

    const languageDropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);

    useEffect(() => {
        // Close dropdowns on outside click
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

    const handleLogout = () => {
        // Add your logout action here
        setIsProfileDropdownOpen(false);
    };

    // Minimal country flag SVGs (replace with flag icons or your own component if you like)
    const USFlag = () => (
        <svg className="w-5 h-5 rounded-full" viewBox="0 0 512 512">
            <rect width="512" height="512" fill="#fff"/>
            <g fill="#b22234">
                <rect width="512" height="39.38" y="0"/>
                <rect width="512" height="39.38" y="78.77"/>
                <rect width="512" height="39.38" y="157.54"/>
                <rect width="512" height="39.38" y="236.31"/>
                <rect width="512" height="39.38" y="315.08"/>
                <rect width="512" height="39.38" y="393.85"/>
                <rect width="512" height="39.38" y="472.62"/>
            </g>
            <rect width="204.8" height="275.69" fill="#3c3b6e"/>
        </svg>
    );

    const EgyptFlag = () => (
        <svg className="w-5 h-5 rounded-full" viewBox="0 0 512 512">
            <rect width="512" height="170.67" fill="#ce1126"/>
            <rect width="512" height="170.67" y="170.67" fill="#fff"/>
            <rect width="512" height="170.67" y="341.33" fill="#000"/>
            <circle cx="256" cy="256" r="50" fill="#c09300"/>
        </svg>
    );

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm fixed top-0 w-full z-50">
            <div className="max-w-screen-3xl mx-auto px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20 lg:h-24">
                    {/* LEFT: Sidebar Toggle (mobile only) + Logo */}
                    <div className="flex items-center ltr:space-x-3 rtl:space-x-reverse">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Toggle Sidebar"
                        >
                            <i className="ri-menu-line text-2xl"></i>
                        </button>
                        {/* Logo --- adjust size as needed */}
                        <a href="/" className="flex items-center">
                          <h1 className="font-bold text-xl md:text-2xl lg:text-3xl">Money Follow</h1>
                        </a>
                    </div>

                    {/* RIGHT: Language switch + Profile */}
                    <div className="flex items-center ltr:space-x-4 rtl:space-x-reverse">
                        {/* Language Dropdown */}
                        <div className="relative" ref={languageDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsLanguageDropdownOpen(v => !v)}
                                className="inline-flex items-center justify-center px-3 py-2 lg:px-4 lg:py-2.5 text-sm lg:text-base text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                {currentLang === 'en' ? <USFlag /> : <EgyptFlag />}
                                <span className="ltr:ml-2 rtl:mr-2 hidden sm:inline">
                                    {currentLang === 'en' ? 'English' : 'العربية'}
                                </span>
                                <i className={`
                                    ri-arrow-down-s-line 
                                    ltr:ml-1 rtl:mr-1
                                    transition-transform 
                                    ${isLanguageDropdownOpen ? 'rotate-180' : ''}
                                `}></i>
                            </button>
                            {isLanguageDropdownOpen && (
                                <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
                                className="flex items-center text-sm bg-gray-100 rounded-full focus:ring-4 focus:ring-primary-200 transition-all"
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-Cairo font-bold text-lg">
                                    <i className="ri-user-line"></i>
                                </div>
                            </button>
                            {isProfileDropdownOpen && (
                                <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-medium text-gray-900">
                                            {t("John Doe")}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            user@example.com
                                        </p>
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
                                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-danger hover:bg-gray-100 transition-colors text-left">
                                            <i className="ri-logout-box-line ltr:mr-3 rtl:ml-3"></i>
                                            {t("Logout")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
