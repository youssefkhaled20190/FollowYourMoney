import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import EgyptAirLogo from "../../Assets/Images/EgyptAir.png";
import useTranslate from "../../Hooks/Translation/useTranslate";
import "remixicon/fonts/remixicon.css";

const Sidebar = ({ isSidebarOpen, closeSidebar, isDesktop }) => {
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const { t } = useTranslate();
    const location = useLocation();

    const menuItems = [
        {
            id: 1,
            title: t("Dashboard"),
            icon: "ri-dashboard-line",
            path: "/dashboard",
        },
        {
            id: 2,
            title: t("Users"),
            icon: "ri-user-line",
            subItems: [
                { id: 21, title: t("All Users"), path: "/users/all" },
                { id: 22, title: t("Add User"), path: "/users/add" },
                { id: 23, title: t("User Roles"), path: "/users/roles" },
            ],
        },
        {
            id: 3,
            title: t("Reports"),
            icon: "ri-file-chart-line",
            subItems: [
                { id: 31, title: t("Sales Report"), path: "/reports/sales" },
                { id: 32, title: t("User Report"), path: "/reports/users" },
                { id: 33, title: t("Activity Report"), path: "/reports/activity" },
            ],
        },
        {
            id: 4,
            title: t("Settings"),
            icon: "ri-settings-3-line",
            path: "/settings",
        },
        {
            id: 5,
            title: t("Products"),
            icon: "ri-shopping-bag-line",
            subItems: [
                { id: 51, title: t("All Products"), path: "/products/all" },
                { id: 52, title: t("Add Product"), path: "/products/add" },
                { id: 53, title: t("Categories"), path: "/products/categories" },
                { id: 54, title: t("Inventory"), path: "/products/inventory" },
            ],
        },
        {
            id: 6,
            title: t("Messages"),
            icon: "ri-message-3-line",
            path: "/messages",
        },
        {
            id: 7,
            title: t("Analytics"),
            icon: "ri-bar-chart-box-line",
            path: "/analytics",
        },
    ];

    const toggleSubmenu = (itemId) => {
        setOpenSubmenu(openSubmenu === itemId ? null : itemId);
    };

    const isActiveLink = (path) => location.pathname === path;
    const isParentActive = (subItems) => subItems?.some((item) => location.pathname === item.path);

    return (
        <>
            {/* Mobile/Tablet Overlay - Only show when sidebar is open on mobile */}
            {isSidebarOpen && !isDesktop && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed
                    top-16 md:top-20 lg:top-24
                    ltr:left-0 rtl:right-0
                    h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)]
                    w-64 md:w-72 lg:w-80 xl:w-88
                    bg-white
                    border-gray-200
                    ltr:border-r rtl:border-l
                    shadow-lg
                    overflow-y-auto
                    z-40
                    scrollbar-thin
                    scrollbar-thumb-gray-300
                    scrollbar-track-gray-100
                    
                    ${isDesktop ? 'block' : (isSidebarOpen ? 'block' : 'hidden')}
                    
                    transform
                    transition-transform
                    duration-300
                    ease-in-out
                    ${isDesktop ? 'translate-x-0' : (isSidebarOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full')}
                `}
            >
                {/* Logo Section */}
                <div className="flex justify-center items-center py-4 md:py-5 lg:py-6 px-4 border-b border-gray-200">
                    <img 
                        src={EgyptAirLogo}
                        alt="Egypt Air Logo"
                        className="h-12 w-auto sm:h-14 md:h-16 lg:h-20 xl:h-24 object-contain"
                    />
                </div>

                {/* Navigation Menu */}
                <nav className="p-4 md:p-5 lg:p-6">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                {!item.subItems ? (
                                    <Link
                                        to={item.path}
                                        onClick={closeSidebar}
                                        className={`
                                            flex items-center
                                            px-4 py-3
                                            rounded-lg
                                            text-sm md:text-base
                                            font-Cairo
                                            font-medium
                                            transition-all
                                            duration-200
                                            ${
                                                isActiveLink(item.path)
                                                    ? 'bg-primary-500 text-white shadow-md'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        <i className={`${item.icon} text-lg md:text-xl ltr:mr-3 rtl:ml-3`}></i>
                                        <span>{item.title}</span>
                                    </Link>
                                ) : (
                                    <div>
                                        <button
                                            onClick={() => toggleSubmenu(item.id)}
                                            className={`
                                                w-full
                                                flex items-center justify-between
                                                px-4 py-3
                                                rounded-lg
                                                text-sm md:text-base
                                                font-Cairo
                                                font-medium
                                                transition-all
                                                duration-200
                                                ${
                                                    isParentActive(item.subItems)
                                                        ? 'bg-primary-50 text-primary-500'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center">
                                                <i className={`${item.icon} text-lg md:text-xl ltr:mr-3 rtl:ml-3`}></i>
                                                <span>{item.title}</span>
                                            </div>
                                            <i
                                                className={`
                                                    ri-arrow-down-s-line
                                                    text-lg
                                                    transition-transform
                                                    duration-200
                                                    ${openSubmenu === item.id ? 'rotate-180' : ''}
                                                `}
                                            ></i>
                                        </button>

                                        <div
                                            className={`
                                                overflow-hidden
                                                transition-all
                                                duration-300
                                                ease-in-out
                                                ${
                                                    openSubmenu === item.id
                                                        ? 'max-h-96 opacity-100 mt-2'
                                                        : 'max-h-0 opacity-0'
                                                }
                                            `}
                                        >
                                            <ul className="ltr:ml-6 rtl:mr-6 space-y-1">
                                                {item.subItems.map((subItem) => (
                                                    <li key={subItem.id}>
                                                        <Link
                                                            to={subItem.path}
                                                            onClick={closeSidebar}
                                                            className={`
                                                                flex items-center
                                                                px-4 py-2.5
                                                                rounded-lg
                                                                text-sm
                                                                font-Cairo
                                                                transition-all
                                                                duration-200
                                                                ${
                                                                    isActiveLink(subItem.path)
                                                                        ? 'bg-primary-500 text-white shadow-sm'
                                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary-500'
                                                                }
                                                            `}
                                                        >
                                                            <i className="ri-subtract-line text-xs ltr:mr-2 rtl:ml-2"></i>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Sidebar Spacer for Desktop - Always visible on large screens */}
            <div className="hidden lg:block w-64 md:w-72 lg:w-80 xl:w-88 flex-shrink-0"></div>
        </>
    );
};

export default Sidebar;