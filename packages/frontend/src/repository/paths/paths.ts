import { Path } from "../../models/Path";
import { API_URL } from "../constants";

export async function fetchPath(): Promise<Path> {
  const res = await fetch(`${API_URL}/paths`);
  if (!res.ok) throw new Error("Failed to fetch path");
  return res.json();
}
