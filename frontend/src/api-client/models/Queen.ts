/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type HiveHistoryEntry = {
  hiveId: string;
  from: string;
  to?: string;
};

export type Queen = {
  id?: string;
  userId?: string;
  name?: string;
  queenYear?: number;
  queenColor?: string;
  queenOrigin?: string;
  matingType?: string;
  queenMarked?: boolean;
  /** active | spare | dead | sold */
  status?: string;
  notes?: string;
  hiveHistory?: HiveHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
};
