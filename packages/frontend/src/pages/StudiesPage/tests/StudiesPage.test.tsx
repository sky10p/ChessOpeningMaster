import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import StudiesPage from "../StudiesPage";

const mockUseStudyGroups = jest.fn();
const mockUseStudyTimer = jest.fn();

jest.mock("../hooks/useStudyGroups", () => ({
  useStudyGroups: () => mockUseStudyGroups(),
}));

jest.mock("../hooks/useStudyTimer", () => ({
  useStudyTimer: () => mockUseStudyTimer(),
}));

jest.mock("../../../repository/studies/studies", () => ({
  fetchStudy: jest.fn().mockResolvedValue({ id: "s1", name: "Study1", tags: ["tag1"], entries: [], sessions: [] }),
  addStudySession: jest.fn(),
  deleteStudySession: jest.fn(),
  deleteStudy: jest.fn(),
  addStudyEntry: jest.fn(),
  editStudyEntry: jest.fn(),
  deleteStudyEntry: jest.fn(),
  addStudy: jest.fn(),
  fetchStudyGroups: jest.fn(),
  createStudyGroup: jest.fn(),
  renameStudyGroup: jest.fn(),
  deleteStudyGroup: jest.fn(),
  createStudy: jest.fn(),
}));

const createStudyGroupsState = (overrides: Partial<ReturnType<typeof mockUseStudyGroups>> = {}) => ({
  groups: [
    {
      id: "g1",
      name: "Group1",
      studies: [{ id: "s1", name: "Study1", tags: ["tag1"], entries: [], sessions: [] }],
    },
  ],
  loading: false,
  activeGroupId: "g1",
  setActiveGroupId: jest.fn(),
  selectedStudy: null,
  setSelectedStudy: jest.fn(),
  handleBackToStudies: jest.fn(),
  addGroup: jest.fn(),
  editGroup: jest.fn(),
  deleteGroup: jest.fn(),
  addStudy: jest.fn(),
  allTags: ["tag1"],
  refreshGroups: jest.fn(),
  ...overrides,
});

const createTimerState = (overrides: Partial<ReturnType<typeof mockUseStudyTimer>> = {}) => ({
  timerRunning: false,
  timerStart: null,
  timerElapsed: 0,
  startTimer: jest.fn(),
  pauseTimer: jest.fn(),
  resumeTimer: jest.fn(),
  finishTimer: jest.fn(),
  ...overrides,
});

const setMobileViewport = () => {
  window.innerWidth = 375;
  window.dispatchEvent(new Event("resize"));
};

describe("StudiesPage component", () => {
  beforeEach(() => {
    setMobileViewport();
    mockUseStudyGroups.mockReturnValue(createStudyGroupsState());
    mockUseStudyTimer.mockReturnValue(createTimerState());
  });

  it("renders the studies workspace shell", () => {
    render(<StudiesPage />);
    expect(screen.getByText("Studies")).toBeInTheDocument();
    expect(screen.getAllByText("Group1").length).toBeGreaterThan(0);
    expect(screen.getByText("Current Group")).toBeInTheDocument();
  });

  it("opens New Study modal when clicking New Study", () => {
    render(<StudiesPage />);
    fireEvent.click(screen.getByRole("button", { name: "New Study" }));
    expect(screen.getByLabelText("Study name")).toBeInTheDocument();
  });

  it("filters studies by tag", async () => {
    render(<StudiesPage />);
    const filterInput = screen.getByPlaceholderText("Type to filter or add tag");
    fireEvent.change(filterInput, { target: { value: "tag1" } });
    await waitFor(() => expect(screen.getByText("Add Tag")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Add Tag"));
    const tagElements = screen.getAllByText("tag1");
    expect(tagElements.length).toBeGreaterThan(0);
  });

  it("displays study list with entries and sessions metadata", () => {
    render(<StudiesPage />);
    expect(screen.getByText("Study1")).toBeInTheDocument();
    expect(screen.getByText("0 entries")).toBeInTheDocument();
    expect(screen.getByText("0 sessions")).toBeInTheDocument();
  });

  it("renders mobile group controls with accessible labels", () => {
    render(<StudiesPage />);
    expect(screen.getAllByLabelText("New group").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Edit group").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Delete group").length).toBeGreaterThan(0);
  });

  it("places the mobile focus section before the secondary stats strip", () => {
    render(<StudiesPage />);

    const focusHeading = screen.getByText("Current focus");
    const timerStats = screen.getAllByText("Timer");
    const timerStat = timerStats[timerStats.length - 1];

    expect(focusHeading.compareDocumentPosition(timerStat) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("switches the mobile primary action to add entry when a study is selected", () => {
    mockUseStudyGroups.mockReturnValue(
      createStudyGroupsState({
        selectedStudy: {
          id: "s1",
          name: "Study1",
          tags: ["tag1"],
          entries: [],
          sessions: [],
        },
      })
    );

    render(<StudiesPage />);

    expect(screen.getAllByRole("button", { name: /add entry/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "New Study" })).not.toBeInTheDocument();
  });

  it("renders practice before entries in the mobile study detail flow", () => {
    mockUseStudyGroups.mockReturnValue(
      createStudyGroupsState({
        selectedStudy: {
          id: "s1",
          name: "Study1",
          tags: ["tag1"],
          entries: [],
          sessions: [],
        },
      })
    );

    render(<StudiesPage />);

    const practiceHeading = screen.getByText("Practice");
    const entriesHeading = screen.getByText("Entries");

    expect(practiceHeading.compareDocumentPosition(entriesHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
