// Parser om HTML te analyseren en componenten te identificeren
export interface Component {
  id: string
  type: string
  name: string
  html: string
  section?: HTMLElement
  properties: {
    [key: string]: unknown
  }
  styles: {
    [key: string]: string
  }
}

export function parseComponentsFromHTML(html: string, css: string): Component[] {
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
    const htmlSection = section as HTMLElement
    const componentId = htmlSection.getAttribute('id') || htmlSection.getAttribute('data-component') || `component-${index}`
    const componentType = htmlSection.getAttribute('data-component') || extractComponentType(htmlSection, componentId)
    const componentName = getComponentName(componentType, htmlSection)

    // Extract content properties
    const properties = extractProperties(htmlSection)
    
    // Extract inline styles and computed styles
    const styles = extractStyles(htmlSection, css)

    components.push({
      id: componentId,
      type: componentType,
      name: componentName,
      html: htmlSection.outerHTML,
      section: htmlSection,
      properties,
      styles
    })
  })

  // Als er geen sections zijn, probeer andere elementen
  if (components.length === 0) {
    const mainElements = doc.querySelectorAll('header, main section, .hero, .bracket, .sponsors, .twitch')
    mainElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      const componentId = htmlEl.id || `component-${index}`
      const componentType = extractComponentType(htmlEl, componentId)
      
      components.push({
        id: componentId,
        type: componentType,
        name: getComponentName(componentType, htmlEl),
        html: htmlEl.outerHTML,
        section: htmlEl,
        properties: extractProperties(htmlEl),
        styles: extractStyles(htmlEl, css)
      })
    })
  }

  return components
}

function extractComponentType(element: HTMLElement, id: string): string {
  // Check data-component attribute
  const dataComponent = element.getAttribute('data-component')
  if (dataComponent) {
    // Schedule en program zijn hetzelfde - converteer schedule naar program
    if (dataComponent === 'schedule') return 'program'
    return dataComponent
  }

  // Check ID patterns
  if (id.includes('navigation') || id.includes('nav') || id.includes('header')) return 'navigation'
  if (id.includes('hero')) return 'hero'
  if (id.includes('bracket') || id.includes('teams')) return 'bracket'
  if (id.includes('twitch') || id.includes('stream')) return 'twitch'
  if (id.includes('sponsor')) return 'sponsors'
  // Schedule en program zijn hetzelfde - beide worden behandeld als 'program'
  if (id.includes('schedule') || id.includes('programma') || id.includes('program-section') || id.includes('schedule-section')) return 'program'
  if (id.includes('program') && !id.includes('programma')) return 'program'
  if (id.includes('registration') || id.includes('inschrijving')) return 'registration'
  if (id.includes('contact')) return 'contact'
  if (id.includes('footer')) return 'footer'
  if (id.includes('about') || id.includes('info')) return 'about'
  
  // Check class names
  const classes = element.className
  if (classes.includes('navigation') || classes.includes('nav') || classes.includes('header')) return 'navigation'
  if (classes.includes('hero')) return 'hero'
  if (classes.includes('bracket') || classes.includes('team')) return 'bracket'
  if (classes.includes('twitch')) return 'twitch'
  if (classes.includes('sponsor')) return 'sponsors'
  // Schedule en program zijn hetzelfde - beide worden behandeld als 'program'
  if (classes.includes('schedule-section') || classes.includes('schedule') || classes.includes('program-section') || (classes.includes('program') && !classes.includes('programma'))) return 'program'
  if (classes.includes('about-section') || classes.includes('about')) return 'about'
  
  // Check tag name
  if (element.tagName === 'HEADER' || element.tagName === 'NAV') return 'navigation'
  
  // Default
  return 'section'
}

