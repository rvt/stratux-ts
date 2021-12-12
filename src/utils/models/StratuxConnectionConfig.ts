export interface StratuxConnectionConfig {
  ip: string;
  port: number;
}

export const defaultStratuxConnectionConfig: StratuxConnectionConfig = {
  ip: '127.0.0.1',
  port: 80,
};
