/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Attachment } from './Attachment';

export type Hive = {
    id?: string;
    apiaryId?: string;
    hiveNumber?: string;
    status?: Hive.status;
    frameCount?: number;
    installationDate?: string;
    notes?: string;
    // Stockkarte – Beute
    hiveBoxType?: string;
    hiveType?: string;
    // Stockkarte – Königin
    queenYear?: number;
    queenColor?: string;
    queenOrigin?: string;
    matingType?: string;
    queenMarked?: boolean;
    attachments?: Array<Attachment>;
    createdAt?: string;
    updatedAt?: string;
};

export namespace Hive {

    export enum status {
        ACTIVE = 'active',
        INACTIVE = 'inactive',
        ARCHIVED = 'archived',
    }


}