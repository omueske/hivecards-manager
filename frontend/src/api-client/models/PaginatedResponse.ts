/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PaginatedResponse = {
    pagination?: {
page?: number;
limit?: number;
total?: number;
};
    items?: Array<any>;
};