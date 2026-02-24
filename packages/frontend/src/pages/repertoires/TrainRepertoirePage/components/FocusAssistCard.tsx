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
              ? "Error detectado. Revisa comentarios y variantes candidatas."
              : "Se activara en cuanto cometas tu primer error."}
          </p>
        </div>
        <Badge variant={pendingErrorCount > 0 ? "warning" : "info"} size="sm">
          {pendingErrorCount} pendientes
        </Badge>
      </div>

      {!hasErrors ? (
        <div className="mt-3 rounded-lg border border-border-subtle bg-surface px-3 py-3 text-sm text-text-muted">
          Durante focus mode no se muestran ayudas persistentes. Este bloque aparecera con contenido cuando falle una jugada.
        </div>
      ) : (
        <>
          <Tabs variant="segment" className="mt-3">
            <TabButton
              variant="segment"
              active={activeTab === "comments"}
              onClick={() => setActiveTab("comments")}
            >
              Comentarios
            </TabButton>
            <TabButton
              variant="segment"
              active={activeTab === "variants"}
              onClick={() => setActiveTab("variants")}
            >
              Variantes candidatas
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
                title="Variantes candidatas"
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
