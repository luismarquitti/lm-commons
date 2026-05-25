import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

const router = Router()

const DATA_DIR = '/home/luismarquitti/Code/familia-hub/data'
const DB_PATH = path.join(DATA_DIR, 'db/familia.db')

// Helpers to ensure folder structures exist
function ensureDirectories() {
  const dirs = [
    path.join(DATA_DIR, 'tarefas'),
    path.join(DATA_DIR, 'compras'),
    path.join(DATA_DIR, 'refeicoes'),
    path.join(DATA_DIR, 'db')
  ]
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}

// Database instance manager
let dbInstance: Database.Database | null = null

function getDb(): Database.Database {
  ensureDirectories()
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH)
    dbInstance.pragma('journal_mode = WAL')
    
    // Initialize schema
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS account (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        currency TEXT DEFAULT 'BRL',
        owner TEXT,
        active INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS "transaction" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        installments INTEGER DEFAULT 1,
        installment_no INTEGER DEFAULT 1,
        recurring INTEGER DEFAULT 0,
        notes TEXT,
        owner TEXT,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS budget (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        month TEXT NOT NULL,
        amount REAL NOT NULL,
        owner TEXT
      );
      CREATE TABLE IF NOT EXISTS exercise_session (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT NOT NULL,
        type TEXT NOT NULL,
        scheduled_at TEXT,
        done_at TEXT,
        duration_min INTEGER,
        skipped INTEGER DEFAULT 0,
        skip_reason TEXT,
        notes TEXT,
        created_at TEXT NOT NULL
      );
    `)

    // Seed default accounts if empty
    const accountsCount = dbInstance.prepare("SELECT count(*) as count FROM account").get() as any
    if (accountsCount.count === 0) {
      dbInstance.prepare("INSERT INTO account (name, type, currency, owner, active) VALUES (?, ?, ?, ?, ?)").run("Conta Corrente Itaú", "corrente", "BRL", "family", 1)
      dbInstance.prepare("INSERT INTO account (name, type, currency, owner, active) VALUES (?, ?, ?, ?, ?)").run("Mercado Pago", "corrente", "BRL", "family", 1)
      dbInstance.prepare("INSERT INTO account (name, type, currency, owner, active) VALUES (?, ?, ?, ?, ?)").run("Itaú Visa Click", "cartao", "BRL", "family", 1)
      dbInstance.prepare("INSERT INTO account (name, type, currency, owner, active) VALUES (?, ?, ?, ?, ?)").run("Itaú Sam’s Club", "cartao", "BRL", "family", 1)
      dbInstance.prepare("INSERT INTO account (name, type, currency, owner, active) VALUES (?, ?, ?, ?, ?)").run("Porto Seguro", "cartao", "BRL", "family", 1)
      dbInstance.prepare("INSERT INTO account (name, type, currency, owner, active) VALUES (?, ?, ?, ?, ?)").run("Itaú Magalu", "cartao", "BRL", "family", 1)
      dbInstance.prepare("INSERT INTO account (name, type, currency, owner, active) VALUES (?, ?, ?, ?, ?)").run("Reserva de Emergência", "poupanca", "BRL", "family", 1)
    }

    // Seed some mock transactions to make it alive initially if empty
    const txCount = dbInstance.prepare("SELECT count(*) as count FROM \"transaction\"").get() as any
    if (txCount.count === 0) {
      const nowStr = new Date().toISOString()
      const currentMonth = nowStr.substring(0, 7) // YYYY-MM
      dbInstance.prepare(`
        INSERT INTO "transaction" (account_id, title, amount, date, category, subcategory, installments, installment_no, recurring, notes, owner, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(1, "Salário Wipro", 12000.0, `${currentMonth}-05`, "Receitas", "Trabalho", 1, 1, 1, "Salário mensal Luis", "luis", nowStr)
      
      dbInstance.prepare(`
        INSERT INTO "transaction" (account_id, title, amount, date, category, subcategory, installments, installment_no, recurring, notes, owner, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(1, "CPFL Apartamento", -124.50, `${currentMonth}-15`, "Habitação", "Energia", 1, 1, 0, "Conta de luz agosto", "family", nowStr)

      dbInstance.prepare(`
        INSERT INTO "transaction" (account_id, title, amount, date, category, subcategory, installments, installment_no, recurring, notes, owner, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(1, "CPFL Casa São José", -189.20, `${currentMonth}-15`, "Habitação", "Energia", 1, 1, 0, "Conta de luz agosto Casa SJ", "family", nowStr)
      
      dbInstance.prepare(`
        INSERT INTO "transaction" (account_id, title, amount, date, category, subcategory, installments, installment_no, recurring, notes, owner, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(3, "Supermercado Pão de Açúcar", -342.10, `${currentMonth}-18`, "Alimentação", "Mercado", 1, 1, 0, "Compras semana", "family", nowStr)
      
      dbInstance.prepare(`
        INSERT INTO "transaction" (account_id, title, amount, date, category, subcategory, installments, installment_no, recurring, notes, owner, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(2, "Uber Escola Lúcia", -32.50, `${currentMonth}-20`, "Transporte", "Uber", 1, 1, 0, "Buscar Lúcia na escola", "family", nowStr)
    }
  }
  return dbInstance
}

// Markdown Initialization Defaults
const TASKS_PATH = path.join(DATA_DIR, 'tarefas/pendentes.md')
const SHOPPING_PATH = path.join(DATA_DIR, 'compras/lista-ativa.md')
const MEALS_PATH = path.join(DATA_DIR, 'refeicoes/cardapio-semanal.md')

function initMarkdownFiles() {
  ensureDirectories()
  if (!fs.existsSync(TASKS_PATH)) {
    fs.writeFileSync(TASKS_PATH, `---
module: tarefas
updated_at: ${new Date().toISOString()}
---

## Alta Prioridade

- [ ] Alterar Titularidade CPFL SJ — Luis | due:2026-05-30
- [ ] Devolução Equipamentos Vivo SJ — Luis | due:2026-05-30
- [ ] Torneira banheiro Social — Luis

## Média Prioridade

- [ ] Documentos Enviar Cláudia — Eluma
- [ ] Processo Divórcio José e Lúcia - Mococa | family
- [ ] Finanças | family

## Concluídas (recentes)

- [x] Trocar filtro do ar condicionado — Luis | done:2026-05-22
`, 'utf8')
  }

  if (!fs.existsSync(SHOPPING_PATH)) {
    fs.writeFileSync(SHOPPING_PATH, `---
module: compras
list_id: lista-ativa
store: mercado
status: open
created_by: eluma
updated_at: ${new Date().toISOString()}
---

## Hortifruti
- [ ] Laranja Lima
- [ ] Kiwi
- [ ] Mamão
- [ ] Caqui
- [ ] Tangerina Ponkan / Cravo
- [ ] Folhas para Salada
- [ ] Banana

## Carnes
- [ ] Frango

## Laticínios
- [ ] Frios

## Outros
- [ ] Atum em lata
- [ ] Tapioca (Goma)
- [ ] Pão
- [ ] Ovos
`, 'utf8')
  }

  if (!fs.existsSync(MEALS_PATH)) {
    fs.writeFileSync(MEALS_PATH, `---
module: refeicoes
week_start: 2026-05-25
---

| Dia | Café | Almoço | Jantar |
|---|---|---|---|
| Segunda | Ovos, Pão, Panquecas, Tapioca ou Crepioca | Marmitas da semana | Lanche leve / Marmitas Lucia Helena |
| Terça | Ovos, Pão, Panquecas, Tapioca ou Crepioca | Marmitas da semana | Lanche leve / Marmitas Lucia Helena |
| Quarta | Ovos, Pão, Panquecas, Tapioca ou Crepioca | Marmitas da semana | Lanche leve / Marmitas Lucia Helena |
| Quinta | Ovos, Pão, Panquecas, Tapioca ou Crepioca | Marmitas da semana | Lanche leve / Marmitas Lucia Helena |
| Sexta | Ovos, Pão, Panquecas, Tapioca ou Crepioca | Marmitas da semana | Lanche leve / Marmitas Lucia Helena |
| Sábado | Ovos, Pão, Panquecas, Tapioca ou Crepioca | Churrasco / Fora | Sobras / Lanche leve |
| Domingo | Ovos, Pão, Panquecas, Tapioca ou Crepioca | Macarronada em família | Sopa leve / Lanche leve |
`, 'utf8')
  }
}

// Tasks Markdown Parsers & Writers
function parseTasks(filePath: string) {
  initMarkdownFiles()
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  let currentPriority = 'Média Prioridade'
  const tasks: any[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('##')) {
      currentPriority = trimmed.replace('##', '').trim()
      continue
    }
    const match = trimmed.match(/^-\s+\[([ xX])\]\s+(.+)$/)
    if (match) {
      const done = match[1].toLowerCase() === 'x'
      const text = match[2]
      
      let title = text
      let assignee = ''
      let dateInfo = ''
      
      const assigneeParts = text.split('—')
      if (assigneeParts.length > 1) {
        title = assigneeParts[0].trim()
        const detailsPart = assigneeParts[1].trim()
        const dateParts = detailsPart.split('|')
        assignee = dateParts[0].trim()
        if (dateParts.length > 1) {
          dateInfo = dateParts[1].trim()
        }
      } else {
        const dateParts = text.split('|')
        if (dateParts.length > 1) {
          title = dateParts[0].trim()
          dateInfo = dateParts[1].trim()
        }
      }
      
      tasks.push({
        rawText: trimmed,
        title,
        done,
        priority: currentPriority,
        assignee,
        dateInfo
      })
    }
  }
  return tasks
}

function saveTasks(filePath: string, tasks: any[]) {
  const priorities = ['Alta Prioridade', 'Média Prioridade', 'Concluídas (recentes)']
  let md = `---\nmodule: tarefas\nupdated_at: ${new Date().toISOString()}\n---\n\n`
  
  for (const p of priorities) {
    md += `## ${p}\n\n`
    const filtered = tasks.filter(t => t.priority === p)
    for (const t of filtered) {
      const status = t.done ? 'x' : ' '
      let text = t.title
      if (t.assignee) {
        text += ` — ${t.assignee}`
      }
      if (t.dateInfo) {
        text += ` | ${t.dateInfo}`
      }
      md += `- [${status}] ${text}\n`
    }
    md += `\n`
  }
  fs.writeFileSync(filePath, md.trim() + '\n', 'utf8')
}

// Shopping Markdown Parsers & Writers
function parseShopping(filePath: string) {
  initMarkdownFiles()
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  let currentDept = 'Outros'
  const items: any[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('##')) {
      currentDept = trimmed.replace('##', '').trim()
      continue
    }
    const match = trimmed.match(/^-\s+\[([ xX])\]\s+(.+)$/)
    if (match) {
      const checked = match[1].toLowerCase() === 'x'
      const name = match[2].trim()
      items.push({
        name,
        checked,
        department: currentDept
      })
    }
  }
  return items
}

function saveShopping(filePath: string, items: any[]) {
  const depts = Array.from(new Set(items.map(i => i.department)))
  if (depts.length === 0) depts.push('Geral')
  
  let md = `---\nmodule: compras\nlist_id: lista-ativa\nstore: mercado\nstatus: open\ncreated_by: system\nupdated_at: ${new Date().toISOString()}\n---\n\n`
  
  for (const dept of depts) {
    md += `## ${dept}\n`
    const deptItems = items.filter(i => i.department === dept)
    for (const item of deptItems) {
      const status = item.checked ? 'x' : ' '
      md += `- [${status}] ${item.name}\n`
    }
    md += `\n`
  }
  fs.writeFileSync(filePath, md.trim() + '\n', 'utf8')
}

// Meals Markdown Parsers & Writers
function parseMeals(filePath: string) {
  initMarkdownFiles()
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const meals: any[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('|') && !trimmed.includes('Dia') && !trimmed.includes('---')) {
      const parts = trimmed.split('|').map(p => p.trim())
      if (parts.length >= 5) {
        meals.push({
          day: parts[1],
          breakfast: parts[2],
          lunch: parts[3],
          dinner: parts[4]
        })
      }
    }
  }
  return meals
}

