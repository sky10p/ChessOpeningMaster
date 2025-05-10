export interface VariantInfo {
  _id: { $oid: string };
  repertoireId: string;
  variantName: string;
  errors: number;
  lastDate: Date;
}
