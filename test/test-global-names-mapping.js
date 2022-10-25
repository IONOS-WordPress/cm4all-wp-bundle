import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bundle from '../src/cm4all-wp-bundle.js';

describe('basic', () => {
  it('can be invoked', () => {
    assert.doesNotReject(async () => await bundle({ verbose: true }));
  });
});
