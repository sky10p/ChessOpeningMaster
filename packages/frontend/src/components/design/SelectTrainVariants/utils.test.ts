import { TrainVariantInfo } from "@chess-opening-master/common";
import { TrainVariant } from "../../../models/chess.models";
import {
  getVariantsProgressInfo,
  isVariantsProgressMastered,
} from "./utils";

const makeVariant = (name: string): TrainVariant => ({
  variant: {
    moves: [],
    name,
    fullName: name,
    differentMoves: "",
  },
  state: "inProgress",
});

describe("SelectTrainVariants utils", () => {
  it("treats only fully reviewed zero-error progress as mastered", () => {
    const variantInfo: Record<string, TrainVariantInfo> = {
      alpha: {
        repertoireId: "rep-1",
        variantName: "alpha",
        errors: 0,
        lastDate: new Date("2026-03-03T00:00:00.000Z"),
      },
      beta: {
        repertoireId: "rep-1",
        variantName: "beta",
        errors: 0,
        lastDate: new Date("2026-03-03T00:00:00.000Z"),
      },
    };

    expect(
      isVariantsProgressMastered(
        getVariantsProgressInfo([makeVariant("alpha"), makeVariant("beta")], variantInfo)
      )
    ).toBe(true);
    expect(
      isVariantsProgressMastered(getVariantsProgressInfo([makeVariant("alpha")], {}))
    ).toBe(false);
    expect(
      isVariantsProgressMastered(
        getVariantsProgressInfo([makeVariant("alpha")], {
          alpha: {
            repertoireId: "rep-1",
            variantName: "alpha",
            errors: 1,
            lastDate: new Date("2026-03-03T00:00:00.000Z"),
          },
        })
      )
    ).toBe(false);
  });
});
