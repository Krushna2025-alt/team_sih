import api from './api';
import type { VoiceExtractionResult } from '../types';

// Speech recognition happens on the backend — frontend only sends recorded audio.
export async function extractListing(audio: Blob, language: string): Promise<VoiceExtractionResult> {
  const form = new FormData();
  form.append('audio', audio, 'listing.webm');
  form.append('language', language);
  const res = await api.post('/voice/extract-listing', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 15000,
  });
  return res.data?.data as VoiceExtractionResult;
}

