/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Queen = {
    id?: string;
    hiveId?: string;
    birthDate?: string;
    origin?: string;
    status?: Queen.status;
    matingDate?: string;
    breederNotes?: string;
    tags?: Array<string>;
};

export namespace Queen {

    export enum status {
        ALIVE = 'alive',
        REMOVED = 'removed',
        REPLACED = 'replaced',
    }


}