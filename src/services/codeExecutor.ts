// services/codeExecutor.ts
export interface ExecutionResult {
  success: boolean;
  output: string;
  stderr: string;
  exitCode: number;
  runtime: string;
  executionId: string;
}

export interface SupportedLanguage {
  language: string;
  version: string;
}

export class CodeExecutorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_CODE_EXECUTOR_URL || 'http://localhost:3001';
  }

  async executeCode(
    code: string,
    language: string,
    input: string = '',
    timeout: number = 30000
  ): Promise<ExecutionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language, input, timeout }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during code execution');
    }
  }

  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/languages`);
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.statusText}`);
      }
      const data = await response.json();
      return data.executors || [];
    } catch (error) {
      console.error('Error fetching supported languages:', error);
      return [];
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const codeExecutor = new CodeExecutorService();