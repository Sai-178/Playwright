# Playwright Custom Executive Report - Setup Guide

## Quick Start (5 Minutes)

### 1. Verify Installation
```bash
cd c:\Users\RasaabathuniSaiNaren\Desktop\PW\Playwright-1
npm install
```

### 2. Run Tests with Custom Report
```bash
npm run test:custom-report
```

This command will:
- ✅ Execute all Playwright tests
- ✅ Generate JSON results
- ✅ Create custom HTML report
- ✅ Open report in browser automatically

### 3. View Report
The custom report will be available at:
```
c:\Users\RasaabathuniSaiNaren\Desktop\PW\Playwright-1\custom-report\index.html
```

---

## Complete Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Playwright installed (`npm install @playwright/test`)
- Browser: Chromium (auto-installed with Playwright)

### Step-by-Step Setup

#### Step 1: Navigate to Project Directory
```bash
cd "c:\Users\RasaabathuniSaiNaren\Desktop\PW\Playwright-1"
```

#### Step 2: Install Dependencies
```bash
npm install
```

Expected output:
```
added XX packages
```

#### Step 3: Verify Playwright Configuration
The `playwright.config.ts` includes:
```typescript
reporter: [
  ['list'],                    // Console output
  ['html', { ... }],          // Default HTML report
  ['json', { ... }],          // JSON for custom report ✓
  ['allure-playwright']       // Allure reports
]
```

✅ Configuration is ready!

#### Step 4: Update Test Files (Optional)
Add test IDs and tags to your tests for better report visualization:

```javascript
// Before
test('verify login', async ({ page }) => { ... });

// After (with test ID and tag)
test('@SMOKE TC_LOGIN_001 verify user login', async ({ page }) => { ... });
test('@API @Regression create order endpoint', async ({ page }) => { ... });
```

---

## Running Tests

### Option 1: Tests + Custom Report (Recommended)
```bash
npm run test:custom-report
```
- Runs all tests
- Generates custom report
- Opens in browser automatically

### Option 2: Run Tests Only
```bash
npm test
```
or
```bash
npx playwright test
```

### Option 3: Run Tests + Generate Report Manually
```bash
npm test
npm run report
```

### Option 4: Generate Report from Existing Results
```bash
npm run report
```
(Uses previously generated `test-results.json`)

### Option 5: View Reports
```bash
# View custom executive report
npm run report:custom

# View default Playwright report
npm run report:view
```

---

## Report Output Files

After execution, the following files are created:

### Custom Report (NEW!)
```
custom-report/
└── index.html                    # Executive dashboard (START HERE!)
```

### Test Results
```
test-results/
├── test-results.json            # Raw JSON results
├── junit.xml                     # JUnit XML format
└── [test-name-chromium]/        # Screenshots, videos, traces
```

### Default Playwright Report
```
playwright-report/
└── index.html                    # Standard Playwright report
```

---

## Available NPM Commands

```bash
# Core commands
npm test                    # Run all tests
npm run test:report         # Run tests + generate custom report
npm run test:custom-report  # Run tests + generate report + open in browser

# Report commands
npm run report              # Generate report from existing results
npm run report:custom       # Open custom report in browser
npm run report:view         # Open default Playwright report

# Debug/UI commands
npm run test:ui             # Run tests in interactive UI mode
npm run test:debug          # Run tests with browser visible and debugger
```

---

## Project Structure

```
c:\Users\RasaabathuniSaiNaren\Desktop\PW\Playwright-1\
│
├── tests/
│   ├── ApI.spec.ts                # API tests
│   ├── API1.spec.ts               # Security tests
│   ├── example.spec.ts            # Example tests
│   ├── FirstLoco.spec.ts          # Locator tests
│   ├── HandlingDropDown.spec.ts   # UI interaction tests
│   ├── Playwright-locators.spec.ts # Calendar validation tests
│   ├── Practice-excerise.spec.ts  # Practice tests
│   ├── WebApi.spec.ts             # Web API tests
│   └── utils/
│       └── APiUtils.js            # Utility functions
│
├── test-results/                  # Generated test results
│   ├── test-results.json          # JSON (for custom report)
│   ├── junit.xml                  # JUnit XML
│   └── [test results directories]
│
├── custom-report/                 # Custom executive report (NEW!)
│   └── index.html                 # Executive dashboard
│
├── playwright-report/             # Default Playwright report
│   └── index.html
│
├── playwright.config.ts           # Playwright configuration
├── generate-report.js             # Report generator script (NEW!)
├── package.json                   # Dependencies & NPM scripts
├── CUSTOM_REPORT_README.md       # Detailed documentation
└── SETUP_GUIDE.md                # This file
```

---

## Customization Guide

### Customize Report Title/Header
Edit `generate-report.js`, find:
```javascript
<h1>🧪 Playwright Test Execution Report</h1>
```
Change to your desired title.

