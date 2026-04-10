declare module "@vapi-ai/web" {
  export interface Message {
    type: string;
    transcriptType?: string;
    role: "user" | "system" | "assistant";
    transcript: string;
  }

  export default class Vapi {
    constructor(token: string);
    start(
      assistantOrId: string | object,
      options?: { variableValues?: Record<string, string> }
    ): Promise<void>;
    stop(): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;
  }
}
