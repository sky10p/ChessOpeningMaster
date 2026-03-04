import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import RepertoiresPage from "./RepertoiresPage";
import * as repertoireRepository from "../../repository/repertoires/repertoires";
import {
  getRepertoireEditorRoute,
  getRepertoireOpeningRoute,
} from "../../utils/appRoutes";

const mockUpdateNavbarRepertoires = jest.fn();
const mockShowAlert = jest.fn();

jest.mock("../../contexts/NavbarContext", () => ({
  useNavbarDispatch: () => ({
    updateRepertoires: mockUpdateNavbarRepertoires,
  }),
}));

jest.mock("../../contexts/AlertContext", () => ({
  useAlertContext: () => ({
    showAlert: mockShowAlert,
  }),
}));

const overviewPayload = {
  repertoires: [
    {
      repertoireId: "rep-1",
      repertoireName: "Main White",
      orientation: "white" as const,
      order: 1,
      disabled: false,
      favorite: true,
      openingCount: 1,
      totalVariantsCount: 2,
      masteryScore: 62,
      dueVariantsCount: 1,
      dueMistakesCount: 0,
      statusCounts: {
        total: 2,
        noErrors: 1,
        oneError: 1,
        twoErrors: 0,
        moreThanTwoErrors: 0,
        unresolved: 0,
      },
      openings: [
        {
          repertoireId: "rep-1",
          repertoireName: "Main White",
          openingName: "Italian Game",
          orientation: "white" as const,
          masteryScore: 62,
          dueVariantsCount: 1,
          dueMistakesCount: 0,
          totalVariantsCount: 2,
          statusCounts: {
            total: 2,
            noErrors: 1,
            oneError: 1,
            twoErrors: 0,
            moreThanTwoErrors: 0,
            unresolved: 0,
          },
        },
      ],
    },
    {
      repertoireId: "rep-2",
      repertoireName: "Backup Black",
      orientation: "black" as const,
      order: 2,
      disabled: true,
      favorite: false,
      openingCount: 1,
      totalVariantsCount: 1,
      masteryScore: 0,
      dueVariantsCount: 1,
      dueMistakesCount: 1,
      statusCounts: {
        total: 1,
        noErrors: 0,
        oneError: 0,
        twoErrors: 0,
        moreThanTwoErrors: 0,
        unresolved: 1,
      },
      openings: [
        {
          repertoireId: "rep-2",
          repertoireName: "Backup Black",
          openingName: "Sicilian Defense",
          orientation: "black" as const,
          masteryScore: 0,
          dueVariantsCount: 1,
          dueMistakesCount: 1,
          totalVariantsCount: 1,
          statusCounts: {
            total: 1,
            noErrors: 0,
            oneError: 0,
            twoErrors: 0,
            moreThanTwoErrors: 0,
            unresolved: 1,
          },
        },
      ],
    },
    {
      repertoireId: "rep-3",
      repertoireName: "French Repertoire",
      orientation: "white" as const,
      order: 3,
      disabled: false,
      favorite: false,
      openingCount: 1,
      totalVariantsCount: 2,
      masteryScore: 88,
      dueVariantsCount: 0,
      dueMistakesCount: 0,
      statusCounts: {
        total: 2,
        noErrors: 2,
        oneError: 0,
        twoErrors: 0,
        moreThanTwoErrors: 0,
        unresolved: 0,
      },
      openings: [
        {
          repertoireId: "rep-3",
          repertoireName: "French Repertoire",
          openingName: "French Defense",
          orientation: "white" as const,
          masteryScore: 88,
          dueVariantsCount: 0,
          dueMistakesCount: 0,
          totalVariantsCount: 2,
          statusCounts: {
            total: 2,
            noErrors: 2,
            oneError: 0,
            twoErrors: 0,
            moreThanTwoErrors: 0,
            unresolved: 0,
          },
        },
      ],
    },
  ],
};

const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return <div data-testid="location-display">{`${location.pathname}${location.search}`}</div>;
};

