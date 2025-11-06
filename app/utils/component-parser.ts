// Parser om HTML te analyseren en componenten te identificeren
export interface Component {
  id: string
  type: string
  name: string
  html: string
  section?: HTMLElement
  properties: {
    [key: string]: any
  }
  styles: {
    [key: string]: string
  }
}

export function parseComponentsFromHTML(html: string, css: string, js: string): Component[] {
  // Extract body content if full HTML document
  let bodyContent = html
  if (html.includes('<body')) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      bodyContent = bodyMatch[1]
    }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${bodyContent}</div>`, 'text/html')
  const components: Component[] = []

  // Zoek naar alle sections met data-component attributen
  const sections = doc.querySelectorAll('section[data-component], section[id*="section"], section[id*="-section"], [data-editable="true"], header, footer, main > section, .hero-section, .bracket-section')
  
  sections.forEach((section, index) => {
    const componentId = section.getAttribute('id') || section.getAttribute('data-component') || `component-${index}`
    const componentType = section.getAttribute('data-component') || extractComponentType(section, componentId)
    const componentName = getComponentName(componentType, section)

    // Extract content properties
    const properties = extractProperties(section)
    
    // Extract inline styles and computed styles
    const styles = extractStyles(section, css)

    components.push({
      id: componentId,
      type: componentType,
      name: componentName,
      html: section.outerHTML,
      section: section as HTMLElement,
      properties,
      styles
    })
  })

  // Als er geen sections zijn, probeer andere elementen
  if (components.length === 0) {
    const mainElements = doc.querySelectorAll('header, main section, .hero, .bracket, .sponsors, .twitch')
    mainElements.forEach((el, index) => {
      const componentId = el.id || `component-${index}`
      const componentType = extractComponentType(el as HTMLElement, componentId)
      
      components.push({
        id: componentId,
        type: componentType,
        name: getComponentName(componentType, el),
        html: el.outerHTML,
        section: el as HTMLElement,
        properties: extractProperties(el as HTMLElement),
        styles: extractStyles(el as HTMLElement, css)
      })
    })
  }

  return components
}

function extractComponentType(element: HTMLElement, id: string): string {
  // Check data-component attribute
  const dataComponent = element.getAttribute('data-component')
  if (dataComponent) return dataComponent

  // Check ID patterns
  if (id.includes('hero')) return 'hero'
  if (id.includes('bracket') || id.includes('teams')) return 'bracket'
  if (id.includes('twitch') || id.includes('stream')) return 'twitch'
  if (id.includes('sponsor')) return 'sponsors'
  if (id.includes('schedule') || id.includes('programma')) return 'schedule'
  if (id.includes('registration') || id.includes('inschrijving')) return 'registration'
  if (id.includes('contact')) return 'contact'
  if (id.includes('footer')) return 'footer'
  if (id.includes('about') || id.includes('info')) return 'about'
  
  // Check class names
  const classes = element.className
  if (classes.includes('hero')) return 'hero'
  if (classes.includes('bracket') || classes.includes('team')) return 'bracket'
  if (classes.includes('twitch')) return 'twitch'
  if (classes.includes('sponsor')) return 'sponsors'
  
  // Default
  return 'section'
}

function getComponentName(type: string, element: HTMLElement): string {
  const names: { [key: string]: string } = {
    hero: 'Hero Sectie',
    bracket: 'Bracket / Teams',
    twitch: 'Twitch Stream',
    sponsors: 'Sponsors',
    schedule: 'Programma',
    registration: 'Inschrijving',
    contact: 'Contact',
    footer: 'Footer',
    about: 'Over Het Toernooi',
    section: 'Sectie'
  }

  // Try to get title from h1, h2, or first heading
  const heading = element.querySelector('h1, h2, h3')?.textContent?.trim()
  if (heading) {
    return `${names[type] || type}: ${heading.substring(0, 30)}`
  }

  return names[type] || type
}

function extractProperties(element: HTMLElement): { [key: string]: any } {
  const props: { [key: string]: any } = {}

  // Extract text content
  const headings = Array.from(element.querySelectorAll('h1, h2, h3'))
  if (headings.length > 0) {
    props.title = headings[0].textContent?.trim() || ''
    if (headings.length > 1) {
      props.subtitle = headings[1].textContent?.trim() || ''
    }
  }

  // Extract paragraphs
  const paragraphs = Array.from(element.querySelectorAll('p'))
  if (paragraphs.length > 0) {
    props.description = paragraphs[0].textContent?.trim() || ''
  }

  // Extract buttons
  const buttons = Array.from(element.querySelectorAll('button, a.button'))
  props.buttons = buttons.map(btn => ({
    text: btn.textContent?.trim(),
    href: btn.getAttribute('href'),
    class: btn.className
  }))

  // Extract images
  const images = Array.from(element.querySelectorAll('img'))
  props.images = images.map(img => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt')
  }))

  // Extract data-attributes
  Array.from(element.attributes).forEach(attr => {
    if (attr.name.startsWith('data-') && !attr.name.startsWith('data-component') && !attr.name.startsWith('data-editable')) {
      props[attr.name.replace('data-', '')] = attr.value
    }
  })

  return props
}

function extractStyles(element: HTMLElement, css: string): { [key: string]: string } {
  const styles: { [key: string]: string } = {}

  // Get inline styles
  const inlineStyle = element.getAttribute('style')
  if (inlineStyle) {
    inlineStyle.split(';').forEach(rule => {
      const [key, value] = rule.split(':').map(s => s.trim())
      if (key && value) {
        styles[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value
      }
    })
  }

  // Get computed styles from CSS (simplified - in production use CSS parser)
  const elementId = element.id
  const elementClass = element.className

  if (elementId && css.includes(`#${elementId}`)) {
    // Extract styles for this ID
    const idRegex = new RegExp(`#${elementId}[^{]*\\{([^}]+)\\}`, 'g')
    const matches = css.match(idRegex)
    if (matches) {
      matches.forEach(match => {
        const styleContent = match.match(/\{([^}]+)\}/)?.[1]
        if (styleContent) {
          styleContent.split(';').forEach(rule => {
            const [key, value] = rule.split(':').map(s => s.trim())
            if (key && value) {
              styles[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value
            }
          })
        }
      })
    }
  }

  return styles
}

