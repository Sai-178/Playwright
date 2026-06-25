#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TEST_RESULTS_FILE = path.join(__dirname, 'test-results', 'test-results.json');
const REPORT_OUTPUT_FILE = path.join(__dirname, 'custom-report', 'index.html');
const REPORT_DIR = path.join(__dirname, 'custom-report');

// Create custom-report directory if it doesn't exist
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function extractTestId(testName) {
  if (!testName) return null;
  const match = testName.match(/TC_[A-Z0-9_]+|@[A-Z]+/);
  return match ? match[0] : null;
}

function extractTags(title) {
  if (!title) return [];
  const tags = [];
  if (title.includes('@')) {
    const tagMatches = title.match(/@[A-Za-z0-9_]+/g);
    if (tagMatches) tags.push(...tagMatches);
  }
  return tags;
}

function parseTestResults() {
  try {
    if (!fs.existsSync(TEST_RESULTS_FILE)) {
      console.error(`❌ Test results file not found: ${TEST_RESULTS_FILE}`);
      console.error('Please run tests first: npx playwright test');
      process.exit(1);
    }

    const rawData = fs.readFileSync(TEST_RESULTS_FILE, 'utf8');
    const data = JSON.parse(rawData);

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let totalDuration = 0;

    const suites = [];
    const moduleStats = {};
    const failureDetails = [];
    const testDetails = [];

    if (data.suites && Array.isArray(data.suites)) {
      data.suites.forEach(suite => {
        const suiteName = suite.title || suite.file || 'Unknown Suite';
        const specs = suite.specs || [];

        moduleStats[suiteName] = {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
          tests: []
        };

        specs.forEach(spec => {
          const specTitle = spec.title || 'Unknown Spec';
          const specTags = spec.tags || [];
          const tests = spec.tests || [];

          tests.forEach(test => {
            totalTests++;
            
            // Handle both object and string formats
            const testObj = typeof test === 'string' ? {} : test;
            const testStatus = spec.ok ? 'passed' : 'failed';
            const testResults = spec.results || [];
            const firstResult = testResults[0] || {};
            const duration = firstResult.duration || 0;
            const testTitle = specTitle;
            const testId = extractTestId(testTitle);
            const tags = extractTags(testTitle);
            tags.push(...specTags);

            if (testStatus === 'passed') {
              passedTests++;
              moduleStats[suiteName].passed++;
            } else if (testStatus === 'failed') {
              failedTests++;
              moduleStats[suiteName].failed++;

              // Collect failure details
              if (firstResult.error) {
                failureDetails.push({
                  testName: testTitle,
                  suiteName: suiteName,
                  error: firstResult.error.message || firstResult.error,
                  stack: firstResult.error.stack || '',
                  timestamp: new Date().toLocaleString()
                });
              }
            } else if (testStatus === 'skipped') {
              skippedTests++;
              moduleStats[suiteName].skipped++;
            }

            totalDuration += duration;
            moduleStats[suiteName].duration += duration;
            moduleStats[suiteName].total++;

            testDetails.push({
              id: testId,
              name: testTitle,
              suite: suiteName,
              status: testStatus,
              duration: duration,
              tags: [...new Set(tags)],
              timestamp: new Date().toISOString(),
              attempts: 1
            });
          });
        });

        if (specs.length > 0) {
          suites.push({
            name: suiteName,
            specs: specs.length,
            totalTests: moduleStats[suiteName].total,
            passed: moduleStats[suiteName].passed,
            failed: moduleStats[suiteName].failed,
            skipped: moduleStats[suiteName].skipped
          });
        }
      });
    }

    const passPercentage = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
    const failPercentage = totalTests > 0 ? ((failedTests / totalTests) * 100).toFixed(2) : 0;
    const skipPercentage = totalTests > 0 ? ((skippedTests / totalTests) * 100).toFixed(2) : 0;

    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        passPercentage,
        failPercentage,
        skipPercentage,
        totalDuration,
        timestamp: new Date().toLocaleString(),
        status: failedTests === 0 ? 'PASSED' : 'FAILED'
      },
      suites,
      moduleStats,
      failureDetails,
      testDetails,
      config: {
        browser: 'Chromium',
        environment: 'Test',
        platform: process.platform
      }
    };
  } catch (error) {
    console.error('❌ Error parsing test results:', error.message);
    process.exit(1);
  }
}