function getComponentName(type: string, element: HTMLElement): string {
  const names: { [key: string]: string } = {
    navigation: 'Navigation',
    hero: 'Hero Sectie',
    bracket: 'Bracket / Teams',
    twitch: 'Twitch Stream',
    sponsors: 'Sponsors',
    schedule: 'Programma', // schedule wordt behandeld als program
    program: 'Programma',
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

function extractProperties(element: HTMLElement): { [key: string]: unknown } {
  const props: { [key: string]: unknown } = {}

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

  // Extract navigation-specific properties
  const navFormat = element.getAttribute('data-nav-format')
  if (navFormat) {
    props.navFormat = navFormat
  }

  // Extract nav links
  const navLinks = element.querySelectorAll('[data-nav-link-text]')
  if (navLinks.length > 0) {
    props.navLinks = Array.from(navLinks).map(link => ({
      text: link.getAttribute('data-nav-link-text') || link.textContent?.trim() || '',
      href: link.getAttribute('href') || '',
      element: link
    }))
  }

  // Extract logo
  const logoImg = element.querySelector('#nav-logo-img, [data-editable-image="true"]')
  if (logoImg) {
    props.logo = {
      src: logoImg.getAttribute('src') || '',
      alt: logoImg.getAttribute('alt') || 'Logo'
    }
  }

  // Extract hero-specific properties
  const heroFormat = element.getAttribute('data-hero-format')
  if (heroFormat) {
    props.heroFormat = heroFormat
  }

  const heroImage = element.querySelector('#hero-image')
  if (heroImage) {
    props.image = {
      src: heroImage.getAttribute('src') || '',
      alt: heroImage.getAttribute('alt') || 'Hero image'
    }
  }

  const heroText = element.querySelector('[data-editable-text="hero.text"]')
  if (heroText) {
    props.heroText = heroText.textContent?.trim() || ''
  }

  // Extract tournament boxes
  const tournamentBoxes = element.querySelectorAll('[data-tournament-box]')
  if (tournamentBoxes.length > 0) {
    props.tournamentBoxes = Array.from(tournamentBoxes).map(box => {
      const boxNum = box.getAttribute('data-tournament-box') || '1'
      const title = box.querySelector('[data-editable-text*="tournament.box' + boxNum + '.title"]')?.textContent?.trim() || ''
      const paragraph = box.querySelector('[data-editable-text*="tournament.box' + boxNum + '.paragraph"]')?.textContent?.trim() || ''
      return { title, paragraph }
    })
  }

  // Extract about-specific properties
  const aboutFormat = element.getAttribute('data-about-format')
  if (aboutFormat) {
    props.aboutFormat = aboutFormat
  }

  const aboutTitle = element.querySelector('[data-editable-text="about.title"], .about-title')
  if (aboutTitle) {
    props.aboutTitle = aboutTitle.textContent?.trim() || ''
  }

  const aboutText = element.querySelector('[data-editable-text="about.text"], .about-text')
  if (aboutText) {
    props.aboutText = aboutText.textContent?.trim() || ''
  }

  // Extract about boxes
  const aboutBoxes = element.querySelectorAll('[data-about-box]')
  if (aboutBoxes.length > 0) {
    props.aboutBoxes = Array.from(aboutBoxes).map(box => {
      const boxNum = box.getAttribute('data-about-box') || '1'
      const title = box.querySelector('[data-editable-text*="about.box' + boxNum + '.title"]')?.textContent?.trim() || 
                    box.querySelector('.about-box-title')?.textContent?.trim() || ''
      return { title }
    })
  }

  // Extract program/schedule-specific properties (schedule is hetzelfde als program, alleen andere taal)
  const programFormat = element.getAttribute('data-program-format') || element.getAttribute('data-schedule-format')
  if (programFormat) {
    props.programFormat = programFormat
  }

  // Check both program and schedule selectors
  const programTitle = element.querySelector('[data-editable-text="program.title"], [data-editable-text="schedule.title"], .program-title, .schedule-title')
  if (programTitle) {
    props.programTitle = programTitle.textContent?.trim() || ''
  }

  const programText = element.querySelector('[data-editable-text="program.text"], [data-editable-text="schedule.text"], .program-text, .schedule-text')
  if (programText) {
    props.programText = programText.textContent?.trim() || ''
  }

  // Extract program/schedule boxes (check both data-program-box and data-schedule-box)
  const programBoxes = element.querySelectorAll('[data-program-box], [data-schedule-box]')
  if (programBoxes.length > 0) {
    props.programBoxes = Array.from(programBoxes).map(box => {
      const boxNum = box.getAttribute('data-program-box') || box.getAttribute('data-schedule-box') || '1'
      const title = box.querySelector('[data-editable-text*="program.box' + boxNum + '.title"], [data-editable-text*="schedule.box' + boxNum + '.title"]')?.textContent?.trim() || 
                    box.querySelector('.program-box-title, .schedule-box-title')?.textContent?.trim() || ''
      return { title }
    })
  }

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
  // const elementClass = element.className

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
    properties?: { [key: string]: unknown }
    styles?: { [key: string]: string }
    content?: string
  }
): string {
  // Extract body content if full HTML document
  let bodyContent = originalHTML
  if (originalHTML.includes('<body')) {
    const bodyMatch = originalHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      bodyContent = bodyMatch[1]
    }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${bodyContent}</div>`, 'text/html')
  
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
      } else if (key === 'navFormat') {
        // Update navigation format
        element.setAttribute('data-nav-format', String(value))
        // Update CSS class if needed
        element.classList.remove('nav-format-default', 'nav-format-centered', 'nav-format-minimal', 'nav-format-spacious')
        element.classList.add(`nav-format-${value}`)
      } else if (key === 'logo') {
        // Update logo image - try multiple selectors to find the logo
        let logoImg = element.querySelector('#nav-logo-img')
        if (!logoImg) {
          logoImg = element.querySelector('[data-editable-image="true"]')
        }
        if (!logoImg) {
          // Fallback: find any img in nav-logo or first img in navigation
          logoImg = element.querySelector('.nav-logo img') || element.querySelector('nav img') || element.querySelector('header img')
        }
        if (logoImg && typeof value === 'object' && value !== null) {
          const logoData = value as { src?: string; alt?: string }
          if (logoData.src !== undefined) {
            logoImg.setAttribute('src', String(logoData.src))
            // Also update the innerHTML if it's an img tag
            if (logoImg.tagName === 'IMG') {
              (logoImg as HTMLImageElement).src = String(logoData.src)
            }
          }
          if (logoData.alt !== undefined) {
            logoImg.setAttribute('alt', String(logoData.alt))
          }
        }
      } else if (key === 'navLinks' && Array.isArray(value)) {
        // Update nav links text
        const links = element.querySelectorAll('[data-nav-link-text]')
        links.forEach((link, index) => {
          if (value[index] && typeof value[index] === 'object') {
            const linkData = value[index] as { text?: string }
            if (linkData.text !== undefined) {
              link.setAttribute('data-nav-link-text', String(linkData.text))
              link.textContent = String(linkData.text)
            }
          }
        })
      } else if (key === 'heroFormat') {
        element.setAttribute('data-hero-format', String(value))
        // Update CSS classes
        element.classList.remove('hero-format-image-left', 'hero-format-image-right', 'hero-format-image-top', 'hero-format-image-full', 'hero-format-text-only')
        const formatValue = String(value)
        element.classList.add(`hero-format-${formatValue}`)
      } else if (key === 'heroText') {
        let heroTextEl = element.querySelector('[data-editable-text="hero.text"], .hero-title')
        if (!heroTextEl) {
          // Create hero text element if it doesn't exist
          heroTextEl = doc.createElement('h1')
          heroTextEl.className = 'hero-title'
          heroTextEl.setAttribute('data-editable-text', 'hero.text')
          const container = element.querySelector('.hero-content') || element.querySelector('.hero-container') || element
          container.insertBefore(heroTextEl, container.firstChild)
        }
        heroTextEl.textContent = String(value)
      } else if (key === 'image' && typeof value === 'object' && value !== null) {
        const imageData = value as { src?: string; alt?: string }
        let heroImage = element.querySelector('#hero-image')
        if (!heroImage) {
          // Create image element if it doesn't exist
          const imageWrapper = element.querySelector('.hero-image-wrapper')
          if (imageWrapper) {
            heroImage = doc.createElement('img')
            heroImage.id = 'hero-image'
            heroImage.setAttribute('data-editable-image', 'true')
            heroImage.setAttribute('alt', imageData.alt || 'Hero image')
            imageWrapper.appendChild(heroImage)
          }
        }
        if (heroImage) {
          if (imageData.src !== undefined) {
            heroImage.setAttribute('src', String(imageData.src))
            if (heroImage.tagName === 'IMG') {
              (heroImage as HTMLImageElement).src = String(imageData.src)
            }
          }
          if (imageData.alt !== undefined) {
            heroImage.setAttribute('alt', String(imageData.alt))
          }
        }
      } else if (key === 'tournamentBoxes' && Array.isArray(value)) {
        // Update tournament boxes
        let boxesContainer = element.querySelector('.hero-tournament-info, .tournament-info')
        if (!boxesContainer) {
          // Create boxes container if it doesn't exist
          boxesContainer = doc.createElement('div')
          boxesContainer.className = 'hero-tournament-info'
          const container = element.querySelector('.hero-content') || element.querySelector('.hero-container') || element
          container.appendChild(boxesContainer)
        }
        
        value.forEach((box: { title?: string; paragraph?: string }, index: number) => {
          const boxNum = index + 1
          let boxEl = boxesContainer.querySelector(`[data-tournament-box="${boxNum}"]`)
          if (!boxEl) {
            // Create box if it doesn't exist
            boxEl = doc.createElement('div')
            boxEl.className = 'tournament-box'
            boxEl.setAttribute('data-tournament-box', String(boxNum))
            const titleEl = doc.createElement('h3')
            titleEl.className = 'tournament-box-title'
            titleEl.setAttribute('data-editable-text', `tournament.box${boxNum}.title`)
            const paragraphEl = doc.createElement('p')
            paragraphEl.className = 'tournament-box-paragraph'
            paragraphEl.setAttribute('data-editable-text', `tournament.box${boxNum}.paragraph`)
            boxEl.appendChild(titleEl)
            boxEl.appendChild(paragraphEl)
            boxesContainer.appendChild(boxEl)
          }
          const titleEl = boxEl.querySelector(`[data-editable-text*="tournament.box${boxNum}.title"]`)
          const paragraphEl = boxEl.querySelector(`[data-editable-text*="tournament.box${boxNum}.paragraph"]`)
          if (titleEl && box.title !== undefined) titleEl.textContent = String(box.title)
          if (paragraphEl && box.paragraph !== undefined) paragraphEl.textContent = String(box.paragraph)
        })
        
        // Remove extra boxes if array is smaller
        const existingBoxes = boxesContainer.querySelectorAll('[data-tournament-box]')
        existingBoxes.forEach((box, index) => {
          if (index >= value.length) {
            box.remove()
          }
        })
      } else if (key === 'aboutFormat') {
        element.setAttribute('data-about-format', String(value))
        // Update CSS classes
        element.classList.remove('about-format-grid-2x2', 'about-format-grid-2x1', 'about-format-grid-3x1', 'about-format-grid-4x1')
        element.classList.add(`about-format-${value}`)
      } else if (key === 'aboutTitle') {
        let aboutTitleEl = element.querySelector('[data-editable-text="about.title"], .about-title')
        if (!aboutTitleEl) {
          // Create title element if it doesn't exist
          aboutTitleEl = doc.createElement('h2')
          aboutTitleEl.className = 'about-title'
          aboutTitleEl.setAttribute('data-editable-text', 'about.title')
          const container = element.querySelector('.about-container') || element
          container.insertBefore(aboutTitleEl, container.firstChild)
        }
        aboutTitleEl.textContent = String(value)
      } else if (key === 'aboutText') {
        let aboutTextEl = element.querySelector('[data-editable-text="about.text"], .about-text')
        if (!aboutTextEl) {
          // Create text element if it doesn't exist
          aboutTextEl = doc.createElement('p')
          aboutTextEl.className = 'about-text'
          aboutTextEl.setAttribute('data-editable-text', 'about.text')
          const container = element.querySelector('.about-container') || element
          const titleEl = container.querySelector('.about-title')
          if (titleEl && titleEl.nextSibling) {
            container.insertBefore(aboutTextEl, titleEl.nextSibling)
          } else {
            container.appendChild(aboutTextEl)
          }
        }
        aboutTextEl.textContent = String(value)
      } else if (key === 'aboutBoxes' && Array.isArray(value)) {
        // Update about boxes
        let boxesContainer = element.querySelector('.about-boxes')
        if (!boxesContainer) {
          // Create boxes container if it doesn't exist
          boxesContainer = doc.createElement('div')
          boxesContainer.className = 'about-boxes'
          const container = element.querySelector('.about-container') || element
          container.appendChild(boxesContainer)
        }
        
        value.forEach((box: { title?: string }, index: number) => {
          const boxNum = index + 1
          let boxEl = boxesContainer.querySelector(`[data-about-box="${boxNum}"]`)
          if (!boxEl) {
            // Create box if it doesn't exist
            boxEl = doc.createElement('div')
            boxEl.className = 'about-box'
            boxEl.setAttribute('data-about-box', String(boxNum))
            const titleEl = doc.createElement('h3')
            titleEl.className = 'about-box-title'
            titleEl.setAttribute('data-editable-text', `about.box${boxNum}.title`)
            boxEl.appendChild(titleEl)
            boxesContainer.appendChild(boxEl)
          }
          const titleEl = boxEl.querySelector(`[data-editable-text*="about.box${boxNum}.title"]`) || 
                         boxEl.querySelector('.about-box-title')
          if (titleEl && box.title !== undefined) titleEl.textContent = String(box.title)
        })
        
        // Remove extra boxes if array is smaller
        const existingBoxes = boxesContainer.querySelectorAll('[data-about-box]')
        existingBoxes.forEach((box, index) => {
          if (index >= value.length) {
            box.remove()
          }
        })
      } else if (key === 'programFormat') {
        // Update both program and schedule format (schedule is hetzelfde als program)
        element.setAttribute('data-program-format', String(value))
        element.setAttribute('data-schedule-format', String(value))
        // Update CSS classes
        element.classList.remove('program-format-grid-2x1', 'program-format-grid-4x1')
        element.classList.add(`program-format-${value}`)
      } else if (key === 'programTitle') {
        // Update both program and schedule title selectors
        let programTitleEl = element.querySelector('[data-editable-text="program.title"], [data-editable-text="schedule.title"], .program-title, .schedule-title')
        if (!programTitleEl) {
          // Create title element if it doesn't exist
          programTitleEl = doc.createElement('h2')
          programTitleEl.className = 'program-title'
          programTitleEl.setAttribute('data-editable-text', 'program.title')
          const container = element.querySelector('.program-container') || element
          container.insertBefore(programTitleEl, container.firstChild)
        }
        programTitleEl.textContent = String(value)
      } else if (key === 'programText') {
        // Update both program and schedule text selectors
        let programTextEl = element.querySelector('[data-editable-text="program.text"], [data-editable-text="schedule.text"], .program-text, .schedule-text')
        if (!programTextEl) {
          // Create text element if it doesn't exist
          programTextEl = doc.createElement('p')
          programTextEl.className = 'program-text'
          programTextEl.setAttribute('data-editable-text', 'program.text')
          const container = element.querySelector('.program-container') || element
          const titleEl = container.querySelector('.program-title, .schedule-title')
          if (titleEl && titleEl.nextSibling) {
            container.insertBefore(programTextEl, titleEl.nextSibling)
          } else {
            container.appendChild(programTextEl)
          }
        }
        programTextEl.textContent = String(value)
      } else if (key === 'programBoxes' && Array.isArray(value)) {
        // Update program/schedule boxes (check both data-program-box and data-schedule-box)
        let boxesContainer = element.querySelector('.program-boxes')
        if (!boxesContainer) {
          // Create boxes container if it doesn't exist
          boxesContainer = doc.createElement('div')
          boxesContainer.className = 'program-boxes'
          const container = element.querySelector('.program-container') || element
          container.appendChild(boxesContainer)
        }
        
        value.forEach((box: { title?: string }, index: number) => {
          const boxNum = index + 1
          let boxEl = boxesContainer.querySelector(`[data-program-box="${boxNum}"], [data-schedule-box="${boxNum}"]`)
          if (!boxEl) {
            // Create box if it doesn't exist
            boxEl = doc.createElement('div')
            boxEl.className = 'program-box'
            boxEl.setAttribute('data-program-box', String(boxNum))
            const titleEl = doc.createElement('h3')
            titleEl.className = 'program-box-title'
            titleEl.setAttribute('data-editable-text', `program.box${boxNum}.title`)
            boxEl.appendChild(titleEl)
            boxesContainer.appendChild(boxEl)
          }
          const titleEl = boxEl.querySelector(`[data-editable-text*="program.box${boxNum}.title"], [data-editable-text*="schedule.box${boxNum}.title"]`) || 
                         boxEl.querySelector('.program-box-title, .schedule-box-title')
          if (titleEl && box.title !== undefined) titleEl.textContent = String(box.title)
        })
        
        // Remove extra boxes if array is smaller
        const existingBoxes = boxesContainer.querySelectorAll('[data-program-box], [data-schedule-box]')
        existingBoxes.forEach((box, index) => {
          if (index >= value.length) {
            box.remove()
          }
        })
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

  // Get the wrapper div content (we wrapped bodyContent in a div)
  const wrapper = doc.querySelector('div')
  if (wrapper) {
    return wrapper.innerHTML
  }

  // Fallback: return original HTML if parsing failed
  return originalHTML
}
