/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateQueenRequest = {
    name?: string;
    queenYear?: number;
    queenColor?: string;
    queenOrigin?: string;
    matingType?: string;
    queenMarked?: boolean;
    status?: CreateQueenRequest.status;
    notes?: string;
};

export namespace CreateQueenRequest {

    export enum status {
        ACTIVE = 'active',
        SPARE = 'spare',
        DEAD = 'dead',
        SOLD = 'sold',
    }


}