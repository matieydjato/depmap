// Test fixture: circular — a imports b
import { b } from './b';

export const a = () => b();
