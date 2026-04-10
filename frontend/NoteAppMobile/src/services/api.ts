// API service — all calls to NoteApp backend (http://localhost:5000)
// Port 5000 = backend HTTP, 5001 = HTTPS

const BASE_URL = 'http://localhost:5000/api/v1';

export interface NoteDto {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  todoItems: TodoItemDto[];
}

export interface TodoItemDto {
  id: string;
  text: string;
  isCompleted: boolean;
  order: number;
}

export interface CreateNoteRequest {
  title: string;
  body: string;
  tags: string[];
  todoItems: string[];
}

export interface UpdateNoteRequest {
  id: string;
  title: string;
  body: string;
  tags: string[];
  todoItems: TodoItemDto[];
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body || response.statusText);
  }
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  return response.json() as Promise<T>;
}

function buildHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Correlation-ID': generateCorrelationId(),
  };
}

function generateCorrelationId(): string {
  return `rn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const notesApi = {
  getAll: async (): Promise<NoteDto[]> => {
    const res = await fetch(`${BASE_URL}/notes`, {headers: buildHeaders()});
    return handleResponse<NoteDto[]>(res);
  },

  getById: async (id: string): Promise<NoteDto> => {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {headers: buildHeaders()});
    return handleResponse<NoteDto>(res);
  },

  search: async (keyword: string): Promise<NoteDto[]> => {
    const res = await fetch(
      `${BASE_URL}/notes/search?q=${encodeURIComponent(keyword)}`,
      {headers: buildHeaders()},
    );
    return handleResponse<NoteDto[]>(res);
  },

  getByTag: async (tag: string): Promise<NoteDto[]> => {
    const res = await fetch(
      `${BASE_URL}/notes/tags/${encodeURIComponent(tag)}`,
      {headers: buildHeaders()},
    );
    return handleResponse<NoteDto[]>(res);
  },

  create: async (request: CreateNoteRequest): Promise<NoteDto> => {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<NoteDto>(res);
  },

  update: async (id: string, request: UpdateNoteRequest): Promise<NoteDto> => {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<NoteDto>(res);
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });
    return handleResponse<void>(res);
  },

  exportNote: async (id: string): Promise<string> => {
    const res = await fetch(`${BASE_URL}/notes/${id}/export?format=txt`, {
      headers: buildHeaders(),
    });
    if (!res.ok) {
      throw new ApiError(res.status, res.statusText);
    }
    return res.text();
  },
};
