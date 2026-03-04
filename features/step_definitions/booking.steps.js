// Improved visibility checks and scrolling in booking.steps.js

const { Page } = require('playwright');

async function scrollIntoViewIfNeeded(element) {
    const isVisible = await element.isVisible();
    if (!isVisible) {
        await element.scrollIntoViewIfNeeded();
    }
}

async function clickElement(element) {
    await scrollIntoViewIfNeeded(element);
    await element.click();
}

async function handlePopup(page) {
    const popup = page.locator('selector-for-popup');
    if (await popup.isVisible()) {
        await clickElement(popup);
    }
}

// Utilize the improved functions in your booking steps

module.exports = { clickElement, handlePopup };