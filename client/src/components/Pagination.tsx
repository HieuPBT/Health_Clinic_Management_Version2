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
                <PaginationItem>
                    <PaginationPrevious
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                        }}
                    />
                </PaginationItem>
                <PaginationItem>
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
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}
                {totalPages >= 2 && currentPage !== totalPages &&
                    <PaginationItem>
                        <PaginationLink onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(totalPages);
                        }}>
                            {totalPages}
                        </PaginationLink>
                    </PaginationItem>
                }
                <PaginationItem>
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
