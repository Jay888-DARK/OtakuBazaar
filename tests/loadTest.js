/**
 * @file tests/loadTest.js
 *
 * Automated High-Concurrency Serverless & Prisma Connection Pooling Load Tester.
 * Executable via: `node tests/loadTest.js`
 *
 * Simulates k6 load test configuration:
 *   - Target: 25 concurrent virtual users (VUs)
 *   - Endpoints: `/?page=1`, `/api/listings`
 *   - Verifies zero dropped connections and 100% stability.
 */

const http = require('http');
const https = require('https');

// Support CLI flag --url=https://... or environment variable BASE_URL
const cliUrlArg = process.argv.find((arg) => arg.startsWith('--url='));
const cliUrl = cliUrlArg ? cliUrlArg.split('=')[1].trim() : null;

const BASE_URL = cliUrl || process.env.BASE_URL || 'http://127.0.0.1:3000';
const TARGET_CONCURRENCY = parseInt(process.env.CONCURRENCY || '25', 10);
const DURATION_SECONDS = parseInt(process.env.DURATION || '15', 10);

const TEST_PATHS = [
  '/?page=1',
  '/api/listings',
];

// Reusable persistent agent with connection pooling
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

function makeRequest(urlStr) {
  return new Promise((resolve) => {
    const start = performance.now();
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const agent = url.protocol === 'https:' ? httpsAgent : httpAgent;

    const req = client.get(
      urlStr,
      {
        agent,
        timeout: 15000,
        headers: {
          'User-Agent': 'OtakuBazaar-LoadTester/1.0',
          Accept: 'text/html,application/json',
        },
      },
      (res) => {
        let bodyBytes = 0;
        res.on('data', (chunk) => {
          bodyBytes += chunk.length;
        });
        res.on('end', () => {
          const latency = performance.now() - start;
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 400,
            statusCode: res.statusCode,
            latency,
            bytes: bodyBytes,
            error: null,
          });
        });
      }
    );

    req.on('error', (err) => {
      const latency = performance.now() - start;
      resolve({
        success: false,
        statusCode: 0,
        latency,
        bytes: 0,
        error: err.message || 'Connection dropped',
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const latency = performance.now() - start;
      resolve({
        success: false,
        statusCode: 408,
        latency,
        bytes: 0,
        error: 'Request timeout',
      });
    });
  });
}

function calculatePercentile(latencies, percentile) {
  if (latencies.length === 0) return 0;
  const sorted = [...latencies].sort((a, b) => a - b);
  const index = Math.min(Math.floor((percentile / 100) * sorted.length), sorted.length - 1);
  return sorted[index];
}

