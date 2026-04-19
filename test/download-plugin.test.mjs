import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { downloadPlugin } from '../scripts/download-plugin.mjs';
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testDir = join(__dirname, 'fixtures');

describe('download-plugin', () => {
  const testJar = join(testDir, 'server-additions-2.0.0.jar');

  beforeEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('skips download if JAR already exists', async () => {
    writeFileSync(testJar, 'fake-jar-content');

    const result = await downloadPlugin({ dest: testJar });

    expect(result.skipped).toBe(true);
    expect(result.path).toBe(testJar);
    expect(readFileSync(testJar, 'utf8')).toBe('fake-jar-content');
  });

  it('downloads plugin from a URL', async () => {
    const fakeJar = Buffer.from('fake-plugin-jar-bytes');
    const mockUrl = 'http://localhost:9999/test-plugin.jar';

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(fakeJar);
          controller.close();
        },
      }),
    });

    const result = await downloadPlugin({ url: mockUrl, dest: testJar });

    expect(result.skipped).toBe(false);
    expect(result.path).toBe(testJar);
    expect(existsSync(testJar)).toBe(true);
    expect(fetch).toHaveBeenCalledWith(mockUrl);
  });

  it('creates the target directory if it does not exist', async () => {
    const nestedJar = join(testDir, 'nested', 'dir', 'server-additions-2.0.0.jar');
    const fakeJar = Buffer.from('nested-jar');

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(fakeJar);
          controller.close();
        },
      }),
    });

    const result = await downloadPlugin({ dest: nestedJar });

    expect(result.skipped).toBe(false);
    expect(existsSync(nestedJar)).toBe(true);
  });

  it('throws on non-200 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(downloadPlugin({ url: 'http://localhost:9999/missing', dest: testJar }))
      .rejects.toThrow('Failed to download plugin: 404 Not Found');
  });

  it('throws on server error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(downloadPlugin({ url: 'http://localhost:9999/error', dest: testJar }))
      .rejects.toThrow('Failed to download plugin: 500 Internal Server Error');
  });
});