function generateHTMLReport(results) {
  const chartDataModule = Object.entries(results.moduleStats)
    .map(([name, stats]) => ({
      name,
      passed: stats.passed,
      failed: stats.failed,
      skipped: stats.skipped
    }));

  const failureRows = results.failureDetails
    .map(failure => `
      <tr class="failure-row">
        <td><span class="test-id">${failure.testName.split(' ')[0] || 'N/A'}</span></td>
        <td>${failure.testName}</td>
        <td>${failure.suiteName}</td>
        <td><span class="badge badge-error">Failed</span></td>
        <td>${failure.timestamp}</td>
        <td>
          <details class="error-details">
            <summary>View Error</summary>
            <pre>${escapeHtml(failure.error)}</pre>
          </details>
        </td>
      </tr>
    `).join('');

  const testDetailsRows = results.testDetails
    .map(test => `
      <tr class="test-row ${test.status}">
        <td><span class="test-id">${test.id || 'N/A'}</span></td>
        <td>${test.name}</td>
        <td>${test.suite}</td>
        <td><span class="badge badge-${test.status}">${test.status.toUpperCase()}</span></td>
        <td>${(test.duration / 1000).toFixed(2)}s</td>
        <td>${test.tags.join(', ') || '-'}</td>
      </tr>
    `).join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright Test Report - Executive Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 2.5em;
        }

        .header-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 15px;
            color: #666;
            font-size: 0.95em;
        }

        .status-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1.1em;
        }

        .status-badge.passed {
            background: #d4edda;
            color: #155724;
        }

        .status-badge.failed {
            background: #f8d7da;
            color: #721c24;
        }

        .executive-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 5px solid #667eea;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .summary-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
        }

        .summary-card.passed {
            border-left-color: #28a745;
        }

        .summary-card.failed {
            border-left-color: #dc3545;
        }

        .summary-card.skipped {
            border-left-color: #ffc107;
        }

        .summary-card.duration {
            border-left-color: #17a2b8;
        }

        .summary-card h3 {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }

        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
        }

        .summary-card .percentage {
            font-size: 0.85em;
            color: #999;
            margin-top: 5px;
        }

        .charts-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .chart-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .chart-card h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.3em;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }

        .chart-container {
            position: relative;
            height: 300px;
        }

        .section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .section h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.5em;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        table thead {
            background: #f8f9fa;
        }

        table th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #dee2e6;
        }

        table td {
            padding: 12px 15px;
            border-bottom: 1px solid #dee2e6;
        }

        table tbody tr:hover {
            background: #f8f9fa;
        }

        .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
        }

        .badge-passed {
            background: #d4edda;
            color: #155724;
        }

        .badge-failed {
            background: #f8d7da;
            color: #721c24;
        }

        .badge-skipped {
            background: #fff3cd;
            color: #856404;
        }

        .badge-error {
            background: #dc3545;
            color: white;
        }

        .test-id {
            background: #e9ecef;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            font-weight: bold;
        }

        .error-details {
            cursor: pointer;
            user-select: none;
        }

        .error-details summary {
            color: #dc3545;
            font-weight: bold;
        }

        .error-details pre {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            overflow-x: auto;
            font-size: 0.85em;
        }

        .performance-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .metric-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .metric-item strong {
            color: #333;
        }

        .metric-item .value {
            color: #667eea;
            font-size: 1.2em;
            font-weight: bold;
        }

        .recommendations {
            background: #e7f3ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }

        .recommendations h3 {
            color: #667eea;
            margin-bottom: 10px;
        }

        .recommendations ul {
            margin-left: 20px;
            color: #333;
        }

        .recommendations li {
            margin-bottom: 8px;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 40px;
        }

        @media (max-width: 768px) {
            .executive-summary {
                grid-template-columns: repeat(2, 1fr);
            }

            .charts-section {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 1.8em;
            }

            table {
                font-size: 0.9em;
            }

            table th, table td {
                padding: 8px;
            }
        }

        .test-row.passed {
            background: rgba(40, 167, 69, 0.05);
        }

        .test-row.failed {
            background: rgba(220, 53, 69, 0.05);
        }

        .failure-row {
            background: rgba(220, 53, 69, 0.08);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Playwright Test Execution Report</h1>
            <div class="header-meta">
                <span><strong>Execution Time:</strong> ${results.summary.timestamp}</span>
                <span><strong>Browser:</strong> ${results.config.browser}</span>
                <span><strong>Environment:</strong> ${results.config.environment}</span>
                <span><strong>Platform:</strong> ${results.config.platform}</span>
                <span class="status-badge ${results.summary.status.toLowerCase()}">${results.summary.status}</span>
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary">
            <div class="summary-card passed">
                <h3>✅ Passed Tests</h3>
                <div class="value">${results.summary.passedTests}</div>
                <div class="percentage">${results.summary.passPercentage}%</div>
            </div>
            <div class="summary-card failed">
                <h3>❌ Failed Tests</h3>
                <div class="value">${results.summary.failedTests}</div>
                <div class="percentage">${results.summary.failPercentage}%</div>
            </div>
            <div class="summary-card skipped">
                <h3>⏭️ Skipped Tests</h3>
                <div class="value">${results.summary.skippedTests}</div>
                <div class="percentage">${results.summary.skipPercentage}%</div>
            </div>
            <div class="summary-card duration">
                <h3>⏱️ Total Duration</h3>
                <div class="value">${(results.summary.totalDuration / 1000).toFixed(2)}</div>
                <div class="percentage">seconds</div>
            </div>
        </div>

        <!-- Charts -->
        <div class="charts-section">
            <div class="chart-card">
                <h2>Test Results Distribution</h2>
                <div class="chart-container">
                    <canvas id="statusChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h2>Module-wise Test Summary</h2>
                <div class="chart-container">
                    <canvas id="moduleChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Performance Metrics -->
        <div class="section">
            <h2>📊 Performance Metrics</h2>
            <div class="performance-metrics">
                <div class="metric-item">
                    <strong>Total Test Cases:</strong>
                    <div class="value">${results.summary.totalTests}</div>
                </div>
                <div class="metric-item">
                    <strong>Average Duration per Test:</strong>
                    <div class="value">${(results.summary.totalDuration / Math.max(results.summary.totalTests, 1) / 1000).toFixed(2)}s</div>
                </div>
                <div class="metric-item">
                    <strong>Pass Rate:</strong>
                    <div class="value">${results.summary.passPercentage}%</div>
                </div>
                <div class="metric-item">
                    <strong>Total Duration:</strong>
                    <div class="value">${(results.summary.totalDuration / 60000).toFixed(2)}m</div>
                </div>
            </div>
        </div>

        <!-- Module-wise Summary -->
        <div class="section">
            <h2>📦 Module-wise Summary</h2>
            <table>
                <thead>
                    <tr>
                        <th>Module Name</th>
                        <th>Total Tests</th>
                        <th>Passed</th>
                        <th>Failed</th>
                        <th>Skipped</th>
                        <th>Pass Rate</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(results.moduleStats).map(([name, stats]) => {
                      const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) : 0;
                      return `
                        <tr>
                            <td><span class="test-id">${name}</span></td>
                            <td>${stats.total}</td>
                            <td><span class="badge badge-passed">${stats.passed}</span></td>
                            <td><span class="badge badge-failed">${stats.failed}</span></td>
                            <td><span class="badge badge-skipped">${stats.skipped}</span></td>
                            <td>${passRate}%</td>
                            <td>${(stats.duration / 1000).toFixed(2)}s</td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <!-- Test Case Details -->
        <div class="section">
            <h2>📋 Test Case Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test ID</th>
                        <th>Test Name</th>
                        <th>Module</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Tags</th>
                    </tr>
                </thead>
                <tbody>
                    ${testDetailsRows}
                </tbody>
            </table>
        </div>

        <!-- Failure Details -->
        ${results.failureDetails.length > 0 ? `
            <div class="section">
                <h2>⚠️ Failure Details</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Test ID</th>
                            <th>Test Name</th>
                            <th>Module</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                            <th>Error</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${failureRows}
                    </tbody>
                </table>
            </div>
        ` : ''}

        <!-- Recommendations -->
        <div class="section">
            <div class="recommendations">
                <h3>💡 Recommendations</h3>
                <ul>
                    ${results.summary.failedTests > 0 ? `
                        <li>Review failed tests and fix identified issues before next deployment</li>
                        <li>Analyze error logs to understand failure root causes</li>
                    ` : `
                        <li>✅ All tests passed! Excellent test coverage and stability.</li>
                    `}
                    <li>Average test duration: ${(results.summary.totalDuration / Math.max(results.summary.totalTests, 1) / 1000).toFixed(2)}s - Consider optimizing slow tests</li>
                    <li>Maintain and update test cases regularly for better coverage</li>
                    <li>Use test IDs and tags for better test organization and filtering</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Playwright Automation Test Report | Executive Dashboard</p>
        </div>
    </div>

    <script>
        // Status Chart
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed', 'Skipped'],
                datasets: [{
                    data: [${results.summary.passedTests}, ${results.summary.failedTests}, ${results.summary.skippedTests}],
                    backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
                    borderColor: ['#1e7e34', '#bd2130', '#e0a800'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Module Chart
        const moduleCtx = document.getElementById('moduleChart').getContext('2d');
        new Chart(moduleCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(chartDataModule.map(m => m.name))},
                datasets: [
                    {
                        label: 'Passed',
                        data: ${JSON.stringify(chartDataModule.map(m => m.passed))},
                        backgroundColor: '#28a745'
                    },
                    {
                        label: 'Failed',
                        data: ${JSON.stringify(chartDataModule.map(m => m.failed))},
                        backgroundColor: '#dc3545'
                    },
                    {
                        label: 'Skipped',
                        data: ${JSON.stringify(chartDataModule.map(m => m.skipped))},
                        backgroundColor: '#ffc107'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>
  `;

  return html;
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Main execution
console.log('📊 Generating Custom Executive Report...');
const results = parseTestResults();
const html = generateHTMLReport(results);

fs.writeFileSync(REPORT_OUTPUT_FILE, html, 'utf8');

console.log('✅ Custom Report Generated Successfully!');
console.log(`📁 Location: ${REPORT_OUTPUT_FILE}`);
console.log(`📊 Total Tests: ${results.summary.totalTests}`);
console.log(`✅ Passed: ${results.summary.passedTests} (${results.summary.passPercentage}%)`);
console.log(`❌ Failed: ${results.summary.failedTests} (${results.summary.failPercentage}%)`);
console.log(`⏭️  Skipped: ${results.summary.skippedTests} (${results.summary.skipPercentage}%)`);
console.log(`⏱️  Duration: ${(results.summary.totalDuration / 1000).toFixed(2)}s`);
