import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/');
  await page.getByRole('textbox', { name: 'Username:' }).click();
  await page.getByRole('textbox', { name: 'Username:' }).fill('rahulshettyacademy');
  await page.getByRole('textbox', { name: 'Password:' }).click();
  await page.getByRole('textbox', { name: 'Password:' }).fill('Learning@830$3mK2');
  await page.getByRole('combobox').selectOption('consult');
  await page.getByRole('checkbox', { name: 'I Agree to the terms and' }).check();
  await page.getByRole('button', { name: 'Sign In' }).click();
});
test("loginpage using css selectors",async({page})=>{
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
  await page.locator('input#username').click(); 
  await page.locator("input#username").fill("rahulshettyacademy");
  await page.locator('input#password').click();
  await page.locator("input#password").fill("Learning@830$3mK2");
   

});

test("logging failed and extract the failed messaage",async({page})=>{
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
  await page.locator('input#username').click();
  await page.locator("input#username").fill("rahulshettyacademy");
  await page.locator('input#password').click();
  await page.locator("input#password").fill("Learning@830$3mK");
  await page.locator('input#signInBtn').click();
  //console.log(await page.locator('[style*="block"]').textContent());
  await expect( await page.locator('[style*="block"]')).toContainText('Incorrect username/password.');
});
test("grab the title of the the first product",async({page})=>{
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
  await page.locator('input#username').click();
  await page.locator("input#username").fill("rahulshettyacademy");
  await page.locator('input#password').click();
  await page.locator("input#password").fill("Learning@830$3mK2");
  await page.locator('input#signInBtn').click();
  //it is wait until network is idle and then it will move to next step. it is used to avoid the flakiness of the test.
  //  it is used to wait for the page to load completely before moving to next step.
  await page.waitForLoadState('networkidle');
  //console.log(await page.locator('[style*="block"]').textContent());
 // await expect( await page.locator('[style*="block"]')).toContainText('Incorrect username/password.');
  console.log(await page.locator('.card-title a').nth(1).textContent());
  await expect(await page.locator(".card-title a").nth(1)).toContainText("Samsung Note 8");
  console.log(await page.locator(".card-title a").first().textContent());
  const alltitles=await page.locator(".card-title a").allTextContents();
  console.log(alltitles);
});
