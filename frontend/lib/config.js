// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  health: '/api/health',
  workflow: '/api/workflow',
  keywordResearch: '/api/workflow/keyword-research/start',
  completeSeo: '/api/workflow/complete-seo/start',
  workflows: '/api/workflows',
  approveKeywordStrategy: '/api/approve/keyword-strategy',
  approveTopic: '/api/approve/topic',
  approveResearch: '/api/approve/research',
  approveContent: '/api/approve/content',
  approveBlogIdea: '/api/approve/blog-idea',
  approveTitle: '/api/approve/title',
  publishing: '/api/publishing/final-delivery',
};
