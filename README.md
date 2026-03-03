# testing-playwright

Framework de testing amb Gherkin (Cucumber) i Playwright per a proves automatitzades.

## Exemple: Reserva de vol a eDreams

El projecte inclou un escenari de cerca de vol a [eDreams](https://www.edreams.es) escrit en català amb sintaxi Gherkin.

### Estructura del projecte

```
├── features/
│   ├── booking.feature          # Escenari Gherkin en català
│   └── step_definitions/
│       └── booking.steps.js     # Implementació dels passos amb Playwright
├── support/
│   └── world.js                 # Configuració del món Cucumber + Playwright (enregistrament de vídeo)
├── cucumber.js                  # Configuració de Cucumber
├── .github/
│   └── workflows/
│       └── playwright.yml       # GitHub Action per executar els tests i guardar el vídeo
└── package.json
```

### Requisits

- Node.js >= 18
- npm

### Instal·lació

```bash
npm install
npx playwright install chromium --with-deps
```

### Execució dels tests

```bash
npm test
```

Els vídeos dels tests es guarden automàticament a la carpeta `videos/`.
Els informes HTML es generen a `reports/cucumber-report.html`.

### GitHub Actions

El workflow `.github/workflows/playwright.yml` s'executa automàticament en cada push i pull request.
Al finalitzar, el vídeo generat es puja com a **artifact** anomenat `playwright-videos` a la GitHub Action.

### Tecnologies

- **[Playwright](https://playwright.dev/)** – Automatització del navegador
- **[Cucumber.js](https://cucumber.io/docs/installation/javascript/)** – Framework BDD amb sintaxi Gherkin
- **Gherkin en català** – Els escenaris estan escrits en català usant les paraules clau de Cucumber
