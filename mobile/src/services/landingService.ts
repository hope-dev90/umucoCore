// src/services/landingService.ts
//
// Follows the same pattern as heritageService.ts / audioService.ts etc:
// thin wrapper around the shared `api` axios instance from services/api.ts.
//
// NOTE: these three routes aren't in the documented backend endpoint list
// yet (/api/landing/stats, /api/landing/story-steps, /api/newsletter).
// They'll need to be added on the Render backend — adjust the paths below
// once you confirm the real routes.

import { api } from './api';

export interface LandingStats {
  stories: number;   // -> rendered as "200+"
  modules: number;   // -> rendered as "3"
  support: string;   // -> rendered as "24/7"
}

export interface StoryStep {
  id: string;
  title: string;
  description?: string;
  icon?: string; // optional icon key/url if the backend supplies one
}

export async function fetchLandingStats(): Promise<LandingStats> {
  const { data } = await api.get<LandingStats>('/api/landing/stats');
  return data;
}

export async function fetchStorySteps(): Promise<StoryStep[]> {
  const { data } = await api.get<StoryStep[]>('/api/landing/story-steps');
  return data;
}

export async function subscribeNewsletter(email: string): Promise<void> {
  await api.post('/api/newsletter', { email });
}