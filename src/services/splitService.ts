import { apiClient } from './base/ApiClient';

interface RangeData {
  right: number;
  top: number;
  left_letter: string;
  left: number;
  right_letter: string;
  bottom: number;
}

interface Decision {
  value: number;
  confidence: number;
  reasoning: string;
}

interface QuestionMetadata {
  processed_at: string;
  table_name: string;
  range_id: string;
}
interface Question {
  range: RangeData;
  metadata: QuestionMetadata;
  decision: Decision;
  question_id: string;
}

interface Sheet {
  questions: Question[];
  sheet_name: string;
  sheet_id: string;
}

interface SplitManagerResponse {
  file_url?: string;
  sheets?: Sheet[];
  file_id?: string;
  status: string;
  message?: string;
}

interface SplitDecision {
  question_id: string;
  decision: 0 | 1; // 0 = no split, 1 = split
}

class SplitService {
  async getFileQuestions(projectId: string, fileId: string): Promise<SplitManagerResponse> {
    return apiClient.get<SplitManagerResponse>(`/hitl/projects/${projectId}/files/${fileId}/questions`);
  }

  async getProcessingJobs(projectId: string): Promise<{ id: string; name: string }[]> {
    const resp = await apiClient.get<{ status: string; timestamp: string; jobs: { id: string; name: string }[] }>(
      `/hitl/projects/${projectId}/processing/jobs`
    );
    return resp.jobs || [];
  }

  // Utility method to format range display
  formatRange(range: RangeData): string {
    return `${range.left_letter}${range.top}:${range.right_letter}${range.bottom}`;
  }

  // Utility method to get question summary
  getQuestionSummary(question: Question): string {
    return `Split column ${question.range.left_letter}? (${this.formatRange(question.range)})`;
  }
  async submitSplitDecisions(
    projectId: string, 
    fileId: string, 
    decisions: SplitDecision[],
    sheet?: string | null
  ): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(
      `/hitl/projects/${projectId}/files/${fileId}/submit`,
      { 
        decisions,
        sheet: sheet || undefined
      }
    );
  }
}

export const splitService = new SplitService();
export type { SplitManagerResponse, Question, Sheet, SplitDecision, RangeData, Decision, QuestionMetadata };