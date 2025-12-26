export interface ICreateDto {
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface IQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface PaginatedData<T> {
    data: T[];
    pagination: PaginationMeta;
}