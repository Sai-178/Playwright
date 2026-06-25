# 🧪 Playwright Custom Executive Report System

## Overview

This is a production-ready custom executive-style HTML report generator for Playwright automated tests. It creates beautiful, professional dashboards with charts, metrics, and detailed test analytics.

## Features

✅ **Executive Dashboard** - At-a-glance summary of test results  
✅ **Professional Styling** - Modern, responsive design with gradient backgrounds  
✅ **Chart.js Integration** - Visual test results and module-wise distribution  
✅ **Comprehensive Metrics** - Pass rate, duration, performance analytics  
✅ **Failure Analysis** - Detailed error logs with stack traces  
✅ **Test Case Details** - Individual test information with IDs, tags, and durations  
✅ **Module-wise Summary** - Performance breakdown by test suite  
✅ **Automatic Generation** - Runs after every test execution  
✅ **Mobile Responsive** - Works on all screen sizes  
✅ **Zero Dependencies** - Uses Chart.js from CDN (minimal overhead)

## Project Structure

```
playwright-1/
├── tests/
│   ├── *.spec.ts          # Test files
│   └── utils/
│       └── APiUtils.js    # Test utilities
├── test-results/
│   ├── test-results.json  # JSON test results (auto-generated)
│   ├── junit.xml          # JUnit results (auto-generated)
│   └── ...
├── custom-report/
│   └── index.html         # Custom executive report (auto-generated)
├── playwright.config.ts   # Playwright configuration
├── generate-report.js     # Report generator script
├── package.json           # Project dependencies & scripts
└── README.md
```

## Installation & Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Verify Playwright Configuration

The `playwright.config.ts` is already configured with JSON reporter. Key reporters:

```typescript
reporter: [
  ['list'],                              // Console output
  ['html', { outputFolder: 'playwright-report' }],  // Default HTML report
  ['json', { outputFile: 'test-results/test-results.json' }],  // JSON for custom report
  ['junit', { outputFile: 'test-results/junit.xml' }]  // JUnit XML
]
```

### Step 3: Run Tests

```bash
# Run tests with default reports
npm test

# Run tests and generate custom report
npm run test:report

# Run tests and view custom report in browser
npm run test:custom-report
```

## Usage

### Generate Reports

#### Option 1: Automatic Generation (Recommended)
```bash
# Runs tests and generates custom report automatically
npm run test:report
```

#### Option 2: Manual Report Generation
```bash
# After running tests, generate report manually
npm run report
```

#### Option 3: View Custom Report
```bash
# Open generated custom report in browser
npm run report:custom
```

### Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests |
| `npm run test:ui` | Run tests in UI mode (interactive) |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:report` | Run tests + generate custom report |
| `npm run report` | Generate report from existing JSON results |
| `npm run report:view` | View default Playwright report |
| `npm run report:custom` | Open custom report in browser |
| `npm run test:custom-report` | Run tests, generate, and open custom report |

## Report Features

### 1. Executive Summary Dashboard
- **Passed Tests** - Count and percentage
- **Failed Tests** - Count and percentage
- **Skipped Tests** - Count and percentage
- **Total Duration** - Execution time in seconds

### 2. Visual Analytics
- **Status Distribution Chart** - Doughnut chart showing pass/fail/skip ratios
- **Module-wise Distribution** - Bar chart showing results per test module

### 3. Performance Metrics
- Total test cases executed
- Average duration per test
- Pass rate percentage
- Total execution duration

### 4. Module-wise Summary Table
- Module name
- Total tests, passed, failed, skipped counts
- Pass rate percentage
- Duration per module

### 5. Test Case Details
- **Test ID** - Auto-extracted (TC_LOGIN_001, @API, etc.)
- **Test Name** - Full test title
- **Module** - Test file/suite name
- **Status** - PASSED/FAILED/SKIPPED
- **Duration** - Execution time
- **Tags** - Auto-extracted tags (@tag format)

### 6. Failure Analysis
- Test name and ID
- Error message and stack trace
- Failure timestamp
- Expandable error details

### 7. Recommendations
- Auto-generated recommendations based on test results
- Performance optimization suggestions
- Best practices for test maintenance

## Test ID & Tag Extraction

The report automatically extracts test IDs and tags:

### Test ID Patterns
```javascript
// Automatically detected:
"TC_LOGIN_001 verify user login"           → TC_LOGIN_001
"@API Create user endpoint"                 → @API
"Test @SMOKE @REGRESSION user flow"        → @SMOKE, @REGRESSION
```

### Tag Format
Use `@TAG` format in test names for automatic extraction:
```javascript
test('@SMOKE verify login', async ({ page }) => { ... });
test('@API @Regression user endpoint', async ({ page }) => { ... });
test('TC_LOGIN_001 - User login validation', async ({ page }) => { ... });
```

## Configuration

### Customize Report Output Location

Edit `generate-report.js`:
```javascript
// Change output location
const REPORT_OUTPUT_FILE = path.join(__dirname, 'my-custom-report', 'index.html');
```

### Customize Report Template

Modify the HTML template in `generate-report.js` function `generateHTMLReport()`:
- Change colors, fonts, styling
- Add/remove sections
- Customize charts

### Modify Playwright Configuration

Edit `playwright.config.ts` to:
- Change timeout values
- Add more browsers
- Configure headless mode
- Set number of workers

## Continuous Integration (CI/CD)

### GitHub Actions Example

```yaml
name: Playwright Tests with Custom Report

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:report
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-report
          path: custom-report/
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run test:report'
            }
        }
        stage('Archive Report') {
            steps {
                publishHTML([
                    reportDir: 'custom-report',
                    reportFiles: 'index.html',
                    reportName: 'Custom Test Report'
                ])
            }
        }
    }
}
```

## Troubleshooting

### Issue: "Cannot find module './utils/APiUtils'"
**Solution:** Ensure utility file exists at `tests/utils/APiUtils.js`

### Issue: Report not generating after tests
**Solution:** 
1. Check if `test-results/test-results.json` exists
2. Run `npm run report` manually
3. Check console for errors

### Issue: Chart not displaying
**Solution:** Ensure Chart.js CDN is accessible (requires internet connection)

### Issue: Port already in use (when viewing report)
**Solution:** 
```bash
# Kill process using port 9323
netstat -ano | findstr :9323
taskkill /PID <PID> /F
```

## Report Files Generated

After running tests, the following files are generated:

1. **custom-report/index.html** - Custom executive dashboard
2. **test-results/test-results.json** - Raw JSON results
3. **test-results/junit.xml** - JUnit XML format
4. **playwright-report/index.html** - Default Playwright report
5. **test-results/** - Screenshots, videos, traces for failed tests

## Advanced Customization

### Add Custom Metrics

Edit `generate-report.js` to add more metrics:

```javascript
// In parseTestResults() function
const customMetric = calculateCustomMetric(data);

// In generateHTMLReport() template
<div class="metric-item">
    <strong>Custom Metric:</strong>
    <div class="value">${customMetric}</div>
</div>
```

### Add More Chart Types

Modify chart configuration:

```javascript
// Add pie chart, line chart, radar, etc.
new Chart(ctx, {
    type: 'pie', // 'bar', 'line', 'radar', etc.
    data: { ... }
});
```

### Customize Colors & Styling

Modify CSS in the HTML template:

```css
/* Change primary color */
.header { background: #your-color; }
.summary-card { border-left-color: #your-color; }
```

## File Descriptions

### playwright.config.ts
- Configures Playwright with JSON, HTML, and JUnit reporters
- Sets timeouts, retries, and headless mode
- Defines browser and project configurations

### generate-report.js
- Main report generator script
- Reads JSON test results
- Parses test data (IDs, tags, durations, failures)
- Generates HTML dashboard
- Creates charts and analytics

### package.json
- Project dependencies (Playwright, types)
- NPM scripts for easy command execution
- Project metadata

## Performance Tips

1. **Parallel Execution** - Playwright runs tests in parallel by default
2. **Headless Mode** - Faster execution (enabled by default)
3. **Test Isolation** - Each test runs in isolation for reliability
4. **Retry Logic** - Failed tests auto-retry in CI environments

## Best Practices

1. ✅ Use descriptive test names with test IDs
2. ✅ Use `@TAG` format for test categorization
3. ✅ Review failure details after each run
4. ✅ Maintain test cases regularly
5. ✅ Keep test data realistic and up-to-date
6. ✅ Document test purposes and expected outcomes
7. ✅ Monitor performance trends over time

## Support & Resources

- [Playwright Official Docs](https://playwright.dev/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Test Report Generator Issues](./generate-report.js)

## License

ISC - See package.json

## Created

Generated on: 2026-06-24  
Last Updated: 2026-06-24

---

**Happy Testing! 🚀**

For any questions or improvements, refer to the Playwright documentation or modify the generator script as per your requirements.
