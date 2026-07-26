export interface AppErrorShape {
  message: string;
  statusCode: number;
  errors?: Array<{ field?: string; message: string }>;
}
