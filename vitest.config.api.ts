import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['api/**/*.test.ts'],
    environment: 'node',
    // The JSON report is what CI's report-tests step reads: every test's
    // outcome and time, into the fleet test store (hadoku_site
    // docs/planning/unified-test-reporting-2026-11-23.md). Keep reporters HERE:
    // a `--reporter` on the command line replaces this list and drops the report.
    reporters: ['default', 'json'],
    outputFile: { json: 'reports/vitest.json' }
  }
})