async function runVirtualWorker(workerId, endTime, metrics, pathIndexRef) {
  while (Date.now() < endTime) {
    const path = TEST_PATHS[pathIndexRef.val % TEST_PATHS.length];
    pathIndexRef.val++;
    const targetUrl = `${BASE_URL}${path}`;

    const result = await makeRequest(targetUrl);
    metrics.total++;
    metrics.latencies.push(result.latency);

    if (result.success) {
      metrics.successful++;
    } else {
      metrics.failed++;
      if (result.error) {
        metrics.connectionErrors[result.error] = (metrics.connectionErrors[result.error] || 0) + 1;
      }
    }

    metrics.statusCodes[result.statusCode] = (metrics.statusCodes[result.statusCode] || 0) + 1;

    // Standard k6 iteration sleep: ~600-800ms between requests per VU
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 200));
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log(' OTAKUBAZAAR LOAD & CONNECTION POOLING STABILITY TEST');
  console.log('='.repeat(70));
  console.log(` Target Host       : ${BASE_URL}`);
  console.log(` Peak Concurrency  : ${TARGET_CONCURRENCY} Virtual Users`);
  console.log(` Test Duration     : ${DURATION_SECONDS} seconds`);
  console.log(` Endpoints Tested  : ${TEST_PATHS.join(', ')}`);
  console.log('-'.repeat(70));
  console.log(' Warming up endpoints...');

  for (const path of TEST_PATHS) {
    await makeRequest(`${BASE_URL}${path}`);
  }
  console.log(' Warm-up complete. Ramping up 25 concurrent connections...\n');

  const metrics = {
    total: 0,
    successful: 0,
    failed: 0,
    statusCodes: {},
    connectionErrors: {},
    latencies: [],
  };

  const startTime = Date.now();
  const endTime = startTime + DURATION_SECONDS * 1000;
  const pathIndexRef = { val: 0 };

  // Launch 25 virtual users
  const workers = [];
  for (let i = 0; i < TARGET_CONCURRENCY; i++) {
    workers.push(runVirtualWorker(i + 1, endTime, metrics, pathIndexRef));
    await new Promise((r) => setTimeout(r, 40));
  }

  // Progress heartbeat
  const progressInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const rps = (metrics.total / (elapsed || 1)).toFixed(1);
    process.stdout.write(
      `\r [Load Progress] Time: ${elapsed}s / ${DURATION_SECONDS}s | Requests: ${metrics.total} | 200 OK: ${metrics.successful} | Errors: ${metrics.failed} | RPS: ${rps}`
    );
  }, 1000);

  await Promise.all(workers);
  clearInterval(progressInterval);
  process.stdout.write('\n\n');

  const totalTimeSeconds = (Date.now() - startTime) / 1000;
  const rps = (metrics.total / totalTimeSeconds).toFixed(2);
  const droppedConnections = Object.entries(metrics.connectionErrors).reduce((acc, [, count]) => acc + count, 0);

  const avgLatency = (metrics.latencies.reduce((a, b) => a + b, 0) / (metrics.latencies.length || 1)).toFixed(2);
  const minLatency = (Math.min(...metrics.latencies) || 0).toFixed(2);
  const maxLatency = (Math.max(...metrics.latencies) || 0).toFixed(2);
  const p50 = calculatePercentile(metrics.latencies, 50).toFixed(2);
  const p90 = calculatePercentile(metrics.latencies, 90).toFixed(2);
  const p95 = calculatePercentile(metrics.latencies, 95).toFixed(2);
  const p99 = calculatePercentile(metrics.latencies, 99).toFixed(2);
  const successRate = ((metrics.successful / (metrics.total || 1)) * 100).toFixed(2);

  console.log('='.repeat(70));
  console.log(' LOAD TEST EXECUTION METRICS');
  console.log('='.repeat(70));
  console.log(` Total Completed Requests : ${metrics.total}`);
  console.log(` Successful (2xx/3xx)     : ${metrics.successful} (${successRate}%)`);
  console.log(` Dropped Connections     : ${droppedConnections}`);
  console.log(` Throughput               : ${rps} req/sec`);
  console.log('');
  console.log(' Latency Distribution:');
  console.log(`   • Min     : ${minLatency} ms`);
  console.log(`   • Average : ${avgLatency} ms`);
  console.log(`   • p50     : ${p50} ms`);
  console.log(`   • p90     : ${p90} ms`);
  console.log(`   • p95     : ${p95} ms`);
  console.log(`   • p99     : ${p99} ms`);
  console.log(`   • Max     : ${maxLatency} ms`);
  console.log('');
  console.log(' HTTP Status Codes breakdown:');
  for (const [code, count] of Object.entries(metrics.statusCodes)) {
    console.log(`   • HTTP ${code}: ${count}`);
  }

  if (droppedConnections > 0) {
    console.log('');
    console.log(' Connection Error Breakdown:');
    for (const [errName, count] of Object.entries(metrics.connectionErrors)) {
      console.log(`   • ${errName}: ${count}`);
    }
  }

  console.log('-'.repeat(70));
  const isPassing = droppedConnections === 0 && Number(successRate) >= 95;
  if (isPassing) {
    console.log(' [PASS] Connection pooling and serverless handlers are STABLE under load.');
    process.exit(0);
  } else {
    console.error(' [FAIL] High error rate or dropped connections detected.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal load test error:', err);
  process.exit(1);
});
