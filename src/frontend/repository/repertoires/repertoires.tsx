import { IMoveNode } from "../../../common/types/MoveNode";
import { Orientation } from "../../../common/types/Orientation";
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

export const putRepertoire = async (id: string, nameRepertory: string, moveNodes: IMoveNode, orientation: Orientation) => {
  const response = await fetch(`${API_URL}/repertoires/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: nameRepertory, moveNodes, orientation }),
  });
  const data = await response.json();
  return data;
}

export const deleteRepertoire = async (id: string) => {
  const response = await fetch(`${API_URL}/repertoires/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
}

