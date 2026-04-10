import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import EditNoteScreen from '../src/screens/EditNoteScreen';
import {notesApi} from '../src/services/api';

jest.mock('../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff', surface: '#f5f5f5', card: '#fff',
      primary: '#6200ee', textPrimary: '#000', textSecondary: '#666',
      textOnPrimary: '#fff', border: '#e0e0e0', error: '#b00020',
      tagBackground: '#e8e0ff', tagText: '#6200ee',
    },
  }),
}));
jest.mock('../src/contexts/AccessibilityContext', () => ({
  useAccessibility: () => ({
    typography: {xs: 11, sm: 13, md: 16, lg: 20, xl: 24, xxl: 30, title: 36},
  }),
}));
jest.mock('../src/services/api', () => ({
  notesApi: {create: jest.fn()},
}));

const mockCreate = notesApi.create as jest.Mock;

const createdNote = {
  id: 'abc-123',
  title: 'My Note',
  body: 'Hello world',
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z',
  tags: [],
  todoItems: [],
};

beforeEach(() => jest.clearAllMocks());

describe('EditNoteScreen', () => {
  it('renders title and body inputs', () => {
    const {getByLabelText} = render(
      <EditNoteScreen onSave={() => {}} onCancel={() => {}} />,
    );
    expect(getByLabelText('Note title')).toBeTruthy();
    expect(getByLabelText('Note body')).toBeTruthy();
  });

  it('Save button is disabled when title is empty', () => {
    const {getByLabelText} = render(
      <EditNoteScreen onSave={() => {}} onCancel={() => {}} />,
    );
    const saveButton = getByLabelText('Save note');
    expect(saveButton.props.accessibilityState.disabled).toBe(true);
  });

  it('Save button enables once a title is entered', () => {
    const {getByLabelText} = render(
      <EditNoteScreen onSave={() => {}} onCancel={() => {}} />,
    );
    fireEvent.changeText(getByLabelText('Note title'), 'My Note');
    const saveButton = getByLabelText('Save note');
    expect(saveButton.props.accessibilityState.disabled).toBe(false);
  });

  it('calls notesApi.create and onSave with the created note', async () => {
    mockCreate.mockResolvedValue(createdNote);
    const onSave = jest.fn();

    const {getByLabelText} = render(
      <EditNoteScreen onSave={onSave} onCancel={() => {}} />,
    );

    fireEvent.changeText(getByLabelText('Note title'), 'My Note');
    fireEvent.changeText(getByLabelText('Note body'), 'Hello world');
    fireEvent.press(getByLabelText('Save note'));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        title: 'My Note',
        body: 'Hello world',
        tags: [],
        todoItems: [],
      });
      expect(onSave).toHaveBeenCalledWith(createdNote);
    });
  });

  it('shows error message when API call fails', async () => {
    mockCreate.mockRejectedValue(new Error('Network error'));

    const {getByLabelText, getByText} = render(
      <EditNoteScreen onSave={() => {}} onCancel={() => {}} />,
    );

    fireEvent.changeText(getByLabelText('Note title'), 'My Note');
    fireEvent.press(getByLabelText('Save note'));

    await waitFor(() => {
      expect(getByText(/Failed to save note/)).toBeTruthy();
    });
  });

  it('calls onCancel when Cancel is tapped', () => {
    const onCancel = jest.fn();
    const {getByLabelText} = render(
      <EditNoteScreen onSave={() => {}} onCancel={onCancel} />,
    );
    fireEvent.press(getByLabelText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
