export type Path =
  | ({ type: "variant" } & PathVariant)
  | ({ type: "study" } & PathStudy)
  | { message: string };

export type PathVariant = {
  _id: { $oid: string };
  repertoireId: string;
  repertoireName: string;
  name: string;
  errors: number;
  lastDate: { $date: string };
};

export type PathStudy = {
  groupId: string;
  studyId: string;
  name: string;
  lastSession: string | null;
};
