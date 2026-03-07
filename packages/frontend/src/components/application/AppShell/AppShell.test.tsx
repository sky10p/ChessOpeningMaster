import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AppShell } from "./AppShell";
import * as repertoireRepository from "../../../repository/repertoires/repertoires";

const mockSetOpen = jest.fn();
const mockUpdateRepertoires = jest.fn();
const mockToggleTheme = jest.fn();

jest.mock("../../../contexts/HeaderContext", () => ({
  useHeaderState: () => ({
    icons: [],
    isSaving: false,
  }),
}));

jest.mock("../../../contexts/NavbarContext", () => ({
  useNavbarState: () => ({
    open: false,
    repertoires: [
      {
        _id: "rep-1",
        name: "Main White",
        favorite: true,
        disabled: false,
        orientation: "white",
        order: 1,
      },
    ],
  }),
  useNavbarDispatch: () => ({
    setOpen: mockSetOpen,
    updateRepertoires: mockUpdateRepertoires,
  }),
}));

jest.mock("../../../contexts/FooterContext", () => ({
  useFooterState: () => ({
    isVisible: false,
    icons: [],
  }),
}));

jest.mock("../../../hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "dark",
    toggleTheme: mockToggleTheme,
  }),
}));

jest.mock("../../../repository/auth/auth", () => ({
  logout: jest.fn(),
}));

const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

const renderShell = (initialEntry = "/dashboard") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppShell authEnabled={false} authenticated onLoggedOut={jest.fn()}>
        <LocationDisplay />
      </AppShell>
    </MemoryRouter>
  );

describe("AppShell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(repertoireRepository, "getRepertoireOverview").mockResolvedValue({
      repertoires: [
        {
          repertoireId: "rep-1",
          repertoireName: "Main White",
          orientation: "white",
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
              orientation: "white",
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
      ],
    });
  });

  it("returns opening matches from quick search", async () => {
    renderShell();

    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    const dialog = screen.getByRole("dialog", { name: /quick search/i });
    fireEvent.change(within(dialog).getByLabelText(/search library/i), {
      target: { value: "italian" },
    });

    const openingResult = await within(dialog).findByRole("button", { name: /italian game/i });
    expect(within(dialog).getByText("Main White")).toBeInTheDocument();

    fireEvent.click(openingResult);

    await waitFor(() => {
      expect(screen.getByTestId("location-display")).toHaveTextContent("/repertoires/rep-1/openings/Italian%20Game");
    });
  });
});
