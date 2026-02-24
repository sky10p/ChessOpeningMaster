import React from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import { TrainVariant } from "../../../../models/chess.models";
import { MoveVariantNode } from "../../../../models/VariantNode";
import { getMovementsFromVariant } from "../../../../utils/chess/variants/getMovementsFromVariants";
import { cn } from "../../../../utils/cn";

interface TrainAvailableVariantsPanelProps {
  trainVariants: TrainVariant[];
  currentMoveNode: MoveVariantNode;
  onHintReveal: () => void;
  assistEnabled?: boolean;
  assistNotice?: string;
  title?: string;
}

export const TrainAvailableVariantsPanel: React.FC<
  TrainAvailableVariantsPanelProps
> = ({
  trainVariants,
  currentMoveNode,
  onHintReveal,
  assistEnabled = true,
  assistNotice,
  title = "Available Variants to Play",
}) => {
  const availableVariants = trainVariants.filter(
    (variant) => variant.state === "inProgress"
  );

  return (
    <div className="w-full rounded-xl border border-border-default bg-surface p-4">
      <h4 className="text-sm font-semibold text-text-base">{title}</h4>
      {assistNotice ? (
        <div className="mt-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          {assistNotice}
        </div>
      ) : null}
      {!assistEnabled ? (
        <div className="mt-2 rounded-md border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-text-muted">
          La ayuda se desbloquea tras el primer error en focus.
        </div>
      ) : availableVariants.length === 0 ? (
        <div className="mt-2 rounded-md border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-text-muted">
          No hay variantes candidatas en este punto.
        </div>
      ) : (
        <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
          {availableVariants.map((variant, index) => (
            <Disclosure
              key={`${variant.variant.fullName}-${currentMoveNode.id}-${currentMoveNode.position}-${index}`}
            >
              {({ open }) => (
                <>
                  <Disclosure.Button
                    onClick={() => {
                      if (!open) {
                        onHintReveal();
                      }
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-left text-sm font-medium text-text-base transition-colors hover:bg-interactive"
                  >
                    <span>{variant.variant.fullName}</span>
                    <ChevronUpIcon
                      className={cn(
                        "h-4 w-4 text-text-subtle transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-1 pb-1 pt-2 text-sm text-text-muted">
                    <div className="flex flex-wrap gap-2">
                      {getMovementsFromVariant(variant, currentMoveNode).map(
                        (move, moveIndex) => (
                          <span
                            key={moveIndex}
                            className="rounded-md border border-border-subtle bg-page px-2 py-1 text-text-base"
                          >
                            {move}
                          </span>
                        )
                      )}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </ul>
      )}
    </div>
  );
};
