import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  lang: "ur" | "en";
  onHomeClick?: () => void;
  onBackClick?: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  lang,
  onHomeClick,
  onBackClick
}: PaginationProps) {
  const pageText = lang === "ur" 
    ? `صفحہ ${currentPage} کا ${totalPages}` 
    : `Page ${currentPage} of ${totalPages}`;

  const handleHome = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      // Find and click the Hub button from top app bar if available
      const hubBtn = document.querySelector('button[class*="mr-1"]') as HTMLButtonElement;
      if (hubBtn) {
        hubBtn.click();
      } else {
        window.location.reload();
      }
    }
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      const hubBtn = document.querySelector('button[class*="mr-1"]') as HTMLButtonElement;
      if (hubBtn) {
        hubBtn.click();
      }
    }
  };

  return (
    <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm mt-4">
      {/* Home and Back button layout */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleHome}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl uppercase transition border border-slate-200 cursor-pointer"
        >
          🏠 {lang === "ur" ? "ہوم" : "Home"}
        </button>
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl uppercase transition border border-slate-200 cursor-pointer"
        >
          ◀ {lang === "ur" ? "پیچھے" : "Back"}
        </button>
      </div>

      {/* Page indicator */}
      <div className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
        {pageText}
      </div>

      {/* Previous & Next button control */}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-4 py-2 bg-[#FF8C42] hover:bg-orange-600 disabled:bg-slate-100 disabled:opacity-40 text-white disabled:text-slate-400 text-xs font-black rounded-xl uppercase transition cursor-pointer"
        >
          {lang === "ur" ? "پچھلا" : "Previous"}
        </button>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="px-4 py-2 bg-[#FF8C42] hover:bg-orange-600 disabled:bg-slate-100 disabled:opacity-40 text-white disabled:text-slate-400 text-xs font-black rounded-xl uppercase transition cursor-pointer"
        >
          {lang === "ur" ? "اگلا" : "Next"}
        </button>
      </div>
    </div>
  );
}
