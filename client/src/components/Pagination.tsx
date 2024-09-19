import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import React from "react"

export interface PaginatorProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

const Paginator: React.FC<PaginatorProps> = ({ currentPage, totalPages, onPageChange }) => {
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                        }}
                    />
                </PaginationItem>
                <PaginationItem className="cursor-pointer">
                    <PaginationLink
                        isActive
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage);
                        }}
                    >
                        {currentPage}
                    </PaginationLink>
                </PaginationItem>
                {totalPages > 2 && currentPage !== totalPages && (
                    <PaginationItem className="cursor-pointer">
                        <PaginationEllipsis />
                    </PaginationItem>
                )}
                {totalPages >= 2 && currentPage !== totalPages &&
                    <PaginationItem className="cursor-pointer">
                        <PaginationLink onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(totalPages);
                        }}>
                            {totalPages}
                        </PaginationLink>
                    </PaginationItem>
                }
                <PaginationItem className="cursor-pointer">
                    <PaginationNext
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage + 1);
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export default Paginator
