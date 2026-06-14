import {expect,test} from '@playwright/test';
test("handling the dropdowns",async({page})=>{

    await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
    await page.locator('input#username').fill("rahulshettyacademy");
    await page.locator('input#password').fill("Learning@830$3mK2");
    //handling the static dropdowns using .selectOption("value") method
    await page.locator("select.form-control").selectOption("consult");
    //handling the radio buttons
    await page.locator('.radiotextsty').nth(1).click();
    await page.locator("#okayBtn").click();
    await page.locator("select.form-control").selectOption("teach");
    //Assertions for radio button using .toBeChecked() method
    await expect(await page.locator(".radiotextsty").nth(1)).toBeChecked();
    //Assertions like printing the value in the terminal using .isChecked() method
    console.log(await page.locator(".radiotextsty").nth(1).isChecked());


    await page.pause();

});