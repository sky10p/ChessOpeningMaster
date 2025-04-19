import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { useStudyGroups } from '../hooks/useStudyGroups';
import * as repo from '../../../repository/studies/studies';

jest.mock('../../../repository/studies/studies');
const mockFetch = repo.fetchStudyGroups as jest.MockedFunction<typeof repo.fetchStudyGroups>;
const mockCreate = repo.createStudyGroup as jest.MockedFunction<typeof repo.createStudyGroup>;
const mockRename = repo.renameStudyGroup as jest.MockedFunction<typeof repo.renameStudyGroup>;
const mockDeleteGroup = repo.deleteStudyGroup as jest.MockedFunction<typeof repo.deleteStudyGroup>;
const mockCreateStudy = repo.createStudy as jest.MockedFunction<typeof repo.createStudy>;

const initialGroups = [
  { id: 'g1', name: 'Group One', studies: [{ id: 's1', name: 'Study One', tags: [], entries: [] }] },
];
const updatedGroups = [
  ...initialGroups,
  { id: 'g2', name: 'Group Two', studies: [] },
];

describe('useStudyGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue(initialGroups);
  });

  it('loads initial groups and sets activeGroupId', async () => {
    const { result } = renderHook(() => useStudyGroups());
    await waitFor(() => expect(result.current.groups).toEqual(initialGroups));
    expect(result.current.activeGroupId).toBe('g1');
  });

  it('addGroup calls createStudyGroup and refreshes groups', async () => {
    mockCreate.mockResolvedValue({ id: 'g2', name: 'Group Two', studies: [] });
    mockFetch.mockResolvedValueOnce(initialGroups).mockResolvedValueOnce(updatedGroups);
    const { result } = renderHook(() => useStudyGroups());
    await waitFor(() => expect(result.current.groups).toEqual(initialGroups));

    await act(async () => {
      await result.current.addGroup('Group Two');
    });
    expect(mockCreate).toHaveBeenCalledWith('Group Two');
    await waitFor(() => expect(result.current.groups).toEqual(updatedGroups));
  });

  it('editGroup calls renameStudyGroup and refreshes', async () => {
    mockRename.mockResolvedValue();
    mockFetch.mockResolvedValueOnce(initialGroups).mockResolvedValueOnce(updatedGroups);
    const { result } = renderHook(() => useStudyGroups());
    await waitFor(() => expect(result.current.groups).toEqual(initialGroups));

    await act(async () => {
      await result.current.editGroup('g1', 'New Name');
    });
    expect(mockRename).toHaveBeenCalledWith('g1', 'New Name');
    await waitFor(() => expect(result.current.groups).toEqual(updatedGroups));
  });

  it('deleteGroup calls deleteStudyGroup and resets selectedStudy', async () => {
    mockDeleteGroup.mockResolvedValue();
    mockFetch.mockResolvedValueOnce(initialGroups).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useStudyGroups());
    await waitFor(() => expect(result.current.groups).toEqual(initialGroups));
    if (initialGroups[0].studies && initialGroups[0].studies.length > 0) {
      act(() => { result.current.setSelectedStudy(initialGroups[0].studies[0]); });
    }

    await act(async () => {
      await result.current.deleteGroup('g1');
    });
    expect(mockDeleteGroup).toHaveBeenCalledWith('g1');
    await waitFor(() => expect(result.current.groups).toEqual([]));
    expect(result.current.selectedStudy).toBeNull();
  });

  it('addStudy calls createStudy and refreshes groups', async () => {
    mockCreateStudy.mockResolvedValue();
    mockFetch.mockResolvedValueOnce(initialGroups).mockResolvedValueOnce(updatedGroups);
    const { result } = renderHook(() => useStudyGroups());
    await waitFor(() => expect(result.current.groups).toEqual(initialGroups));

    await act(async () => {
      await result.current.addStudy('Study Two', ['tag1']);
    });
    expect(mockCreateStudy).toHaveBeenCalledWith('g1', 'Study Two', ['tag1']);
    await waitFor(() => expect(result.current.groups).toEqual(updatedGroups));
  });

  it('calculates allTags from groups', async () => {
    const multiStudyGroups = [
      { id: 'g1', name: 'G1', studies: [{ id: 's1', name: 'S1', tags: ['a','b'], entries: [] }] },
      { id: 'g2', name: 'G2', studies: [{ id: 's2', name: 'S2', tags: ['b','c'], entries: [] }] }
    ];
    mockFetch.mockResolvedValue(multiStudyGroups);
    const { result } = renderHook(() => useStudyGroups());
    await waitFor(() => expect(result.current.groups).toEqual(multiStudyGroups));
    expect(result.current.allTags.sort()).toEqual(['a','b','c']);
  });
});