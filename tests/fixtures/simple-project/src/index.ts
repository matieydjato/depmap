// Test fixture: entry point that imports foo and bar
import { foo } from './foo';
import { bar } from './bar';

export const main = () => foo() + bar();
