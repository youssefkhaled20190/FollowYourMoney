// Navbar.jsx
import React, { useState } from "react";
import "remixicon/fonts/remixicon.css";
import useTranslate from "../../Hooks/Translation/useTranslate";

const Navbar = ({ toggleSidebar, isDesktop }) => {
    const [searchValue, setSearchValue] = useState("");

    const { t } = useTranslate();

    const handleSearch = (e) => {
        e.preventDefault();
        console.log("Search for:", searchValue);
    };



    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm w-full z-10 flex-shrink-0">
            <div className="mx-auto px-3 sm:px-4 tab-md:px-6 lg:px-7">
                <div className="flex items-center justify-between" style={{ height: "73px" }}>

                    {/* LEFT: Hamburger (mobile/tablet only) + Search Bar */}
                    <div className="flex items-center flex-1 ltr:mr-4 rtl:ml-4 gap-2 sm:gap-3">
                        {/* Hamburger toggle – visible below tab-lg */}
                        {!isDesktop && (
                            <button
                                id="navbar-hamburger-btn"
                                onClick={toggleSidebar}
                                className="
                                    p-2 -ml-1
                                    rounded-lg
                                    text-gray-600
                                    hover:text-primary hover:bg-gray-100
                                    active:bg-gray-200
                                    transition-colors duration-200
                                "
                                title={t("Toggle menu")}
                                aria-label={t("Toggle menu")}
                            >
                                <i className="ri-menu-line text-xl" />
                            </button>
                        )}

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex items-center flex-1">
                            <div className="relative w-full max-w-xs tab-sm:max-w-sm tab-md:max-w-md lg:max-w-lg">
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    placeholder={t("Search...")}
                                    className="
                                        w-full px-3 py-2
                                        text-sm
                                        border border-gray-300 rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                        placeholder:text-gray-400
                                    "
                                />
                                <button
                                    type="submit"
                                    className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <i className="ri-search-line text-lg tab-md:text-xl" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT: Notification & Help Buttons */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Notification Button */}
                        <button
                            id="navbar-notification-btn"
                            className="relative p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors duration-200"
                            title={t("Notifications")}
                        >
                            <i className="ri-notification-3-line text-lg tab-md:text-xl" />
                            {/* Unread badge */}
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                        </button>

                        {/* Help Button */}
                        <button
                            id="navbar-help-btn"
                            className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors duration-200"
                            title={t("Help")}
                        >
                            <i className="ri-question-line text-lg tab-md:text-xl" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

