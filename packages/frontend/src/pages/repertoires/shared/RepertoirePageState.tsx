import React from "react";

interface RepertoirePageStateProps {
  status: "loading" | "error" | "notFound";
  message?: string;
}

const getStateMessage = (
  status: RepertoirePageStateProps["status"],
  message?: string
) => {
  if (status === "loading") {
    return "Loading repertoire...";
  }

  if (status === "notFound") {
    return "Repertoire not found";
  }

  return message || "Failed to fetch repertoire. Please try again later.";
};

export const RepertoirePageState: React.FC<RepertoirePageStateProps> = ({
  status,
  message,
}) => {
  const text = getStateMessage(status, message);

  return (
    <div className="w-full h-full bg-page text-text-base flex items-center justify-center">
      <div className="w-full max-w-md mx-4 px-6 py-8 border border-border-default rounded-xl bg-surface text-center">
        <p className="text-base sm:text-lg font-medium">{text}</p>
      </div>
    </div>
  );
};
