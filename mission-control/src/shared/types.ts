export type TemplateId = 'DailyPlan' | 'LinearTaskBoard' | 'AgentStatus';

export interface Page {
  id: string;
  title: string;
  template: TemplateId;
  author: string;
  createdAt: string;
  expiresAt: string | null;
  tags: string[];
  payload: unknown;
}

export interface CreatePageRequest {
  template: TemplateId;
  title: string;
  author: string;
  ttlHours?: number;
  tags?: string[];
  data: unknown;
}

export interface CreatePageResponse {
  id: string;
  url: string;
}