function saveMeals(filePath: string, meals: any[]) {
  let md = `---\nmodule: refeicoes\nweek_start: ${new Date().toISOString().split('T')[0]}\n---\n\n`
  md += `| Dia | Café | Almoço | Jantar |\n`
  md += `|---|---|---|---|\n`
  for (const m of meals) {
    md += `| ${m.day} | ${m.breakfast} | ${m.lunch} | ${m.dinner} |\n`
  }
  fs.writeFileSync(filePath, md, 'utf8')
}

// ======================== API ROUTE HANDLERS ========================

// ── TASKS ENDPOINTS ──────────────────
router.get('/family/tasks', (req, res) => {
  try {
    const tasks = parseTasks(TASKS_PATH)
    res.json({ tasks })
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks', details: String(error) })
  }
})

router.post('/family/tasks/toggle', (req, res) => {
  try {
    const { title, done } = req.body
    if (!title) {
      return res.status(400).json({ error: 'Missing title parameter' })
    }
    const tasks = parseTasks(TASKS_PATH)
    const taskIndex = tasks.findIndex(t => t.title.toLowerCase() === title.toLowerCase())
    if (taskIndex !== -1) {
      tasks[taskIndex].done = done
      // Move task to Concluídas if done, or restore to Média if unchecked
      if (done) {
        tasks[taskIndex].priority = 'Concluídas (recentes)'
      } else {
        tasks[taskIndex].priority = 'Média Prioridade'
      }
      saveTasks(TASKS_PATH, tasks)
      res.json({ success: true, tasks })
    } else {
      res.status(404).json({ error: 'Task not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task', details: String(error) })
  }
})

router.post('/family/tasks/add', (req, res) => {
  try {
    const { title, priority, assignee, due } = req.body
    if (!title) {
      return res.status(400).json({ error: 'Missing title' })
    }
    const tasks = parseTasks(TASKS_PATH)
    
    // Construct date suffix if provided
    let dateInfo = ''
    if (due) {
      dateInfo = `due:${due}`
    }

    tasks.push({
      title,
      done: false,
      priority: priority || 'Média Prioridade',
      assignee: assignee || '',
      dateInfo
    })
    
    saveTasks(TASKS_PATH, tasks)
    res.json({ success: true, tasks })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add task', details: String(error) })
  }
})

// ── SHOPPING LIST ENDPOINTS ──────────
router.get('/family/shopping', (req, res) => {
  try {
    const items = parseShopping(SHOPPING_PATH)
    res.json({ items })
  } catch (error) {
    res.status(500).json({ error: 'Failed to read shopping list', details: String(error) })
  }
})

router.post('/family/shopping/toggle', (req, res) => {
  try {
    const { name, checked } = req.body
    if (!name) {
      return res.status(400).json({ error: 'Missing item name' })
    }
    const items = parseShopping(SHOPPING_PATH)
    const idx = items.findIndex(i => i.name.toLowerCase() === name.toLowerCase())
    if (idx !== -1) {
      items[idx].checked = checked
      saveShopping(SHOPPING_PATH, items)
      res.json({ success: true, items })
    } else {
      res.status(404).json({ error: 'Shopping item not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle item', details: String(error) })
  }
})

router.post('/family/shopping/add', (req, res) => {
  try {
    const { name, department } = req.body
    if (!name) {
      return res.status(400).json({ error: 'Missing item name' })
    }
    const items = parseShopping(SHOPPING_PATH)
    items.push({
      name,
      checked: false,
      department: department || 'Geral'
    })
    saveShopping(SHOPPING_PATH, items)
    res.json({ success: true, items })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item', details: String(error) })
  }
})

// ── MEALS PLAN ENDPOINTS ─────────────
router.get('/family/meals', (req, res) => {
  try {
    const meals = parseMeals(MEALS_PATH)
    res.json({ meals })
  } catch (error) {
    res.status(500).json({ error: 'Failed to read meals plan', details: String(error) })
  }
})

router.post('/family/meals/update', (req, res) => {
  try {
    const { day, mealType, value } = req.body
    if (!day || !mealType) {
      return res.status(400).json({ error: 'Missing day or mealType' })
    }
    const meals = parseMeals(MEALS_PATH)
    const idx = meals.findIndex(m => m.day.toLowerCase() === day.toLowerCase())
    if (idx !== -1) {
      if (mealType === 'breakfast') meals[idx].breakfast = value
      else if (mealType === 'lunch') meals[idx].lunch = value
      else if (mealType === 'dinner') meals[idx].dinner = value
      
      saveMeals(MEALS_PATH, meals)
      res.json({ success: true, meals })
    } else {
      res.status(404).json({ error: 'Day not found in meal plan' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update meals plan', details: String(error) })
  }
})

// ── FINANCE ENDPOINTS ────────────────
router.get('/family/finance', (req, res) => {
  try {
    const database = getDb()
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
    const filterMonth = `${currentMonth}%`

    // Get accounts
    const accounts = database.prepare("SELECT * FROM account WHERE active = 1").all()

    // Get budgets
    const budgets = database.prepare("SELECT * FROM budget").all()

    // Get recent transactions (last 20)
    const transactions = database.prepare(`
      SELECT t.*, a.name as account_name 
      FROM "transaction" t
      JOIN account a ON t.account_id = a.id
      ORDER BY date DESC, id DESC 
      LIMIT 20
    `).all()

    // Calculations for monthly summaries
    const balanceRow = database.prepare('SELECT SUM(amount) as total FROM "transaction"').get() as any
    const monthlyIncomeRow = database.prepare('SELECT SUM(amount) as total FROM "transaction" WHERE amount > 0 AND date LIKE ?').get(filterMonth) as any
    const monthlyExpenseRow = database.prepare('SELECT SUM(amount) as total FROM "transaction" WHERE amount < 0 AND date LIKE ?').get(filterMonth) as any

    const balance = balanceRow?.total || 0.0
    const income = monthlyIncomeRow?.total || 0.0
    const expense = monthlyExpenseRow?.total || 0.0

    // Expenses by category
    const byCategoryRows = database.prepare(`
      SELECT category, ABS(SUM(amount)) as total 
      FROM "transaction" 
      WHERE amount < 0 AND date LIKE ?
      GROUP BY category
    `).all(filterMonth) as any[]

    const byCategory: Record<string, number> = {}
    for (const row of byCategoryRows) {
      byCategory[row.category] = row.total
    }

    res.json({
      accounts,
      transactions,
      budgets,
      summary: {
        balance,
        income,
        expense,
        byCategory
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial data', details: String(error) })
  }
})

router.post('/family/finance/transaction', (req, res) => {
  try {
    const { accountId, title, amount, category, date, subcategory, notes, owner } = req.body
    if (!accountId || !title || amount === undefined || !category || !date) {
      return res.status(400).json({ error: 'Missing required transaction fields' })
    }

    const database = getDb()
    const nowStr = new Date().toISOString()

    const stmt = database.prepare(`
      INSERT INTO "transaction" (account_id, title, amount, date, category, subcategory, installments, installment_no, recurring, notes, owner, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, 1, 0, ?, ?, ?)
    `)

    const result = stmt.run(
      Number(accountId),
      title,
      Number(amount),
      date,
      category,
      subcategory || null,
      notes || null,
      owner || 'family',
      nowStr
    )

    res.status(201).json({ success: true, transactionId: result.lastInsertRowid })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction', details: String(error) })
  }
})

export default router
