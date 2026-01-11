import { HTMLAttributes } from 'react';
import { Button } from './Button';
import './Pagination.css';

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  siblingCount?: number;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'dots')[] {
  const totalNumbers = siblingCount * 2 + 3; // siblings + current + first + last
  const totalBlocks = totalNumbers + 2; // + 2 for dots

  if (totalPages <= totalBlocks) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, totalNumbers);
    return [...leftRange, 'dots', totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = range(totalPages - totalNumbers + 1, totalPages);
    return [1, 'dots', ...rightRange];
  }

  const middleRange = range(leftSiblingIndex, rightSiblingIndex);
  return [1, 'dots', ...middleRange, 'dots', totalPages];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  siblingCount = 1,
  className = '',
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const paginationRange = getPaginationRange(currentPage, totalPages, siblingCount);

  const goToFirst = () => onPageChange(1);
  const goToLast = () => onPageChange(totalPages);
  const goToPrev = () => onPageChange(Math.max(1, currentPage - 1));
  const goToNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

  return (
    <nav className={`pagination ${className}`} aria-label="Pagination" {...props}>
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
      <div className="pagination-controls">
        {showFirstLast && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToFirst}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path
                fillRule="evenodd"
                d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Button>

        <div className="pagination-pages">
          {paginationRange.map((page, index) =>
            page === 'dots' ? (
              <span key={`dots-${index}`} className="pagination-dots">
                ...
              </span>
            ) : (
              <button
                key={page}
                className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
        {showFirstLast && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToLast}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path
                fillRule="evenodd"
                d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm6 0a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        )}
      </div>
    </nav>
  );
}
