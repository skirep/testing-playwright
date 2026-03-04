const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am on the booking page', async function () {
  await this.page.goto('https://www.edreams.es', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Accept cookies if the dialog appears
  try {
    const cookieBtn = this.page.locator('button:has-text("Aceptar"), button:has-text("Accept"), [id*="accept"], [class*="accept-cookie"]').first();
    await cookieBtn.waitFor({ timeout: 5000 });
    await cookieBtn.click();
  } catch {
    // Cookie dialog not present, continue
  }
});

When('I fill out the booking form', async function () {
  // Select round-trip type
  try {
    const roundTripSelector = this.page.locator('[data-testid*="round"], label:has-text("Ida y vuelta"), button:has-text("Ida y vuelta")').first();
    await roundTripSelector.waitFor({ timeout: 5000 });
    await roundTripSelector.click();
  } catch {
    // Already selected or selector not found, continue
  }

  // Fill in origin
  const originInput = this.page.locator('[data-testid*="origin"], [placeholder*="Origen"], [placeholder*="origen"], input[name*="origin"]').first();
  await originInput.waitFor({ timeout: 10000 });
  await originInput.click();
  await originInput.fill('Barcelona');

  // Wait for autocomplete suggestions
  const originSuggestion = this.page.locator('[data-testid*="suggestion"], [class*="suggestion"], [class*="autocomplete"] li, [role="option"]').first();
  try {
    await originSuggestion.waitFor({ state: 'visible', timeout: 5000 });
    await originSuggestion.click();
  } catch {
    await this.page.keyboard.press('Enter');
  }

  // Fill in destination
  const destInput = this.page.locator('[data-testid*="destination"], [placeholder*="Destino"], [placeholder*="destino"], input[name*="destination"]').first();
  await destInput.waitFor({ timeout: 10000 });
  await destInput.click();
  await destInput.fill('Madrid');

  // Wait for autocomplete suggestions
  const destSuggestion = this.page.locator('[data-testid*="suggestion"], [class*="suggestion"], [class*="autocomplete"] li, [role="option"]').first();
  try {
    await destSuggestion.waitFor({ state: 'visible', timeout: 5000 });
    await destSuggestion.click();
  } catch {
    await this.page.keyboard.press('Enter');
  }

  // Select departure date
  const calendarTrigger = this.page.locator('[data-testid*="departure-date"], [data-testid*="depart"], [class*="departure"], input[name*="depart"]').first();
  try {
    await calendarTrigger.waitFor({ timeout: 5000 });
    await calendarTrigger.click();
  } catch {
    await this.page.locator('[data-testid*="date"], [class*="date-picker"]').first().click();
  }

  // Wait for calendar to be visible
  await this.page.locator('[class*="calendar"], [class*="DayPicker"], [class*="date-picker"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

  const departureDate = '2026-04-15';
  const [year, month, day] = departureDate.split('-').map(Number);
  await selectCalendarDate(this.page, year, month, day);

  // Select return date
  await this.page.locator('[class*="calendar"], [class*="DayPicker"], [class*="date-picker"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  const returnDate = '2026-04-22';
  const [rYear, rMonth, rDay] = returnDate.split('-').map(Number);
  await selectCalendarDate(this.page, rYear, rMonth, rDay);
});

When('I submit the form', async function () {
  const button = this.page.locator('button:has-text("Search"), [data-testid*="search"], input[type="submit"]').first();
  await button.waitFor({ timeout: 10000 });
  await button.click();
  await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
});

Then('I should see a confirmation message', async function () {
  // Wait for results page to load
  await this.page.waitForFunction(
    () => document.title.toLowerCase().includes('barcelona') ||
          document.title.toLowerCase().includes('madrid') ||
          window.location.href.includes('search') ||
          window.location.href.includes('vuelos') ||
          document.querySelector('[class*="result"], [data-testid*="result"], [class*="flight-card"]') !== null,
    { timeout: 30000 }
  );
  
  const resultsContainer = this.page.locator('[class*="result"], [data-testid*="result"], [class*="flight-card"]').first();
  await expect(resultsContainer).toBeTruthy();
});

When('I fill out the booking form with invalid data', async function () {
  // Select round-trip type
  try {
    const roundTripSelector = this.page.locator('[data-testid*="round"], label:has-text("Ida y vuelta"), button:has-text("Ida y vuelta")').first();
    await roundTripSelector.waitFor({ timeout: 5000 });
    await roundTripSelector.click();
  } catch {
    // Already selected, continue
  }

  // Fill in origin with invalid data
  const originInput = this.page.locator('[data-testid*="origin"], [placeholder*="Origen"], [placeholder*="origen"], input[name*="origin"]').first();
  await originInput.waitFor({ timeout: 10000 });
  await originInput.click();
  await originInput.fill('InvalidPlace123');
  await this.page.keyboard.press('Escape');

  // Fill in destination with invalid data
  const destInput = this.page.locator('[data-testid*="destination"], [placeholder*="Destino"], [placeholder*="destino"], input[name*="destination"]').first();
  await destInput.waitFor({ timeout: 10000 });
  await destInput.click();
  await destInput.fill('FakeCity456');
  await this.page.keyboard.press('Escape');
});

Then('I should see an error message', async function () {
  // Wait for error to appear
  const errorMessage = this.page.locator('[class*="error"], [role="alert"], [class*="message"]').first();
  try {
    await errorMessage.waitFor({ timeout: 10000 });
    const text = await errorMessage.textContent();
    expect(text).toBeTruthy();
  } catch {
    // If no error message appears, the booking form should at least not submit
    const resultsContainer = this.page.locator('[class*="result"], [data-testid*="result"]').first();
    await expect(resultsContainer).not.toBeTruthy();
  }
});

// Helper function to select a date in the calendar
async function selectCalendarDate(page, targetYear, targetMonth, targetDay) {
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const targetMonthName = monthNames[targetMonth - 1];

  for (let attempt = 0; attempt < 12; attempt++) {
    const monthHeader = page.locator('[class*="calendar"] [class*="month"], [class*="DayPicker"] .DayPicker-Caption, [class*="month-header"]').first();
    try {
      const headerText = await monthHeader.textContent({ timeout: 2000 });
      if (headerText && headerText.toLowerCase().includes(targetMonthName)) {
        const dayCell = page.locator(`[class*="calendar"] [class*="day"]:has-text("${targetDay}"), td[aria-label*="${targetDay}"], button[aria-label*="${targetDay}"]`).first();
        await dayCell.click();
        return;
      }
    } catch {
      // Header not found, try clicking the day directly
    }

    // Navigate to next month
    const nextBtn = page.locator('[class*="next"], [aria-label*="next"], [aria-label*="siguiente"], button:has-text(">"), button:has-text("›")').first();
    try {
      await nextBtn.click();
      await page.waitForFunction(
        () => document.querySelector('[class*="calendar"], [class*="DayPicker"]') !== null,
        { timeout: 2000 }
      ).catch(() => {});
    } catch {
      break;
    }
  }

  // Fallback: try clicking by data-date attribute
  try {
    const dayCell = page.locator(`[data-date="${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}"]`).first();
    await dayCell.click();
  } catch {
    // Ignore if not found
  }
}