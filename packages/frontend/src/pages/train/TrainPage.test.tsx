import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TrainPage from "./TrainPage";
import * as trainRepository from "../../repository/train/train";

describe("TrainPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders grouped opening cards as clickable links", async () => {
    jest.spyOn(trainRepository, "getTrainOverview").mockResolvedValue({
      repertoires: [
        {
          repertoireId: "rep-1",
          repertoireName: "Main White",
          orientation: "white",
          openings: [
            {
              repertoireId: "rep-1",
              repertoireName: "Main White",
              openingName: "Italian Game",
              orientation: "white",
              openingFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              masteryScore: 62,
              dueVariantsCount: 2,
              dueMistakesCount: 1,
              totalVariantsCount: 4,
            },
          ],
        },
      ],
    });

    render(
      <MemoryRouter>
        <TrainPage />
      </MemoryRouter>
    );

    const openingLink = await screen.findByRole("link", {
      name: "Open Italian Game training summary",
    });
    expect(openingLink).toBeInTheDocument();
    expect(openingLink).toHaveAttribute(
      "href",
      "/train/repertoire/rep-1/opening/Italian%20Game"
    );
  });
});
