/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Inspection = {
    id?: string;
    hiveId?: string;
    date?: string;
    /** inspection | treatment | feeding | harvest | note */
    type?: string;
    notes?: string;
    queenSeen?: boolean;
    broodStatus?: string;
    varroaCount?: number;
    actionsTaken?: string;
    frameCount?: number;
    weather?: string;
    createdAt?: string;
    updatedAt?: string;
    // legacy fields (OpenAPI spec)
    inspector?: string;
    conditionSummary?: string;
    varroaCheck?: string;
};