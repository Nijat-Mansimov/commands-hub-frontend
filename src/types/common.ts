export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}
