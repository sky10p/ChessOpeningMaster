import React from "react";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { BoardOrientation } from "@chess-opening-master/common";
import { HintInfo } from "../../../../components/design/chess/train/HintInfo";
import { TrainVariant } from "../../../../models/chess.models";
import { TrainAvailableVariantsPanel } from "../../../../components/design/chess/train/TrainAvailableVariantsPanel";
import { Badge, Card, TabButton, Tabs } from "../../../../components/ui";

interface FocusAssistCardProps {
  hasErrors: boolean;
  pendingErrorCount: number;
  currentMoveNode: MoveVariantNode;
  orientation: BoardOrientation;
  updateComment: (comment: string) => Promise<void>;
  trainVariants: TrainVariant[];
  onHintReveal: () => void;
}

type AssistTab = "comments" | "variants";

export const FocusAssistCard: React.FC<FocusAssistCardProps> = ({
  hasErrors,
  pendingErrorCount,
  currentMoveNode,
  orientation,
  updateComment,
  trainVariants,
  onHintReveal,
}) => {
  const [activeTab, setActiveTab] = React.useState<AssistTab>("comments");

  React.useEffect(() => {
    if (!hasErrors) {
      setActiveTab("comments");
    }
  }, [hasErrors]);

  return (
    <Card className="border-border-subtle bg-surface-raised" padding="compact">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-text-base">Focus Assist</p>
          <p className="text-xs text-text-muted">
            {hasErrors
              ? "Error detected. Review comments and candidate lines."
              : "It activates after your first mistake."}
          </p>
        </div>
        <Badge variant={pendingErrorCount > 0 ? "warning" : "info"} size="sm">
          {pendingErrorCount} pending
        </Badge>
      </div>

      {!hasErrors ? (
        <div className="mt-3 rounded-lg border border-border-subtle bg-surface px-3 py-3 text-sm text-text-muted">
          In focus mode, persistent guidance stays hidden. This block appears after you miss a move.
        </div>
      ) : (
        <>
          <Tabs variant="segment" className="mt-3">
            <TabButton
              variant="segment"
              active={activeTab === "comments"}
              onClick={() => setActiveTab("comments")}
            >
              Comments
            </TabButton>
            <TabButton
              variant="segment"
              active={activeTab === "variants"}
              onClick={() => setActiveTab("variants")}
            >
              Candidate lines
            </TabButton>
          </Tabs>
          <div className="mt-3 max-h-[40vh] overflow-y-auto pr-1">
            {activeTab === "comments" ? (
              <HintInfo
                currentMoveNode={currentMoveNode}
                orientation={orientation}
                updateComment={updateComment}
                compact={true}
              />
            ) : (
              <TrainAvailableVariantsPanel
                title="Candidate lines"
                trainVariants={trainVariants}
                currentMoveNode={currentMoveNode}
                onHintReveal={onHintReveal}
                assistEnabled={true}
              />
            )}
          </div>
        </>
      )}
    </Card>
  );
};
