import 'dotenv/config';
import { beforeEach } from 'vitest';
import { truncateAll } from './utils/reset';

beforeEach(async () => {
    await truncateAll();
});
