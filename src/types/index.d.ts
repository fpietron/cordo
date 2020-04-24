export type ParsedLog = {
  scope: string;
  method: 'GET' | 'POST' | 'PATCH' | 'OPTIONS' | 'DELETE';
  path: string;
  body: any;
  status: number;
  rawHeaders: string[];
  responseIsBinary: boolean;
};