### Change Report Colors
Edit CSS in `generate-report.js`:
```css
/* Change primary color */
--primary: #667eea;      → your color
```

### Add Company Logo
Modify HTML template to add logo:
```html
<img src="your-logo.png" alt="Company Logo" />
```

### Add Custom Metrics
Extend `parseTestResults()` function to capture additional data.

### Change Report Output Location
Edit `generate-report.js`:
```javascript
const REPORT_OUTPUT_FILE = path.join(__dirname, 'reports', 'index.html');
```

---

## Troubleshooting

### ❌ Error: "Cannot find module './utils/APiUtils'"
**Solution:** Ensure `tests/utils/APiUtils.js` file exists

### ❌ Error: "test-results.json not found"
**Solution:** Run `npm test` first to generate JSON results

### ❌ Report not generating
**Solution:** 
1. Check console for errors
2. Verify `test-results/test-results.json` exists
3. Run `npm run report` manually

### ❌ Charts not displaying
**Solution:** 
- Ensure internet connection (Chart.js loaded from CDN)
- Check browser console for errors
- Verify JavaScript is enabled

### ❌ Port 9323 already in use
**Solution:**
```bash
# PowerShell
netstat -ano | findstr :9323
taskkill /PID <PID> /F

# Command Prompt
netstat -ano | findstr :9323
taskkill /PID <PID> /F
```

---

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests with Report
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:report
      - uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: custom-report/
```

### Jenkins
```groovy
stage('Test') {
    steps {
        sh 'npm install'
        sh 'npm run test:report'
    }
}
stage('Archive') {
    steps {
        publishHTML([
            reportDir: 'custom-report',
            reportFiles: 'index.html',
            reportName: 'Custom Test Report'
        ])
    }
}
```

---

## Test ID Format

The report auto-extracts test IDs. Use these patterns:

```javascript
// Pattern 1: TC_MODULE_###
test('TC_LOGIN_001 User login validation', async ({ page }) => { });

// Pattern 2: @TAG format
test('@SMOKE verify user login', async ({ page }) => { });

// Pattern 3: Multiple tags
test('@SMOKE @REGRESSION TC_LOGIN_001 login flow', async ({ page }) => { });

// Pattern 4: API tests
test('@API create order endpoint', async ({ page }) => { });
```

---

## Report Features Explained

### 🎯 Executive Summary
- Quick overview of test results
- Pass/fail/skip percentages
- Total execution time

### 📊 Charts
- **Status Distribution**: Pass vs Fail vs Skip
- **Module Distribution**: Per-file test breakdown

### 📈 Metrics
- Test counts and percentages
- Average duration per test
- Total execution time

### 📦 Module-wise Summary
- Per-module performance
- Individual test results
- Pass rates by module

### 📋 Test Details
- Complete test list
- Test IDs and tags
- Execution time per test
- Status indicators

### ⚠️ Failure Analysis
- Failed test details
- Error messages
- Stack traces
- Failure timestamps

### 💡 Recommendations
- Performance optimization tips
- Best practices
- Next steps based on results

---

## Performance Tips

1. **Run in Parallel** (default)
   - Playwright runs multiple workers simultaneously
   - Faster overall execution

2. **Headless Mode** (default in config)
   - No browser UI = faster execution
   - Recommended for CI/CD

3. **Optimize Wait Times**
   - Use `waitForLoadState('networkidle')`
   - Set appropriate timeouts

4. **Reduce Test Count**
   - Focus on critical paths
   - Use tags to run specific tests: `npm test -- --grep @SMOKE`

---

## Getting Help

### View Detailed Documentation
```bash
cat CUSTOM_REPORT_README.md
```

### Run Specific Tests
```bash
# By tag
npx playwright test --grep @SMOKE

# By file
npx playwright test tests/example.spec.ts

# By name
npx playwright test -g "verify login"
```

### Debug Tests
```bash
# Interactive browser
npm run test:ui

# With debugger
npm run test:debug
```

---

## Next Steps

1. ✅ Run your first test with report: `npm run test:custom-report`
2. ✅ Review the generated report in the browser
3. ✅ Add test IDs and tags to your test files
4. ✅ Customize report styling/content
5. ✅ Integrate with your CI/CD pipeline

---

## Quick Reference

| Task | Command |
|------|---------|
| Run tests + generate report | `npm run test:custom-report` |
| Just run tests | `npm test` |
| Just generate report | `npm run report` |
| View custom report | `npm run report:custom` |
| Run in UI mode | `npm run test:ui` |
| Run specific tests | `npx playwright test --grep @SMOKE` |
| Debug tests | `npm run test:debug` |

---

**Your custom report system is ready! 🚀**

Start with: `npm run test:custom-report`

Questions? Check the detailed documentation in `CUSTOM_REPORT_README.md`
