import { useTranslation } from "react-i18next";

const useTranslate = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"; 
  };

  return { t, changeLanguage, currentLang: i18n.language };
};

export default useTranslate;
