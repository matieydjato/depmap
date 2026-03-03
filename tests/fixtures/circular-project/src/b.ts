// Test fixture: circular — b imports a
import { a } from './a';

export const b = () => a();
