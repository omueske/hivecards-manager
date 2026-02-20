/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Queen = {
    id?: string;
    userId?: string;
    name?: string;
    queenYear?: number | null;
    queenColor?: string;
    queenOrigin?: string;
    matingType?: string;
    queenMarked?: boolean;
    status?: string;
    notes?: string;
    hiveId?: string | null;
    hiveHistory?: Array<{
        hiveId: string;
        from: string;
        to?: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
};
