import { ObjectId } from "mongodb";

export type IdType = { $oid: string } | string | ObjectId;

export const extractId = (id: IdType): string => {
  return typeof id === 'object' && '$oid' in id 
    ? id.$oid 
    : String(id);
};

export const toObjectId = (id: string): ObjectId => {
  return new ObjectId(id);
};