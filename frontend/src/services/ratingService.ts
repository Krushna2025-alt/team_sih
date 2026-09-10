import { postData } from './api';
import type { RatingInput } from '../types';

export const submitRating = async (body: RatingInput) => {
  return await postData('/ratings', body);
};

