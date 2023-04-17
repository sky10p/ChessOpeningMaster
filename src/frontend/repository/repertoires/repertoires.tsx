import { IMoveNode } from "../../../common/types/MoveNode";
import { API_URL } from "../constants";

export const getRepertoires = async () => {
  const response = await fetch(`${API_URL}/repertoires`);
  const data = await response.json();
  return data;
};

export const getRepertoire = async (id: string) => {
  const response = await fetch(`${API_URL}/repertoires/${id}`);
  const data = await response.json();
  return data;
};

export const createRepertoire = async (nameRepertory: string, moveNodes?: IMoveNode) => {
  const response = await fetch(`${API_URL}/repertoires`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: nameRepertory, moveNodes }),
  });
  const data = await response.json();
  return data;
};

export const putRepertoire = async (id: string, nameRepertory: string, moveNodes: IMoveNode) => {
  const response = await fetch(`${API_URL}/repertoires/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: nameRepertory, moveNodes }),
  });
  const data = await response.json();
  return data;
}

