import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Resolve __dirname since we are in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Default paths
const TASK_DIR_NAME = process.argv[2] || 'openclaw-tips-optimization'
const COMPOSEY_BASE_DIR = '/home/luismarquitti/.openclaw/workspace/.compozy/tasks'
const taskDir = path.join(COMPOSEY_BASE_DIR, TASK_DIR_NAME)
const API_URL = 'http://localhost:3001/api/pages'

console.log(`Starting Compozy parser for initiative: "${TASK_DIR_NAME}"`)
console.log(`Source directory: ${taskDir}`)

// Helper to extract content under a specific ## heading
function extractSection(content, headingName) {
  const lines = content.split('\n')
  let insideSection = false
  const sectionLines = []

  // Create a regex to match the heading (case insensitive, ignoring formatting)
  const headingRegex = new RegExp(`^##\\s+.*${headingName}.*`, 'i')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (headingRegex.test(line)) {
      insideSection = true
      continue
    }

    if (insideSection) {
      // If we encounter another ## heading, we've exited our target section
      if (/^##\s+/.test(line)) {
        break
      }
      sectionLines.push(line)
    }
  }

  return sectionLines.join('\n').trim()
}

// Helper to extract list items from a section content
function extractListItems(sectionText) {
  if (!sectionText) return []
  return sectionText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- ') || line.startsWith('* '))
    .map(line => line.replace(/^[-*]\s+/, '').trim())
}

// Parser for PRD
function parsePRD(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`PRD file not found at ${filePath}`)
    return {}
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  const overview = extractSection(content, 'Overview')
  const goals = extractListItems(extractSection(content, 'Goals'))
  const userStories = extractListItems(extractSection(content, 'User Stories'))
  const coreFeatures = extractListItems(extractSection(content, 'Core Features'))
  const successMetrics = extractListItems(extractSection(content, 'Success Metrics'))

  return {
    overview,
    goals,
    userStories,
    coreFeatures,
    successMetrics
  }
}

