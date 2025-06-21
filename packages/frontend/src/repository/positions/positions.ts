import { API_URL } from "../constants";

export const getPositionComment = async (
  fen: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      `${API_URL}/positions/${encodeURIComponent(fen)}`
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch position comment");
    }

    const data = await response.json();
    return data.comment;
  } catch (error) {
    console.error("Error fetching position comment:", error);
    return null;
  }
};

export const updatePositionComment = async (
  fen: string,
  comment: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_URL}/positions/${encodeURIComponent(fen)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update position comment");
    }
  } catch (error) {
    console.error("Error updating position comment:", error);
    throw error;
  }
};

export const getCommentsByFens = async (
  fens: string[]
): Promise<Record<string, string>> => {
  if (fens.length === 0) {
    return {};
  }
  
  try {
    const queryParams = new URLSearchParams();
    fens.forEach(fen => queryParams.append('fens', fen));
    
    const response = await fetch(`${API_URL}/positions/comments?${queryParams.toString()}`);
    if (!response.ok) {
      console.error("Error fetching position comments:", new Error(`HTTP ${response.status}`));
      return {};
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching comments by FENs:", error);
    return {};
  }
};