// Helper om een component te updaten in HTML
export function updateComponentInHTML(
  originalHTML: string,
  componentId: string,
  updates: {
    properties?: { [key: string]: any }
    styles?: { [key: string]: string }
    content?: string
  }
): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(originalHTML, 'text/html')
  
  const element = doc.getElementById(componentId) || doc.querySelector(`[data-component="${componentId}"]`)
  if (!element) return originalHTML

  // Update properties/content
  if (updates.properties) {
    Object.entries(updates.properties).forEach(([key, value]) => {
      if (key === 'title' || key === 'subtitle') {
        const heading = element.querySelector(key === 'title' ? 'h1, h2' : 'h2, h3')
        if (heading) heading.textContent = String(value)
      } else if (key === 'description') {
        const para = element.querySelector('p')
        if (para) para.textContent = String(value)
      } else {
        element.setAttribute(`data-${key}`, String(value))
      }
    })
  }

  // Update styles
  if (updates.styles) {
    const currentStyle = element.getAttribute('style') || ''
    const styleObj: { [key: string]: string } = {}
    
    // Parse existing styles
    currentStyle.split(';').forEach(rule => {
      const [key, value] = rule.split(':').map(s => s.trim())
      if (key && value) styleObj[key] = value
    })

    // Merge new styles
    Object.assign(styleObj, updates.styles)

    // Convert back to string
    const newStyle = Object.entries(styleObj)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')
    element.setAttribute('style', newStyle)
  }

  // Update raw content
  if (updates.content) {
    element.innerHTML = updates.content
  }

  return doc.documentElement.outerHTML
}
