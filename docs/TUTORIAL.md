# Tutorial/Walkthrough Component - Documentatie

## Overzicht

De interactieve tutorial component biedt een stap-voor-stap walkthrough voor nieuwe gebruikers van de Live Editor. De tutorial start automatisch bij first-time use en kan ook handmatig worden gestart via de "Help" knop.

## Functionaliteiten

### Automatisch starten
- De tutorial start automatisch voor nieuwe gebruikers (gecontroleerd via localStorage)
- Kan worden uitgeschakeld via `localStorage.setItem('custom_page_tutorial_disabled', 'true')`
- Wordt niet meer getoond na voltooiing (`custom_page_tutorial_completed`)

### Handmatig starten
- Klik op de "Help" knop in de header om de tutorial te starten
- De tutorial kan op elk moment worden gestart, ongeacht of deze eerder is voltooid

### Navigatie
- **Vorige/Volgende**: Navigeer tussen stappen
- **Sla over**: Sluit de tutorial zonder voltooiing
- **Sluit**: Sluit de tutorial (laatste stap)
- **Keyboard**: 
  - `ESC`: Sluit tutorial
  - `Arrow Left/Right`: Navigeer tussen stappen
  - `Enter`: Volgende stap
  - `Tab`: Focus naar tooltip
- **Swipe**: Op mobiel, swipe links/rechts om te navigeren

### Toegankelijkheid
- ARIA-live updates voor screenreaders
- Focus management
- Keyboard navigatie
- Screenreader labels

### Analytics Events
De tutorial stuurt automatisch analytics events:
- `tutorial_started`: Wanneer tutorial start
- `step_viewed`: Bij elke stap (met step nummer)
- `tutorial_completed`: Bij voltooiing
- `tutorial_skipped`: Bij overslaan

## Configuratie

### Stappen aanpassen

De tutorial stappen zijn gedefinieerd in `app/custom/page.tsx` binnen de `<Tutorial>` component. Elke stap heeft:

```typescript
{
  id: string;                    // Unieke identifier
  targetSelector: string;        // CSS selector voor het target element
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  title?: string;                // Optionele titel
  content: string;               // Instructie tekst
  highlight?: boolean;           // Of element moet worden gehighlight
  actionBefore?: () => void;     // Functie die wordt uitgevoerd voor de stap
}
```

### Teksten aanpassen

De teksten kunnen worden aangepast in de `config` prop van de Tutorial component:

```typescript
{
  skipText: 'Sla over',
  nextText: 'Volgende',
  previousText: 'Vorige',
  closeText: 'Sluit',
  progressText: 'Stap',
}
```

## Integratie

### Nieuwe tutorial toevoegen

1. Importeer de Tutorial component:
```typescript
import Tutorial, { type TutorialStep } from '../components/Tutorial';
```

2. Voeg state toe:
```typescript
const [isTutorialActive, setIsTutorialActive] = useState(false);
```

3. Voeg de Tutorial component toe aan je JSX:
```tsx
<Tutorial
  config={{
    steps: [...], // Je stappen
    // ... andere config
  }}
  isActive={isTutorialActive}
  onClose={() => setIsTutorialActive(false)}
  onComplete={() => {
    // Markeer als voltooid
    localStorage.setItem('tutorial_completed', 'true');
  }}
/>
```

## Test Checklist

### Functionele Tests
- [ ] Tutorial start automatisch bij first-time use
- [ ] Tutorial kan worden gestart via Help knop
- [ ] Alle 7 stappen worden correct getoond
- [ ] Navigatie werkt (Vorige/Volgende)
- [ ] Tutorial kan worden overgeslagen
- [ ] Tutorial sluit correct af

### Keyboard Tests
- [ ] ESC sluit de tutorial
- [ ] Arrow Left/Right navigeert tussen stappen
- [ ] Enter gaat naar volgende stap
- [ ] Tab verplaatst focus naar tooltip

### Mobiele Tests
- [ ] Swipe links/rechts werkt op mobiel
- [ ] Tooltip is leesbaar op kleine schermen
- [ ] Highlight is zichtbaar op mobiel
- [ ] Tooltip positioneert correct op mobiel

### Toegankelijkheid Tests
- [ ] Screenreader leest tooltip content
- [ ] ARIA labels zijn aanwezig
- [ ] Focus management werkt correct
- [ ] Keyboard navigatie is volledig functioneel

### Edge Cases
- [ ] Tutorial werkt als target element niet bestaat (fallback)
- [ ] Tutorial werkt na pagina refresh
- [ ] Tutorial kan opnieuw worden gestart na voltooiing
- [ ] Analytics events worden correct verstuurd

## Troubleshooting

### Tutorial start niet automatisch
- Controleer of `custom_page_tutorial_completed` niet is ingesteld in localStorage
- Controleer of `custom_page_tutorial_disabled` niet is ingesteld
- Controleer console voor errors

### Target element niet gevonden
- Controleer of de CSS selector correct is
- Controleer of het element bestaat in de DOM
- De tutorial toont een fallback melding als element niet wordt gevonden

### Highlight werkt niet
- Controleer of `highlight: true` is ingesteld
- Controleer of target element bestaat
- Controleer z-index waarden (tutorial gebruikt z-[9999])

## Aanpassingen voor Vertalingen

Om de tutorial te vertalen:

1. Maak een nieuwe config object met vertaalde teksten
2. Gebruik een translation hook of context
3. Pas de `config` prop aan met vertaalde strings

Voorbeeld:
```typescript
const tutorialConfig = {
  steps: translatedSteps,
  skipText: t('tutorial.skip'),
  nextText: t('tutorial.next'),
  // ...
};
```

## Performance

- Tutorial gebruikt `createPortal` voor rendering buiten de normale DOM flow
- Highlights worden alleen getoond wanneer nodig
- Position calculations worden gecached waar mogelijk
- Analytics events worden asynchroon verstuurd


