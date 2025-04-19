import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudiesPage from '../StudiesPage';

jest.mock('../hooks/useStudyGroups', () => ({
  useStudyGroups: () => ({
    groups: [
      { id: 'g1', name: 'Group1', studies: [{ id: 's1', name: 'Study1', tags: ['tag1'], entries: [] }] },
    ],
    activeGroupId: 'g1',
    setActiveGroupId: jest.fn(),
    selectedStudy: null,
    setSelectedStudy: jest.fn(),
    addGroup: jest.fn(),
    editGroup: jest.fn(),
    deleteGroup: jest.fn(),
    addStudy: jest.fn(),
    allTags: ['tag1'],
    refreshGroups: jest.fn(),
  }),
}));

jest.mock('../hooks/useStudyTimer', () => ({
  useStudyTimer: () => ({
    timerRunning: false,
    timerStart: null,
    timerElapsed: 0,
    startTimer: jest.fn(),
    pauseTimer: jest.fn(),
    resumeTimer: jest.fn(),
    finishTimer: jest.fn(),
  }),
}));

jest.mock('../../../repository/studies/studies', () => ({
  fetchStudy: jest.fn().mockResolvedValue({ id: 's1', name: 'Study1', tags: ['tag1'], entries: [], sessions: [] }),
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

describe('StudiesPage component', () => {
  it('renders StudyGroupSidebar with group names', () => {
    render(<StudiesPage />);
    expect(screen.getByText('Group1 Studies')).toBeInTheDocument();
  });

  it('opens New Study modal when clicking + New Study', () => {
    render(<StudiesPage />);
    const newStudyBtn = screen.getByText('+ New Study');
    fireEvent.click(newStudyBtn);
    expect(screen.getByPlaceholderText('Study name *')).toBeInTheDocument();
  });

  it('filters studies by tag', async () => {
    render(<StudiesPage />);
    const filterInput = screen.getByPlaceholderText('Type to filter or add tag');
    fireEvent.change(filterInput, { target: { value: 'tag1' } });
    await waitFor(() => expect(screen.getByText('Add Tag')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Add Tag'));
    const tagElements = screen.getAllByText('tag1');
    expect(tagElements.length).toBeGreaterThan(0);
  });

  it('displays study list with entries count', () => {
    render(<StudiesPage />);
    expect(screen.getByText('Study1')).toBeInTheDocument();
    expect(screen.getByText('0 entries')).toBeInTheDocument();
  });
});