export interface Document {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  status: DocumentStatus;
  blobUrl: string;
  summary?: string;
  keyPoints?: string[];
  themes?: string[];
  embedding?: number[];
  error?: string;
}

export enum DocumentStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface UploadResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface SearchResult {
  document: Document;
  score: number;
  relevantChunk?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  documentIds?: string[];
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  sources?: string[];
  error?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  storageUsed: number;
  storageQuota: number;
  plan: 'free' | 'pro';
}
