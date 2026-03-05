const { Given, When, Then } = require('@cucumber/cucumber');

// Delay between keystrokes to allow autocomplete suggestions to appear
const AUTOCOMPLETE_INPUT_DELAY = 100;

// Selector for autocomplete dropdown items
const DROPDOWN_SELECTOR = '[role="option"], [class*="suggestion"], [class*="autocomplete"] li';

/**
 * Tries a list of CSS selectors in order and returns the first visible element found.
 * @param {import('playwright').Page} page
 * @param {string[]} selectors
 * @param {number} timeoutMs - per-selector timeout in ms
 * @returns {Promise<import('playwright').Locator>}
 */
async function findFirstVisible(page, selectors, timeoutMs = 3000) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout: timeoutMs });
      return locator;
    } catch {
      // Try next selector
    }
  }
  throw new Error(`None of the selectors matched a visible element: ${selectors.join(', ')}`);
}

Given('estic a la pàgina principal d\'eDreams', async function () {
  await this.page.goto('https://www.edreams.es', { waitUntil: 'domcontentloaded' });
  await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch((err) => {
    console.warn('Network idle timeout:', err.message);
  });
  // Accept cookie consent if the banner is present
  try {
    const cookieBtn = this.page.locator('#onetrust-accept-btn-handler');
    await cookieBtn.waitFor({ state: 'visible', timeout: 5000 });
    await cookieBtn.click();
    await cookieBtn.waitFor({ state: 'hidden', timeout: 3000 });
  } catch {
    // No cookie banner present
  }
  // Dismiss any promotional modal/overlay that may block the page
  try {
    const modalClose = await findFirstVisible(this.page, [
      '[class*="modal__close"]',
      '[class*="modal"] [class*="close"]',
      '[class*="overlay"] [class*="close"]',
      '[class*="popup"] [class*="close"]',
      '[class*="dialog"] [class*="close"]',
      'button[aria-label*="close" i]',
      'button[aria-label*="cerrar" i]',
      'button[aria-label*="tancar" i]',
      '[data-testid*="close"]',
      '[class*="Banner"] button[class*="close"]',
    ], 5000);
    await modalClose.click();
  } catch {
    // No close button found; press Escape as a fallback to dismiss any overlay
    await this.page.keyboard.press('Escape');
  }
});

When('selecciono un vol d\'anada simple', async function () {
  const oneWayBtn = await findFirstVisible(this.page, [
    'button:has-text("Solo ida")',
    '[class*="trip-type"] [value="ONE_WAY"]',
    '[class*="trip-type"] [value="oneway"]',
    'label:has-text("Solo ida")',
    'input[value="ONE_WAY"] + label',
    'input[value="oneway"] + label',
    '[data-value="ONE_WAY"]',
    '[data-value="oneway"]',
    'text="Solo ida"',
  ], 10000);
  await oneWayBtn.click();
  // Wait briefly for the form to update after changing trip type
  await this.page.waitForTimeout(500);
});

When('introdueixo {string} com a origen del vol', async function (city) {
  const input = await findFirstVisible(this.page, [
    '[placeholder*="Origen" i]',
    '[aria-label*="Origen" i]',
    '[placeholder*="¿De dónde" i]',
    '[placeholder*="¿Desde dónde" i]',
    '[placeholder*="Ciudad de origen" i]',
    '[placeholder*="Salida" i]',
    '[placeholder*="De "]',
    '[name*="origin" i]',
    '[id*="origin" i]',
    '[data-cy*="origin" i]',
    '[data-testid*="origin" i]',
    '[autocomplete="origin"]',
    '[autocomplete*="from" i]',
    'input[class*="origin" i]',
    'input[class*="Origin" i]',
  ], 15000);
  await input.click();
  await input.pressSequentially(city, { delay: AUTOCOMPLETE_INPUT_DELAY });
  const dropdown = this.page.locator(DROPDOWN_SELECTOR).first();
  await dropdown.waitFor({ state: 'visible', timeout: 10000 });
  await dropdown.click();
});

When('introdueixo {string} com a destinació del vol', async function (city) {
  const input = await findFirstVisible(this.page, [
    '[placeholder*="Destino" i]',
    '[aria-label*="Destino" i]',
    '[placeholder*="¿A dónde" i]',
    '[placeholder*="¿Adónde" i]',
    '[placeholder*="Ciudad de destino" i]',
    '[placeholder*="Llegada" i]',
    '[name*="destination" i]',
    '[id*="destination" i]',
    '[name*="dest" i]',
    '[id*="dest" i]',
    '[data-cy*="destination" i]',
    '[data-testid*="destination" i]',
    '[autocomplete="destination"]',
    '[autocomplete*="to" i]',
    'input[class*="destination" i]',
    'input[class*="Destination" i]',
  ], 15000);
  await input.click();
  await input.pressSequentially(city, { delay: AUTOCOMPLETE_INPUT_DELAY });
  const dropdown = this.page.locator(DROPDOWN_SELECTOR).first();
  await dropdown.waitFor({ state: 'visible', timeout: 10000 });
  await dropdown.click();
});

When('selecciono la data de sortida del mes vinent', async function () {
  // Open the departure date picker
  const dateTrigger = await findFirstVisible(this.page, [
    '[class*="outbound"]',
    '[class*="depart"]',
    '[placeholder*="Ida"]',
    '[placeholder*="Salida"]',
    '[data-cy*="departure"]',
    '[data-testid*="departure"]',
    '[aria-label*="salida" i]',
    '[aria-label*="departure" i]',
    'input[class*="date" i][class*="from" i]',
  ], 10000);
  await dateTrigger.click();
  // Navigate to next month if needed
  try {
    const nextMonthBtn = await findFirstVisible(this.page, [
      '[class*="next-month"]',
      '[aria-label*="Next"]',
      '[aria-label*="Siguiente mes"]',
      '[aria-label*="siguiente" i]',
      '[data-cy*="next-month"]',
      'button[class*="next"]',
    ], 3000);
    await nextMonthBtn.click();
  } catch {
    // Navigation not needed or not found
  }
  // Select the first available future day
  const dayCell = await findFirstVisible(this.page, [
    '[class*="day"]:not([class*="disabled"]):not([class*="past"]):not([class*="before"])',
    '[class*="Day"]:not([class*="disabled"]):not([class*="past"]):not([class*="before"])',
    'td[class*="available"]',
    '[data-date]:not([class*="disabled"]):not([class*="past"])',
  ], 10000);
  await dayCell.click();
});

When('faig clic al botó de cerca', async function () {
  const searchBtn = await findFirstVisible(this.page, [
    'button[type="submit"]',
    'button:has-text("Buscar")',
    '[role="button"]:has-text("Buscar")',
    'a:has-text("Buscar")',
  ], 10000);
  await searchBtn.click();
  await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
});

Then('hauria de veure resultats de vols', async function () {
  await this.page.waitForURL(/result|vuelos|flights|search/, { timeout: 30000 });
});