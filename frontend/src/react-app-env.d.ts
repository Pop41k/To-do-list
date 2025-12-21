/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_API_URL?: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
};
