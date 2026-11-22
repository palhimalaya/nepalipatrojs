/**
 * Stage 2.4 compatibility suite — delegates to Stage 2.5 enforcement.
 * Kept so older docs/commands that point here still exercise boundaries.
 */

import { join } from 'path';
import { scanRepository } from '../architecture/boundary-enforcement';

const SRC = join(__dirname, '../..');
const PKG = join(__dirname, '../../../package.json');

describe('Module boundaries (Stage 2.4→2.5)', () => {
  it('production tree satisfies architecture boundary rules', () => {
    expect(scanRepository(SRC, PKG)).toEqual([]);
  });
});
