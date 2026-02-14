import { BoardOrientation, IMoveNode, IRepertoireDashboard } from "@chess-opening-master/common";
import { API_URL } from "../constants"
import { apiFetch } from "../apiClient";

const parseDownloadFileName = (response: Response, fallback: string): string => {
  const disposition = response.headers.get("content-disposition");
  if (!disposition) {
    return fallback;
  }

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return fallback;
};

const triggerFileDownload = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const getRepertoires = async () => {
  const response = await apiFetch(`${API_URL}/repertoires`);
  const data = await response.json();
  return data;
};

export const getFullInfoRepertoires = async (): Promise<IRepertoireDashboard[]> => {
  const response = await apiFetch(`${API_URL}/repertoires/full`);
  const data = await response.json();
  return data;
}

export const getRepertoire = async (id: string) => {
  const response = await apiFetch(`${API_URL}/repertoires/${id}`);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  const data = await response.json();
  if (!data?._id) {
    throw new Error("Repertoire not found");
  }
  return data;
};

export const createRepertoire = async (nameRepertory: string, moveNodes?: IMoveNode) => {
  const response = await apiFetch(`${API_URL}/repertoires`, {
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
  const response = await apiFetch(`${API_URL}/repertoires/${id}/duplicate`, {
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
  const response = await apiFetch(`${API_URL}/repertoires/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: nameRepertory, moveNodes, orientation }),
  });
  const data = await response.json();
  return data;
};

export const putRepertoireName = async (id: string, nameRepertory: string) => {
  const response = await apiFetch(`${API_URL}/repertoires/${id}/name`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: nameRepertory }),
  });
  const data = await response.json();
  return data;
};

export const putRepertoireOrderUp = async (id: string) => {
  const response = await apiFetch(`${API_URL}/repertoires/${id}/order/up`, {
    method: "PATCH",
  });
  const data = await response.json();
  return data;
};

export const deleteRepertoire = async (id: string) => {
  const response = await apiFetch(`${API_URL}/repertoires/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
};

export const enableRepertoire = async (id: string) => {
  const response = await apiFetch(`${API_URL}/repertoires/${id}/enable`, {
    method: "PUT",
  });
  const data = await response.json();
  return data;
};

export const disableRepertoire = async (id: string) => {
  const response = await apiFetch(`${API_URL}/repertoires/${id}/disable`, {
    method: "PUT",
  });
  const data = await response.json();
  return data;
};

export const downloadRepertoiresBackup = async (): Promise<void> => {
  const response = await apiFetch(`${API_URL}/repertoires/download`);
  if (!response.ok) {
    throw new Error("Unable to download repertoires");
  }
  const blob = await response.blob();
  const fileName = parseDownloadFileName(response, "chess-openings-backup.zip");
  triggerFileDownload(blob, fileName);
};

export const downloadRepertoireJson = async (id: string, repertoireName: string): Promise<void> => {
  const response = await apiFetch(`${API_URL}/repertoires/${id}/download`);
  if (!response.ok) {
    throw new Error("Unable to download repertoire");
  }
  const blob = await response.blob();
  const fileName = parseDownloadFileName(response, `${repertoireName || "repertoire"}.json`);
  triggerFileDownload(blob, fileName);
};