const renderPage = (initialEntry = "/repertoires") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationDisplay />
      <Routes>
        <Route path="/repertoires" element={<RepertoiresPage />} />
        <Route path="/repertoires/:repertoireId/openings/:openingName" element={<div>Opening Route</div>} />
        <Route path="/repertoire/:id" element={<div>Editor Route</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("RepertoiresPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(repertoireRepository, "getRepertoireOverview")
      .mockResolvedValue(overviewPayload);
  });

  it("renders repertoire groups and opening rows", async () => {
    renderPage();

    expect(await screen.findByText("Main White")).toBeInTheDocument();
    expect(screen.getByText("Italian Game")).toBeInTheDocument();
    expect(screen.getByText("Backup Black")).toBeInTheDocument();
    expect(screen.getByText("Sicilian Defense")).toBeInTheDocument();
    expect(screen.getByText("French Repertoire")).toBeInTheDocument();
    expect(screen.getByText("French Defense")).toBeInTheDocument();
  });

  it("applies favorites-only filter from the URL", async () => {
    renderPage("/repertoires?favorites=only");

    expect(await screen.findByText("Main White")).toBeInTheDocument();
    expect(screen.queryByText("Backup Black")).not.toBeInTheDocument();
    expect(screen.queryByText("French Repertoire")).not.toBeInTheDocument();
  });

  it("applies mastery-range filter from the URL", async () => {
    renderPage("/repertoires?mastery=0-24");

    expect(await screen.findByText("Backup Black")).toBeInTheDocument();
    expect(screen.queryByText("Main White")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("0-24%")).toBeInTheDocument();
  });

  it("filters by query across repertoire and opening names", async () => {
    renderPage("/repertoires?q=french");

    expect(await screen.findByText("French Repertoire")).toBeInTheDocument();
    expect(screen.getByText("French Defense")).toBeInTheDocument();
    expect(screen.queryByText("Main White")).not.toBeInTheDocument();
    expect(screen.getByTestId("location-display")).toHaveTextContent("/repertoires?q=french");
  });

  it("filters openings by status from the URL", async () => {
    renderPage("/repertoires?status=successful");

    expect(await screen.findByText("French Repertoire")).toBeInTheDocument();
    expect(screen.queryByText("Main White")).not.toBeInTheDocument();
    expect(screen.queryByText("Backup Black")).not.toBeInTheDocument();
  });

  it("filters by orientation and availability from the URL", async () => {
    renderPage("/repertoires?orientation=black&availability=disabled");

    expect(await screen.findByText("Backup Black")).toBeInTheDocument();
    expect(screen.queryByText("Main White")).not.toBeInTheDocument();
    expect(screen.queryByText("French Repertoire")).not.toBeInTheDocument();
    expect(screen.getAllByText("Disabled").length).toBeGreaterThan(0);
  });

  it("updates favourite preference and refreshes navbar data", async () => {
    jest.spyOn(repertoireRepository, "updateRepertoirePreferences").mockResolvedValue({});

    renderPage();

    expect(await screen.findByText("Main White")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove favourite/i }));

    await waitFor(() => {
      expect(repertoireRepository.updateRepertoirePreferences).toHaveBeenCalledWith("rep-1", {
        favorite: false,
      });
      expect(mockUpdateNavbarRepertoires).toHaveBeenCalled();
    });
  });

  it("updates disabled preference", async () => {
    jest.spyOn(repertoireRepository, "updateRepertoirePreferences").mockResolvedValue({});

    renderPage();

    expect(await screen.findByText("French Repertoire")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /disable repertoire/i })[0]);

    await waitFor(() => {
      expect(repertoireRepository.updateRepertoirePreferences).toHaveBeenCalledWith("rep-1", {
        disabled: true,
      });
    });
  });

  it("clears active filters and removes the query string", async () => {
    renderPage("/repertoires?q=italian&favorites=only");

    expect(await screen.findByDisplayValue("italian")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));

    await waitFor(() => {
      expect(screen.getByTestId("location-display")).toHaveTextContent("/repertoires");
      expect(screen.getByDisplayValue("")).toBeInTheDocument();
    });
  });

  it("navigates to the opening detail route from the opening view action", async () => {
    renderPage();

    const openingTitle = await screen.findByText("Italian Game");
    const openingCard = openingTitle.closest("div[class*='min-h-[12rem]']");
    expect(openingCard).not.toBeNull();
    fireEvent.click(within(openingCard as HTMLElement).getAllByRole("button", { name: "View" })[0]);

    await waitFor(() => {
      expect(screen.getByTestId("location-display")).toHaveTextContent(
        getRepertoireOpeningRoute("rep-1", "Italian Game")
      );
    });
  });

  it("navigates to the repertoire editor route from the opening edit action", async () => {
    renderPage();

    const openingTitle = await screen.findByText("Italian Game");
    const openingCard = openingTitle.closest("div[class*='min-h-[12rem]']");
    expect(openingCard).not.toBeNull();
    fireEvent.click(within(openingCard as HTMLElement).getAllByRole("button", { name: "Edit" })[0]);

    await waitFor(() => {
      expect(screen.getByTestId("location-display")).toHaveTextContent(
        getRepertoireEditorRoute("rep-1", { variantName: "Italian Game" })
      );
    });
  });

  it("shows summary badges based on active repertoires only", async () => {
    renderPage();

    await screen.findByText("Main White");
    const header = screen.getByText("Repertoires");
    const headerElement = header.closest("header");
    expect(headerElement).not.toBeNull();
    expect(
      within(headerElement as HTMLElement).getByText((_, element) => element?.textContent === "2 active repertoires")
    ).toBeInTheDocument();
    expect(
      within(headerElement as HTMLElement).getByText((_, element) => element?.textContent === "2 openings")
    ).toBeInTheDocument();
    expect(
      within(headerElement as HTMLElement).getByText((_, element) => element?.textContent === "1 due variants")
    ).toBeInTheDocument();
    expect(
      within(headerElement as HTMLElement).getByText((_, element) => element?.textContent === "0 due mistakes")
    ).toBeInTheDocument();
  });

  it("shows clarified mastery and mistake badge help", async () => {
    renderPage();

    expect(await screen.findAllByText("62% mastery")).toHaveLength(2);

    const mistakesBadge = screen.getByText("1 mistakes");
    fireEvent.mouseEnter(mistakesBadge.parentElement as HTMLElement);

    expect(
      await screen.findByText(/they count mistake cards, not the number of error variants/i)
    ).toBeInTheDocument();
  });
});
