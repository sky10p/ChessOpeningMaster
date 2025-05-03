export type Path = {
  type: "variant" | "study";
  id: string;
  name: string;
  errors?: number;
  lastDate?: { $date: string };
  lastSession?: string | null;
  repertoireId?: string;
  repertoireName?: string;
};
