/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type BreedingRecord = {
    id?: string;
    queenId?: string;
    date?: string;
    breeder?: string;
    method?: string;
    pedigree?: string;
    notes?: string;
    result?: BreedingRecord.result;
};

export namespace BreedingRecord {

    export enum result {
        SUCCESS = 'success',
        FAILURE = 'failure',
        UNKNOWN = 'unknown',
    }


}