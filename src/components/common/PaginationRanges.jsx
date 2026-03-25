import React, { useMemo } from "react";
import CustomSelect from "./CustomSelect";

const PaginationRanges = ({
  currentPage,
  rowsPerPage = 10,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 20],
}) => {
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Generate visible page numbers based on screen size logic
  // Smart pagination that shows relevant pages with ellipsis
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    
    if (currentPage <= 4) {
      // Near the start: show 1, 2, 3, 4, 5, ..., last
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      if (totalPages > 5) {
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    } else if (currentPage >= totalPages - 3) {
      // Near the end: show 1, ..., last-4, last-3, last-2, last-1, last
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // In the middle: show 1, ..., current-1, current, current+1, ..., last
      pages.push(1);
      pages.push("ellipsis");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = useMemo(() => getVisiblePages(), [currentPage, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-xs sm:text-sm text-secondary gap-3 sm:gap-4">
      {/* Rows per page */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-center sm:justify-start">
        <span className="bg-secondary-light whitespace-nowrap text-xs sm:text-sm">Show</span>

        <CustomSelect
          value={String(rowsPerPage)}
          onChange={(value) => {
            onRowsPerPageChange(Number(value));
            onPageChange(1); // reset page
          }}
          options={rowsPerPageOptions.map((n) => String(n))}
          placeholder=""
          className="w-auto min-w-[60px] sm:min-w-[80px]"
          optionClassName="p-1"
          itemPadding="px-2 py-1"
        />

        <span className="bg-secondary-light whitespace-nowrap text-xs sm:text-sm">per page</span>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Page info - hide on very small screens, show on sm and up */}
        <span className="hidden sm:inline text-[10px] md:text-xs text-gray-500 whitespace-nowrap">
          {(currentPage - 1) * rowsPerPage + 1}–
          {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems}
        </span>

        {/* Mobile: Compact view with just prev/next and current page */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded border border-[#E4E6EF] text-gray-500 hover:bg-gray-100 disabled:opacity-50 text-sm cursor-pointer disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            ←
          </button>

          <span className="px-3 py-1.5 text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1.5 rounded border border-[#E4E6EF] text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
            aria-label="Next page"
          >
            →
          </button>
        </div>

        {/* Desktop/Tablet: Full pagination with page numbers */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
          {/* Prev */}
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1.5 rounded border border-[#E4E6EF] text-gray-500 hover:bg-gray-100 text-sm cursor-pointer disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            ←
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {visiblePages.map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm transition-colors cursor-pointer ${
                    page === currentPage
                      ? "bg-[#F1F4F9] text-primary font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1.5 rounded border border-[#E4E6EF] text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationRanges;
