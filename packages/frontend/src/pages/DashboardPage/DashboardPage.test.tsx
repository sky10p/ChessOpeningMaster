/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import * as useDashboardModule from "../../hooks/useDashboard";
import { DashboardPage } from "./DashboardPage";
import "@testing-library/jest-dom";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import { Color, Square, PieceSymbol } from "chess.js";

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  
  window.ResizeObserver = ResizeObserver;

const emptyMoveNode = { id: "root", move: null, children: [] };
const mockRepertoires: IRepertoireDashboard[] = [
  {
    _id: "1",
    name: "Test Repertoire",
    orientation: "white",
    moveNodes: emptyMoveNode,
    variantsInfo: [],
    order: 0,
  },
];

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: mockRepertoires,
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
  });

  it("renders Dashboard and Openings tabs", () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    expect(screen.getByRole("button", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /openings/i })).toBeInTheDocument();
  });

  it("shows Dashboard section by default", () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Key statistics and metrics for your chess repertoires./i)).toBeInTheDocument();
  });

  it("switches to Openings section when tab is clicked", () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /openings/i }));
    expect(screen.getByText(/browse your prepared openings/i)).toBeInTheDocument();
  });
});

describe("Openings section behaviors", () => {
  const validMove = {
    from: "e2" as Square,
    to: "e4" as Square,
    lan: "e2e4",
    san: "e4",
    color: "w" as Color,
    flags: "b",
    piece: "p" as PieceSymbol,
    before: "start_fen",
    after: "after_e2e4_fen",
  };

  const openingMoveNode = (name: string) => ({
    id: "root",
    move: null,
    children: [
      {
        id: name,
        move: validMove,
        variantName: name,
        children: [],
      },
    ],
  });

  const makeRep = (
    id: string,
    name: string,
    orientation: "white" | "black",
    openingName: string
  ): IRepertoireDashboard => ({
    _id: id,
    name,
    orientation,
    moveNodes: openingMoveNode(openingName),
    variantsInfo: [
      {
        variantName: openingName,
        repertoireId: id,
        errors: 0,
        lastDate: new Date(),
      },
    ],
    order: 0,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows single repertoire directly for an opening", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [makeRep("1", "Rep1", "white", "Ruy Lopez")],
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /openings/i }));
    expect(screen.getByText("Ruy Lopez")).toBeInTheDocument();
    expect(screen.getByText("Rep1")).toBeInTheDocument();
    expect(screen.queryByText(/Show/)).not.toBeInTheDocument();
  });

  it("shows expand/collapse for multiple repertoires for an opening", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [
        makeRep("1", "Rep1", "white", "Ruy Lopez"),
        makeRep("2", "Rep2", "black", "Ruy Lopez"),
      ],
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /openings/i }));
    expect(screen.getByText("Ruy Lopez")).toBeInTheDocument();
    const showBtn = screen.getByRole("button", { name: /Show 2 repertoires/i });
    expect(showBtn).toBeInTheDocument();
    fireEvent.click(showBtn);
    expect(screen.getByText("Rep1")).toBeInTheDocument();
    expect(screen.getByText("Rep2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Hide repertoires/i }));
    expect(screen.queryByText("Rep1")).not.toBeInTheDocument();
  });

  it("shows 'No repertoires' if none for an opening", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [],
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /openings/i }));
    expect(screen.queryByText("Ruy Lopez")).not.toBeInTheDocument();
    expect(screen.queryByText("Italian Game")).not.toBeInTheDocument();
  });

  it("filters openings by name", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [
        makeRep("1", "Rep1", "white", "Ruy Lopez"),
        makeRep("2", "Rep2", "black", "Italian Game"),
      ],
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /openings/i }));
    const filterInput = screen.getByPlaceholderText(/filter openings/i);
    fireEvent.change(filterInput, { target: { value: "italian" } });
    expect(screen.getByText("Italian Game")).toBeInTheDocument();
    expect(screen.queryByText("Ruy Lopez")).not.toBeInTheDocument();
  });

  it("View button is present and clickable in Openings section", () => {
    jest.spyOn(useDashboardModule, "useDashboard").mockReturnValue({
      repertoires: [makeRep("1", "Rep1", "white", "Ruy Lopez")],
      setRepertoires: jest.fn(),
      updateRepertoires: jest.fn().mockResolvedValue(undefined),
    });
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /openings/i }));
    const viewBtn = screen.getByRole("button", { name: /^view$/i });
    expect(viewBtn).toBeInTheDocument();
    fireEvent.click(viewBtn);
  });
});