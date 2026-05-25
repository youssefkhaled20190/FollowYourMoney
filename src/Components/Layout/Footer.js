// Footer.jsx
import React from "react";
import useTranslate from "../../Hooks/Translation/useTranslate";

const Footer = () => {
    const { t } = useTranslate();
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="
            bg-white 
            border-t border-gray-200 
            py-4 md:py-5
            w-full
            mt-auto
        ">
            <div className="px-4 md:px-6 lg:px-8">
                <p className="text-xs md:text-sm text-gray-600 text-center font-Cairo">
                    {t("Security System")} © {currentYear}. {t("All rights reserved for Egypt Air Ground Service Development Section")}.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
