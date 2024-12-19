import { IMoveNode } from "../../../../common/src/types/MoveNode";
import { BoardOrientation } from "../../../../common/src/types/Orientation";
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

export const duplicateRepertoire = async (id: string, nameRepertory: string) => {
  const response = await fetch(`${API_URL}/repertoires/${id}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: nameRepertory }),
  });
  const data = await response.json();
  return data;
}

export const putRepertoire = async (id: string, nameRepertory: string, moveNodes: IMoveNode, orientation: BoardOrientation) => {
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

export const putRepertoireName = async (id: string, nameRepertory: string) => {
  const response = await fetch(`${API_URL}/repertoires/${id}/name`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: nameRepertory }),
  });
  const data = await response.json();
  return data;
}

export const putRepertoireOrderUp = async (id: string) => {
  const response = await fetch(`${API_URL}/repertoires/${id}/order/up`, {
    method: "PATCH",
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