// Parser for Tech Spec
function parseTechSpec(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Tech Spec file not found at ${filePath}`)
    return {}
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  const overview = extractSection(content, 'Executive Summary') || extractSection(content, 'Overview')
  const architecture = extractSection(content, 'System Architecture')
  const dataFlow = extractSection(content, 'Implementation Design') || extractSection(content, 'Data Models')
  
  // Extract key components under "Component Overview"
  const componentOverviewText = extractSection(content, 'Component Overview')
  const components = extractListItems(componentOverviewText)

  return {
    overview,
    architecture,
    components,
    dataFlow
  }
}

// Parser for single ADR
function parseADR(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  
  // Title is the first line starting with #
  const titleLine = lines.find(l => l.startsWith('#')) || ''
  const titleParts = titleLine.replace(/^#\s+/, '').split(':')
  const id = titleParts[0] ? titleParts[0].trim() : path.basename(filePath, '.md').toUpperCase()
  const title = titleParts.slice(1).join(':').trim() || 'Untitled ADR'

  const status = extractSection(content, 'Status')
  const date = extractSection(content, 'Date')
  const context = extractSection(content, 'Context')
  const decision = extractSection(content, 'Decision')
  const consequences = extractSection(content, 'Consequences')

  return {
    id,
    title,
    status,
    date,
    context,
    decision,
    consequences
  }
}

// Parser for single task_XX.md file
function parseTaskFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  // Parse Simple Frontmatter
  const meta = {
    status: 'pending',
    title: 'Untitled Task',
    complexity: 'medium',
    dependencies: []
  }

  let inFrontmatter = false
  const frontmatterLines = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '---') {
      if (!inFrontmatter && frontmatterLines.length === 0) {
        inFrontmatter = true
        continue
      } else {
        inFrontmatter = false
        break
      }
    }
    if (inFrontmatter) {
      frontmatterLines.push(line)
    }
  }

  // Parse frontmatter keys
  for (const line of frontmatterLines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > -1) {
      const key = line.substring(0, colonIdx).trim().toLowerCase()
      const val = line.substring(colonIdx + 1).trim()
      
      if (key === 'status') meta.status = val
      else if (key === 'title') meta.title = val.replace(/^['"]|['"]$/g, '') // remove quotes
      else if (key === 'complexity') meta.complexity = val
      else if (key === 'dependencies') {
        // Parse array like [] or [task_01, task_02]
        const cleanVal = val.replace(/[\[\]]/g, '').trim()
        meta.dependencies = cleanVal ? cleanVal.split(',').map(s => s.trim()) : []
      }
    }
  }

  const filename = path.basename(filePath)
  const idMatch = filename.match(/task_(\d+)/i)
  const taskId = idMatch ? idMatch[1] : filename.replace('.md', '')

  const overview = extractSection(content, 'Overview')

  // Extract checklists: Subtasks
  const subtasksSection = extractSection(content, 'Subtasks')
  const subtasks = subtasksSection.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- [ ]') || line.startsWith('- [x]'))
    .map(line => ({
      text: line.replace(/^-\s+\[[ x]\]\s+/, '').trim(),
      checked: line.startsWith('- [x]')
    }))

  // Extract checklists: Tests
  const testsSection = extractSection(content, 'Tests')
  const tests = testsSection.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- [ ]') || line.startsWith('- [x]'))
    .map(line => ({
      text: line.replace(/^-\s+\[[ x]\]\s+/, '').trim(),
      checked: line.startsWith('- [x]')
    }))

  return {
    id: taskId,
    title: meta.title,
    status: meta.status,
    complexity: meta.complexity,
    dependencies: meta.dependencies,
    overview,
    subtasks,
    tests
  }
}

// Main execution block
async function run() {
  try {
    if (!fs.existsSync(taskDir)) {
      console.error(`Error: Compozy task folder does not exist at "${taskDir}"`)
      process.exit(1)
    }

    const prdPath = path.join(taskDir, '_prd.md')
    const techspecPath = path.join(taskDir, '_techspec.md')
    const adrsDir = path.join(taskDir, 'adrs')

    console.log('Parsing PRD...')
    const prd = parsePRD(prdPath)

    console.log('Parsing TechSpec...')
    const techSpec = parseTechSpec(techspecPath)

    console.log('Parsing ADRs...')
    const adrs = []
    if (fs.existsSync(adrsDir)) {
      const adrFiles = fs.readdirSync(adrsDir)
        .filter(f => f.endsWith('.md'))
        .sort()
      
      for (const file of adrFiles) {
        adrs.push(parseADR(path.join(adrsDir, file)))
      }
    }
    console.log(`Found ${adrs.length} ADRs.`)

    console.log('Parsing tasks...')
    const tasks = []
    const files = fs.readdirSync(taskDir)
      .filter(f => f.startsWith('task_') && f.endsWith('.md'))
      .sort()

    for (const file of files) {
      tasks.push(parseTaskFile(path.join(taskDir, file)))
    }
    console.log(`Found ${tasks.length} tasks.`)

    // Prepare API Page Request Payload
    const payload = {
      template: 'CompozyTasks',
      title: `Workflow: ${prd.overview ? TASK_DIR_NAME.replace(/-/g, ' ').toUpperCase() : 'Compozy Tasks'}`,
      author: 'Compozy',
      tags: ['compozy', TASK_DIR_NAME, 'workflow'],
      data: {
        prd,
        techSpec,
        adrs,
        tasks
      }
    }

    console.log(`Registering page with template "CompozyTasks" via POST to ${API_URL}...`)

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server returned status ${response.status}: ${errorText}`)
    }

    const responseData = await response.json()
    console.log('\n======================================================')
    console.log('🎉 Compozy dashboard page published successfully!')
    console.log(`Page ID: ${responseData.id}`)
    console.log(`Access Link: ${responseData.url}`)
    console.log('======================================================\n')

  } catch (error) {
    console.error('An error occurred during publication:', error.message)
    process.exit(1)
  }
}

run()
