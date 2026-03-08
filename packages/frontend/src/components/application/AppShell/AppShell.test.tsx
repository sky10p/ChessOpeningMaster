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

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
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
    setViewportWidth(1280);
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    });
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

    await waitFor(() => {
      expect(repertoireRepository.getRepertoireOverview).toHaveBeenCalledTimes(1);
    });

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

  it("does not refetch the overview on each quick-search keystroke", async () => {
    renderShell();

    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(repertoireRepository.getRepertoireOverview).toHaveBeenCalledTimes(1);
    });

    const dialog = screen.getByRole("dialog", { name: /quick search/i });
    const input = within(dialog).getByLabelText(/search library/i);

    fireEvent.change(input, { target: { value: "ita" } });
    fireEvent.change(input, { target: { value: "ital" } });
    fireEvent.change(input, { target: { value: "italian" } });

    await within(dialog).findByRole("button", { name: /italian game/i });
    expect(repertoireRepository.getRepertoireOverview).toHaveBeenCalledTimes(1);
  });

  it("shows dedicated route copy for path", () => {
    renderShell("/path?view=forecast");

    expect(screen.getByText("Path")).toBeInTheDocument();
    expect(
      screen.getByText("Plan the queue, inspect the forecast, and switch into the next lesson when you are ready to execute.")
    ).toBeInTheDocument();
  });

  it("keeps the mobile header stable and uses an expandable bottom dock", () => {
    setViewportWidth(390);
    renderShell("/repertoires");

    const mobileHeader = screen.getByTestId("app-shell-mobile-header");
    const mobileNav = screen.getByTestId("app-shell-mobile-nav");
    const navToggle = screen.getByTestId("app-shell-mobile-nav-toggle");

    expect(mobileHeader.className).toContain("sticky top-0");
    expect(mobileNav).toBeInTheDocument();
    expect(within(mobileHeader).getByText("Repertoires")).toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue("--app-mobile-bottom-offset")).toBe("5.5rem");

    fireEvent.click(navToggle);

    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Repertoires" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue("--app-mobile-bottom-offset")).toBe("14rem");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 160,
    });
    fireEvent.scroll(window);

    expect(within(mobileHeader).getByText("Repertoires")).toBeInTheDocument();
  });
});
