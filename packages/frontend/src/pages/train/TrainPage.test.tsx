import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TrainPage from "./TrainPage";

describe("TrainPage", () => {
  it("redirects legacy /train usage to /repertoires", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/train?status=errors"]}>
        <Routes>
          <Route path="/train" element={<TrainPage />} />
          <Route path="/repertoires" element={<div data-testid="repertoires-target" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(container.querySelector('[data-testid="repertoires-target"]')).toBeInTheDocument();
  });
});
