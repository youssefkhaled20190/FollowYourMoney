import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useTranslate from '../../Hooks/Translation/useTranslate';
import { useSelector } from 'react-redux';
import 'remixicon/fonts/remixicon.css';

const BreadcrumbsDefault = ({
  list = [],
  pdfExportProps,
  showPdfButton = true
}) => {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const currentLang = useSelector((state) => state.language.lang);

  const handleClick = (e, link) => {
    if (link) {
      e.preventDefault();
      navigate(link);
    }
  };

  // ✅ Render PDF button if props provided
  const renderPdfButton = () => {
    if (!showPdfButton || !pdfExportProps) return null;

    const { PDFExport, ...props } = pdfExportProps;
    const PDFExportComponent = PDFExport;

    return (
      <div className="flex items-center gap-2 ml-4 pl-2  border-gray-300">

        <PDFExportComponent {...props} />
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 text-sm font-Cairo mb-4 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
      {/* Left side: Home + Breadcrumbs */}
      <div className="flex items-center flex-wrap gap-2 flex-1 min-w-0">
        {/* Home Icon */}
        <Link
          to="/dashboard"
          className="text-gray-500 hover:text-primary-500 transition-colors duration-200"
          aria-label="Home"
        >
          <i className="ri-home-4-line text-lg"></i>
        </Link>

        {/* Breadcrumb Items */}
        {list.map((item, idx) => (
          <React.Fragment key={idx}>
            {/* Separator */}
            <span className="text-gray-400 select-none">
              <i
                className={
                  currentLang === 'ar'
                    ? 'ri-arrow-left-s-line text-base'
                    : 'ri-arrow-right-s-line text-base'
                }
              ></i>
            </span>

            {/* Breadcrumb Item */}
            {item.link ? (
              <a
                href={item.link}
                onClick={(e) => handleClick(e, item.link)}
                className="text-gray-600 hover:text-primary-500 transition-colors duration-200 font-medium cursor-pointer truncate max-w-[150px]"
              >
                {t(item.name)}
              </a>
            ) : (
              <span
                className={`${idx === list.length - 1
                    ? 'text-primary-500 font-semibold'
                    : 'text-gray-600 font-medium'
                  } truncate max-w-[150px]`}
              >
                {t(item.name)}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ✅ PDF Export Button - Always at RIGHT END */}
      {renderPdfButton()}
    </div>
  );
};

export default BreadcrumbsDefault;
