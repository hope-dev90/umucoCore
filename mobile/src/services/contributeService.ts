import { api, getErrorMessage } from './api';

export type ContributionType = 'audio' | 'photo' | 'video' | 'oral_history';

function endpointFor(type: ContributionType): string {
  if (type === 'audio') return '/api/contributions/upload-audio';
  if (type === 'photo') return '/api/contributions/capture-photo';
  if (type === 'video') return '/api/contributions/upload-video';
  return '/api/contributions/oral-history';
}

export async function submitContribution(payload: {
  type: ContributionType;
  name: string;
  email: string;
  description: string;
  title?: string;
  file?: { uri: string; name: string; type: string } | null;
}): Promise<void> {
  try {
    const form = new FormData();
    form.append('contributor_name', payload.name);
    form.append('contributor_email', payload.email);
    form.append('description', payload.description);
    form.append('title', payload.title || `${payload.type} contribution`);
    form.append('status', 'pending');
    if (payload.file) {
      form.append('file', {
        uri: payload.file.uri,
        name: payload.file.name,
        type: payload.file.type,
      } as unknown as Blob);
    }
    await api.post(endpointFor(payload.type), form);
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Contribution failed'));
  }
}
