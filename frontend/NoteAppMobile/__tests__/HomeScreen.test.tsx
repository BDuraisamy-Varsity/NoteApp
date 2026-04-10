import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';
import {notesApi} from '../src/services/api';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  default: () => ({width: 375, height: 812}),
}));
jest.mock('../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff', surface: '#f5f5f5', card: '#fff',
      primary: '#6200ee', textPrimary: '#000', textSecondary: '#666',
      textOnPrimary: '#fff', border: '#e0e0e0', error: '#b00020',
      tagBackground: '#e8e0ff', tagText: '#6200ee',
    },
    isDark: false,
  }),
}));
jest.mock('../src/contexts/AccessibilityContext', () => ({
  useAccessibility: () => ({
    typography: {xs: 11, sm: 13, md: 16, lg: 20, xl: 24, xxl: 30, title: 36},
  }),
}));
jest.mock('../src/services/api', () => ({
  notesApi: {getAll: jest.fn(), search: jest.fn()},
}));

const mockGetAll = notesApi.getAll as jest.Mock;

const sampleNote = {
  id: '1',
  title: 'Test Note',
  body: 'Some content',
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z',
  tags: [],
  todoItems: [],
};

beforeEach(() => jest.clearAllMocks());

describe('HomeScreen', () => {
  it('shows empty state when no notes exist', async () => {
    mockGetAll.mockResolvedValue([]);

    const {getByText} = render(
      <HomeScreen onNotePress={() => {}} onCreatePress={() => {}} />,
    );

    await waitFor(() => {
      expect(getByText(/No notes yet/)).toBeTruthy();
    });
  });

  it('renders notes returned from the API', async () => {
    mockGetAll.mockResolvedValue([sampleNote]);

    const {getByText} = render(
      <HomeScreen onNotePress={() => {}} onCreatePress={() => {}} />,
    );

    await waitFor(() => {
      expect(getByText('Test Note')).toBeTruthy();
    });
  });

  it('calls onCreatePress when FAB is tapped', async () => {
    mockGetAll.mockResolvedValue([]);
    const onCreatePress = jest.fn();

    const {getByLabelText} = render(
      <HomeScreen onNotePress={() => {}} onCreatePress={onCreatePress} />,
    );

    fireEvent.press(getByLabelText('Create new note'));
    expect(onCreatePress).toHaveBeenCalledTimes(1);
  });

  it('calls onNotePress with the note when a card is tapped', async () => {
    mockGetAll.mockResolvedValue([sampleNote]);
    const onNotePress = jest.fn();

    const {getByLabelText} = render(
      <HomeScreen onNotePress={onNotePress} onCreatePress={() => {}} />,
    );

    await waitFor(() => {
      fireEvent.press(getByLabelText('Note: Test Note'));
    });

    expect(onNotePress).toHaveBeenCalledWith(sampleNote);
  });

  it('shows error message when API call fails', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));

    const {getByText} = render(
      <HomeScreen onNotePress={() => {}} onCreatePress={() => {}} />,
    );

    await waitFor(() => {
      expect(getByText(/Failed to load notes/)).toBeTruthy();
    });
  });
});
