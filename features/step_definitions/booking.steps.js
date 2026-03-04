const { Given, When, Then } = require('@cucumber/cucumber');

Given('estic a la pàgina principal d\'eDreams', async function () {
  await this.page.goto('https://www.edreams.es', { waitUntil: 'domcontentloaded' });
  // Accept cookie consent if the banner is present
  try {
    const cookieBtn = this.page.locator('#onetrust-accept-btn-handler');
    await cookieBtn.click({ timeout: 5000 });
    await cookieBtn.waitFor({ state: 'hidden', timeout: 3000 });
  } catch {
    // No cookie banner present
  }
  // Dismiss any promotional modal/overlay that may block the page
  try {
    const modalClose = this.page.locator(
      '[class*="modal"] [class*="close"], [class*="overlay"] [class*="close"], ' +
      '[class*="popup"] [class*="close"], [class*="dialog"] [class*="close"], ' +
      'button[aria-label*="close" i], button[aria-label*="cerrar" i], ' +
      'button[aria-label*="tancar" i], [data-testid*="close"], ' +
      '[class*="modal__close"], [class*="Banner"] button[class*="close"]'
    ).first();
    await modalClose.waitFor({ state: 'visible', timeout: 5000 });
    await modalClose.click();
  } catch {
    // No close button found; press Escape as a fallback to dismiss any overlay
    await this.page.keyboard.press('Escape');
  }
});

When('selecciono un vol d\'anada simple', async function () {
  await this.page.getByText('Solo ida', { exact: true }).first().click();
});

When('introdueixo {string} com a origen del vol', async function (city) {
  const input = this.page.locator('[placeholder*="Origen"], [aria-label*="Origen"]').first();
  await input.click();
  await input.fill(city);
  await this.page.locator('[role="option"]').first().click({ timeout: 10000 });
});

When('introdueixo {string} com a destinació del vol', async function (city) {
  const input = this.page.locator('[placeholder*="Destino"], [aria-label*="Destino"]').first();
  await input.click();
  await input.fill(city);
  await this.page.locator('[role="option"]').first().click({ timeout: 10000 });
});

When('selecciono la data de sortida del mes vinent', async function () {
  // Open the departure date picker
  await this.page.locator('[class*="outbound"], [class*="depart"], [placeholder*="Ida"]').first().click({ timeout: 10000 });
  // Navigate to next month if needed
  try {
    await this.page.locator('[class*="next-month"], [aria-label*="Next"], [aria-label*="Siguiente mes"]').first().click({ timeout: 3000 });
  } catch {
    // Navigation not needed or not found
  }
  // Select the first available future day
  await this.page.locator('[class*="day"]:not([class*="disabled"]):not([class*="past"])').first().click({ timeout: 10000 });
});

When('faig clic al botó de cerca', async function () {
  await this.page.getByRole('button', { name: /buscar/i }).click();
  await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
});

Then('hauria de veure resultats de vols', async function () {
  await this.page.waitForURL(/result|vuelos|flights/, { timeout: 30000 });
});