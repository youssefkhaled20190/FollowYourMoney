import React, { useEffect, useState } from "react";
import "remixicon/fonts/remixicon.css";
import { useSelector, useDispatch } from "react-redux";
import useTranslate from "../../src/Hooks/Translation/useTranslate";
import { SET_LANGUAGE } from "../Redux/actions/languageActions.js";


const Auth = () => {
    const [showPassword, setShowPassword]       = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [activeTab, setActiveTab]             = useState("login");
    const [agreedToTerms, setAgreedToTerms]     = useState(false);

    const { t }       = useTranslate();
    const dispatch    = useDispatch();
    const currentLang = useSelector((state) => state.language.lang);

    useEffect(() => {
        document.documentElement.dir  = currentLang === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = currentLang;
    }, [currentLang]);

    const toggleLanguage = () => {
        dispatch({ type: SET_LANGUAGE, payload: currentLang === "ar" ? "en" : "ar" });
    };


    return (
        <div className="
            w-screen
            h-screen
            bg-surface
            flex flex-col items-center justify-center
            px-4 tab-md:px-6 lg:px-8 3xl:px-12
            overflow-hidden
        ">

            {/* ── Page Header ── */}
            <div className="text-center mb-8 tab-md:mb-10">
                <p className="
                    font-Cairo
                    text-headline-lg-mobile tab-md:text-headline-md lg:text-headline-lg 3xl:text-7xl
                    text-on-surface
                    font-bold
                    mb-2 tab-md:mb-2
                ">
                    {t("Money Follow")}
                </p>
                <span className="
                    font-body-sm
                    text-body-sm 3xl:text-body-md
                    text-on-surface-variant
                    tracking-widest uppercase
                ">
                    {t("Personal Finance Management")}
                </span>
            </div>


            {/* ── Auth Card ── */}
            <div className="
                w-full
                max-w-3xl
                h-auto
                max-h-[95vh]
                bg-surface-container-lowest
                border border-outline-variant
                rounded-lg tab-md:rounded-xl lg:rounded-xl 3xl:rounded-2xl
                overflow-hidden
                shadow-sm tab-md:shadow-md
            ">

                {/* ── Tab Bar ── */}
                <div className="flex border-b border-outline-variant">
                    {["login", "register"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                flex-1
                                py-4 tab-md:py-5 lg:py-6 3xl:py-7
                                font-Cairo font-bold
                                text-label-caps 3xl:text-body-sm
                                tracking-widest uppercase
                                border-b-2
                                transition-all duration-200
                                ${activeTab === tab
                                    ? "text-on-surface border-primary bg-surface-container-lowest"
                                    : "text-on-surface-variant border-transparent bg-surface-container-low hover:bg-surface-container"
                                }
                            `}
                        >
                            {tab === "login" ? t("Login") : t("Register")}
                        </button>
                    ))}
                </div>


                {/* ── Form Body ── */}
                <div className="p-6 tab-md:p-8 lg:p-10 3xl:p-12">

                    {/* ════ LOGIN ════ */}
                    {activeTab === "login" && (
                        <div className="flex flex-col gap-5 tab-md:gap-6 3xl:gap-7">

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="
                                    font-label-caps
                                    text-label-caps
                                    text-on-surface-variant
                                ">
                                    {t("Email Address")}
                                </label>
                                <div className="relative">
                                    <i className="
                                        ri-mail-line
                                        absolute top-1/2 -translate-y-1/2
                                        ltr:left-4 rtl:right-4
                                        text-on-surface-variant
                                        text-base tab-md:text-lg
                                        pointer-events-none
                                    "></i>
                                    <input
                                        type="email"
                                        placeholder="ahmed@example.com"
                                        className="
                                            w-full
                                            h-12 tab-md:h-13 lg:h-14 3xl:h-16
                                            bg-surface-container-low
                                            border border-outline-variant
                                            rounded-lg tab-md:rounded-lg lg:rounded-xl
                                            ltr:pl-12 rtl:pr-12
                                            tab-md:ltr:pl-14 tab-md:rtl:pr-14
                                            ltr:pr-4 rtl:pl-4
                                            font-body-md
                                            text-body-md
                                            text-on-surface
                                            placeholder:text-on-surface-variant/50
                                            focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-fixed-dim
                                            transition-all
                                        "
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="
                                        font-label-caps
                                        text-label-caps
                                        text-on-surface-variant
                                    ">
                                        {t("Password")}
                                    </label>
                                    <a href="#" className="
                                        font-body-sm
                                        text-body-sm
                                        text-on-surface-variant hover:text-on-surface
                                        hover:underline transition-colors
                                    ">
                                        {t("Forgot?")}
                                    </a>
                                </div>
                                <div className="relative">
                                    <i className="
                                        ri-lock-line
                                        absolute top-1/2 -translate-y-1/2
                                        ltr:left-4 rtl:right-4
                                        text-on-surface-variant
                                        text-base tab-md:text-lg
                                        pointer-events-none
                                    "></i>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="
                                            w-full
                                            h-12 tab-md:h-13 lg:h-14 3xl:h-16
                                            bg-surface-container-low
                                            border border-outline-variant
                                            rounded-lg tab-md:rounded-lg lg:rounded-xl
                                            ltr:pl-12 rtl:pr-12
                                            tab-md:ltr:pl-14 tab-md:rtl:pr-14
                                            ltr:pr-12 rtl:pl-12
                                            tab-md:ltr:pr-14 tab-md:rtl:pl-14
                                            font-body-md
                                            text-body-md
                                            text-on-surface
                                            placeholder:text-on-surface-variant/50
                                            focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-fixed-dim
                                            transition-all
                                        "
                                    />
                                    <i
                                        className={`
                                            ${showPassword ? "ri-eye-off-line" : "ri-eye-line"}
                                            absolute top-1/2 -translate-y-1/2
                                            ltr:right-4 rtl:left-4
                                            text-on-surface-variant hover:text-on-surface
                                            text-base tab-md:text-lg
                                            cursor-pointer transition-colors
                                        `}
                                        onClick={() => setShowPassword(!showPassword)}
                                    ></i>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button className="
                                w-full
                                h-12 tab-md:h-13 lg:h-14 3xl:h-16
                                bg-primary hover:opacity-85 active:opacity-70
                                text-surface
                                font-Cairo font-bold
                                text-label-caps 3xl:text-body-sm
                                tracking-widest uppercase
                                rounded-lg tab-md:rounded-lg lg:rounded-xl
                                transition-all duration-150
                                mt-2 tab-md:mt-3
                            ">
                                {t("Login")}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-2 tab-md:my-3">
                                <hr className="flex-1 border-none border-t border-outline-variant h-px bg-outline-variant" />
                                <span className="
                                    font-body-sm
                                    text-body-sm
                                    text-on-surface-variant
                                    whitespace-nowrap
                                ">
                                    {t("Or continue with")}
                                </span>
                                <hr className="flex-1 border-none border-t border-outline-variant h-px bg-outline-variant" />
                            </div>

                            {/* Social Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: "ri-google-fill", label: "Google" },
                                    { icon: "ri-github-fill", label: "GitHub" },
                                ].map(({ icon, label }) => (
                                    <button key={label} className="
                                        flex items-center justify-center gap-2
                                        h-12 tab-md:h-13 lg:h-14 3xl:h-16
                                        bg-surface-container-lowest
                                        border border-outline-variant
                                        hover:bg-surface-container-low
                                        rounded-lg tab-md:rounded-lg lg:rounded-xl
                                        font-Cairo font-bold
                                        text-label-caps 3xl:text-body-sm
                                        text-on-surface
                                        transition-colors duration-150
                                    ">
                                        <i className={`${icon} text-base tab-md:text-lg text-on-surface-variant`}></i>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* ════ REGISTER ════ */}
                    {activeTab === "register" && (
                        <div className="flex flex-col gap-5 tab-md:gap-6 3xl:gap-7">

                            {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="
                                    font-label-caps
                                    text-label-caps
                                    text-on-surface-variant
                                ">
                                    {t("Full Name")}
                                </label>
                                <div className="relative">
                                    <i className="
                                        ri-user-line
                                        absolute top-1/2 -translate-y-1/2
                                        ltr:left-4 rtl:right-4
                                        text-on-surface-variant
                                        text-base tab-md:text-lg
                                        pointer-events-none
                                    "></i>
                                    <input
                                        type="text"
                                        placeholder="Ahmed Hassan"
                                        className="
                                            w-full
                                            h-12 tab-md:h-13 lg:h-14 3xl:h-16
                                            bg-surface-container-low
                                            border border-outline-variant
                                            rounded-lg tab-md:rounded-lg lg:rounded-xl
                                            ltr:pl-12 rtl:pr-12
                                            tab-md:ltr:pl-14 tab-md:rtl:pr-14
                                            ltr:pr-4 rtl:pl-4
                                            font-body-md
                                            text-body-md
                                            text-on-surface
                                            placeholder:text-on-surface-variant/50
                                            focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-fixed-dim
                                            transition-all
                                        "
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="
                                    font-label-caps
                                    text-label-caps
                                    text-on-surface-variant
                                ">
                                    {t("Email Address")}
                                </label>
                                <div className="relative">
                                    <i className="
                                        ri-mail-line
                                        absolute top-1/2 -translate-y-1/2
                                        ltr:left-4 rtl:right-4
                                        text-on-surface-variant
                                        text-base tab-md:text-lg
                                        pointer-events-none
                                    "></i>
                                    <input
                                        type="email"
                                        placeholder="ahmed@example.com"
                                        className="
                                            w-full
                                            h-12 tab-md:h-13 lg:h-14 3xl:h-16
                                            bg-surface-container-low
                                            border border-outline-variant
                                            rounded-lg tab-md:rounded-lg lg:rounded-xl
                                            ltr:pl-12 rtl:pr-12
                                            tab-md:ltr:pl-14 tab-md:rtl:pr-14
                                            ltr:pr-4 rtl:pl-4
                                            font-body-md
                                            text-body-md
                                            text-on-surface
                                            placeholder:text-on-surface-variant/50
                                            focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-fixed-dim
                                            transition-all
                                        "
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-2">
                                <label className="
                                    font-label-caps
                                    text-label-caps
                                    text-on-surface-variant
                                ">
                                    {t("Password")}
                                </label>
                                <div className="relative">
                                    <i className="
                                        ri-lock-line
                                        absolute top-1/2 -translate-y-1/2
                                        ltr:left-4 rtl:right-4
                                        text-on-surface-variant
                                        text-base tab-md:text-lg
                                        pointer-events-none
                                    "></i>
                                    <input
                                        type={showRegPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="
                                            w-full
                                            h-12 tab-md:h-13 lg:h-14 3xl:h-16
                                            bg-surface-container-low
                                            border border-outline-variant
                                            rounded-lg tab-md:rounded-lg lg:rounded-xl
                                            ltr:pl-12 rtl:pr-12
                                            tab-md:ltr:pl-14 tab-md:rtl:pr-14
                                            ltr:pr-12 rtl:pl-12
                                            tab-md:ltr:pr-14 tab-md:rtl:pl-14
                                            font-body-md
                                            text-body-md
                                            text-on-surface
                                            placeholder:text-on-surface-variant/50
                                            focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-fixed-dim
                                            transition-all
                                        "
                                    />
                                    <i
                                        className={`
                                            ${showRegPassword ? "ri-eye-off-line" : "ri-eye-line"}
                                            absolute top-1/2 -translate-y-1/2
                                            ltr:right-4 rtl:left-4
                                            text-on-surface-variant hover:text-on-surface
                                            text-base tab-md:text-lg
                                            cursor-pointer transition-colors
                                        `}
                                        onClick={() => setShowRegPassword(!showRegPassword)}
                                    ></i>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="
                                        mt-1 flex-shrink-0
                                        w-5 h-5 tab-md:w-5 tab-md:h-5 3xl:w-6 3xl:h-6
                                        rounded border-outline-variant
                                        accent-on-surface cursor-pointer
                                    "
                                />
                                <label htmlFor="terms" className="
                                    font-body-sm
                                    text-body-sm
                                    text-on-surface-variant
                                    leading-relaxed cursor-pointer
                                    3xl:text-body-md
                                ">
                                    {t("I agree to the")}{" "}
                                    <a href="#" className="text-on-surface hover:underline">{t("Terms of Service")}</a>
                                    {" "}{t("and")}{" "}
                                    <a href="#" className="text-on-surface hover:underline">{t("Privacy Policy")}</a>
                                </label>
                            </div>

                            {/* Register Button */}
                            <button className="
                                w-full
                                h-12 tab-md:h-13 lg:h-14 3xl:h-16
                                bg-on-surface hover:opacity-85 active:opacity-70
                                text-surface
                                font-Cairo font-bold
                                text-label-caps 3xl:text-body-sm
                                tracking-widest uppercase
                                rounded-lg tab-md:rounded-lg lg:rounded-xl
                                transition-all duration-150
                                mt-2 tab-md:mt-3
                            ">
                                {t("Create Account")}
                            </button>
                        </div>
                    )}


                    {/* Support Link */}
                    <p className="
                        mt-8 tab-md:mt-10 3xl:mt-12
                        font-body-sm
                        text-body-sm
                        text-on-surface-variant text-center
                        3xl:text-body-md
                    ">
                        {t("Need help?")}{" "}
                        <a href="#" className="text-on-surface font-bold hover:underline">
                            {t("Contact support")}
                        </a>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default Auth;