export interface PossumRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any,
  headers: any;
}

export interface StoredPossumRequest extends PossumRequest {
  id: string;
}