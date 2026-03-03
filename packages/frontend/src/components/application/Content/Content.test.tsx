import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Content from "./Content";

jest.mock("../../../pages/repertoires/CreateRepertoire", () => () => <div>Create Repertoire</div>);
jest.mock("../../../pages/repertoires/EditRepertoirePage/EditRepertoirePage", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");
  const { useLocation } = jest.requireActual("react-router-dom") as typeof import("react-router-dom");
  return function MockEditRepertoirePage() {
    const location = useLocation();
    return ReactModule.createElement("div", null, `editor:${location.pathname}${location.search}`);
  };
});
jest.mock("../../../pages/repertoires/TrainRepertoirePage/TrainRepertoirePage", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");
  const { useLocation } = jest.requireActual("react-router-dom") as typeof import("react-router-dom");
  return function MockTrainRepertoirePage() {
    const location = useLocation();
    return ReactModule.createElement("div", null, `train-repertoire:${location.pathname}${location.search}`);
  };
});
jest.mock("../../../pages/repertoires/RepertoiresPage", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");
  const { useLocation } = jest.requireActual("react-router-dom") as typeof import("react-router-dom");
  return function MockRepertoiresPage() {
    const location = useLocation();
    return ReactModule.createElement("div", null, `repertoires:${location.pathname}${location.search}`);
  };
});
jest.mock("../../../pages/DashboardPage/DashboardPage", () => ({
  DashboardPage: () => <div>Dashboard</div>,
}));
jest.mock("../../../pages/PathPage/PathPage", () => () => <div>Path</div>);
jest.mock("../../../pages/StudiesPage/StudiesPage", () => () => <div>Studies</div>);
jest.mock("../../../pages/games/GamesPage", () => () => <div>Games</div>);
jest.mock("../../../pages/train/TrainPage", () => () => <div>Train</div>);
jest.mock("../../../pages/train/TrainOpeningPage", () => {
  const ReactModule = jest.requireActual("react") as typeof import("react");
  const { useLocation } = jest.requireActual("react-router-dom") as typeof import("react-router-dom");
  return function MockTrainOpeningPage() {
    const location = useLocation();
    return ReactModule.createElement("div", null, `opening:${location.pathname}${location.search}`);
  };
});

describe("Content", () => {
  const baseProps = {
    authEnabled: false,
    authenticated: true,
    allowDefaultUser: false,
    onAuthenticated: jest.fn(),
  };

  it("redirects legacy train execution routes to /train/repertoires preserving the query", () => {
    render(
      <MemoryRouter initialEntries={["/repertoire/train/rep-1?variantName=Italian%20Game"]}>
        <Content {...baseProps} />
      </MemoryRouter>
    );

    expect(
      screen.getByText("train-repertoire:/train/repertoires/rep-1?variantName=Italian%20Game")
    ).toBeInTheDocument();
  });

  it("redirects legacy train opening routes to canonical repertoire opening routes preserving the query", () => {
    render(
      <MemoryRouter initialEntries={["/train/repertoire/rep-1/opening/Italian Game?returnTo=%2Frepertoires"]}>
        <Content {...baseProps} />
      </MemoryRouter>
    );

    expect(
      screen.getByText("opening:/repertoires/rep-1/openings/Italian%20Game?returnTo=%2Frepertoires")
    ).toBeInTheDocument();
  });
});
