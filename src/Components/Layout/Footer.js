// Footer.jsx
import React from "react";
import useTranslate from "../../Hooks/Translation/useTranslate";

const Footer = () => {
    const { t } = useTranslate();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 py-3 md:py-4 w-full mt-auto flex-shrink-0">
            <div className="px-4 md:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center">
                <p className="text-xs md:text-sm text-gray-500 font-Cairo text-center ">
                    {t("Security System")} &copy; {currentYear}.{" "}
                    <span className="text-gray-400">
                        {t("All rights reserved for Egypt Air Ground Service Development Section")}
                    </span>
                </p>

            </div>
        </footer>
    );
};

export default Footer;
