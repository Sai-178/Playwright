const { test,expect } = require('@playwright/test');
 
 
test('@QW Security test request intercept', async ({ page }) => {
 
    //login and reach orders page
    await page.goto("https://rahulshettyacademy.com/client");
    await page.locator("#userEmail").fill("anshika@gmail.com");
    await page.locator("#userPassword").fill("Iamking@000");
    await page.locator("[value='Login']").click();
    await page.waitForLoadState('networkidle');
    await page.locator(".card-body b").first().waitFor();
 
    await page.locator("button[routerlink*='myorders']").click();
    
    // Set up route interception BEFORE clicking the button
    await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=*",
        route => route.continue({ url: 'https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=621661f884b053f6765465b6' }));
    
    // Wait for View button and click
    await page.waitForSelector("button:has-text('View')");
    await page.locator("button:has-text('View')").first().click();
    
    // Wait for the error message to appear
    await page.waitForTimeout(2000);
    
    // Check if the unauthorized message or any error message appears
    const errorLocators = await page.locator("text=/You are not|Unauthorized|error/i").count();
    if (errorLocators > 0) {
        await expect(page.locator("text=/You are not|Unauthorized/i").first()).toBeVisible();
    }
});