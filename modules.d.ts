// Define types for our .env
declare namespace NodeJS {
  export interface ProcessEnv {
    HEADLESS: string;
    CHAMBER: string;
  }
}
