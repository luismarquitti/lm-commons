import React, { useEffect, useState } from 'react'
import './FamilyHub.css'

interface Task {
  title: string
  done: boolean
  priority: string
  assignee: string
  dateInfo: string
}

interface ShoppingItem {
  name: string
  checked: boolean
  department: string
}

interface Meal {
  day: string
  breakfast: string
  lunch: string
  dinner: string
}

interface Account {
  id: number
  name: string
  type: string
  currency: string
  owner: string
  active: number
}

interface Transaction {
  id: number
  account_id: number
  account_name?: string
  title: string
  amount: number
  date: string
  category: string
  subcategory?: string
  notes?: string
  owner?: string
}

interface FinanceData {
  accounts: Account[]
  transactions: Transaction[]
  budgets: any[]
  summary: {
    balance: number
    income: number
    expense: number
    byCategory: Record<string, number>
  }
}

type TabType = 'finance' | 'shopping' | 'tasks' | 'meals'

export default function FamilyHub() {
  const [activeTab, setActiveTab] = useState<TabType>('finance')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data States
  const [tasks, setTasks] = useState<Task[]>([])
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [finance, setFinance] = useState<FinanceData | null>(null)

  // Forms / Input States
  // 1. Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('Média Prioridade')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [newTaskDue, setNewTaskDue] = useState('')

  // 2. Shopping Form
  const [newShopName, setNewShopName] = useState('')
  const [newShopDept, setNewShopDept] = useState('Hortifruti')

  // 3. Meal Form (Inline Edit)
  const [editingMealCell, setEditingMealCell] = useState<{ day: string; type: 'breakfast' | 'lunch' | 'dinner' } | null>(null)
  const [editingMealValue, setEditingMealValue] = useState('')

  // 4. Finance Form
  const [newTxTitle, setNewTxTitle] = useState('')
  const [newTxAmount, setNewTxAmount] = useState('')
  const [newTxCategory, setNewTxCategory] = useState('Alimentação')
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().substring(0, 10))
  const [newTxAccount, setNewTxAccount] = useState('1')
  const [newTxOwner, setNewTxOwner] = useState('family')
  const [newTxNotes, setNewTxNotes] = useState('')

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [tasksRes, shoppingRes, mealsRes, financeRes] = await Promise.all([
        fetch('/api/family/tasks'),
        fetch('/api/family/shopping'),
        fetch('/api/family/meals'),
        fetch('/api/family/finance')
      ])

      if (!tasksRes.ok || !shoppingRes.ok || !mealsRes.ok || !financeRes.ok) {
        throw new Error('Failed to fetch family organization data')
      }

      const tasksData = await tasksRes.json()
      const shoppingData = await shoppingRes.json()
      const mealsData = await mealsRes.json()
      const financeData = await financeRes.json()

      setTasks(tasksData.tasks || [])
      setShoppingItems(shoppingData.items || [])
      setMeals(mealsData.meals || [])
      setFinance(financeData)
    } catch (err: any) {
      console.error('Error fetching Family Hub data:', err)
      setError(err.message || 'Error occurred while connecting to the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Action: Toggle Task
  const handleToggleTask = async (taskTitle: string, currentDone: boolean) => {
    try {
      const res = await fetch('/api/family/tasks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle, done: !currentDone })
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks)
      }
    } catch (err) {
      console.error('Error toggling task:', err)
    }
  }

  // Action: Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    try {
      const res = await fetch('/api/family/tasks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          priority: newTaskPriority,
          assignee: newTaskAssignee,
          due: newTaskDue
        })
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks)
        setNewTaskTitle('')
        setNewTaskAssignee('')
        setNewTaskDue('')
      }
    } catch (err) {
      console.error('Error adding task:', err)
    }
  }

  // Action: Toggle Shopping Item
  const handleToggleShopping = async (itemName: string, currentChecked: boolean) => {
    try {
      const res = await fetch('/api/family/shopping/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: itemName, checked: !currentChecked })
      })
      if (res.ok) {
        const data = await res.json()
        setShoppingItems(data.items)
      }
    } catch (err) {
      console.error('Error toggling shopping item:', err)
    }
  }

  // Action: Add Shopping Item
  const handleAddShoppingItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShopName.trim()) return

    try {
      const res = await fetch('/api/family/shopping/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newShopName, department: newShopDept })
      })
      if (res.ok) {
        const data = await res.json()
        setShoppingItems(data.items)
        setNewShopName('')
      }
    } catch (err) {
      console.error('Error adding shopping item:', err)
    }
  }

  // Action: Edit Meal
  const startEditMeal = (day: string, type: 'breakfast' | 'lunch' | 'dinner', currentVal: string) => {
    setEditingMealCell({ day, type })
    setEditingMealValue(currentVal)
  }

  const handleSaveMeal = async () => {
    if (!editingMealCell) return
    try {
      const res = await fetch('/api/family/meals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: editingMealCell.day,
          mealType: editingMealCell.type,
          value: editingMealValue
        })
      })
      if (res.ok) {
        const data = await res.json()
        setMeals(data.meals)
        setEditingMealCell(null)
      }
    } catch (err) {
      console.error('Error saving meal:', err)
    }
  }

  // Action: Add Transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountVal = parseFloat(newTxAmount)
    if (!newTxTitle.trim() || isNaN(amountVal)) return

    try {
      const res = await fetch('/api/family/finance/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: Number(newTxAccount),
          title: newTxTitle,
          amount: amountVal,
          category: newTxCategory,
          date: newTxDate,
          notes: newTxNotes,
          owner: newTxOwner
        })
      })
      if (res.ok) {
        // Refresh financial details
        const financeRes = await fetch('/api/family/finance')
        if (financeRes.ok) {
          const financeData = await financeRes.json()
          setFinance(financeData)
        }
        // Reset form
        setNewTxTitle('')
        setNewTxAmount('')
        setNewTxNotes('')
      }
    } catch (err) {
      console.error('Error adding transaction:', err)
    }
  }

  // Group shopping items by department
  const shoppingGroups = shoppingItems.reduce((acc, item) => {
    if (!acc[item.department]) {
      acc[item.department] = []
    }
    acc[item.department].push(item)
    return acc
  }, {} as Record<string, ShoppingItem[]>)

  if (loading && !finance) {
    return (
      <div className="family-hub__loading-container">
        <div className="family-hub__spinner"></div>
        <p>Carregando dados da Família...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="family-hub__error-container">
        <span className="family-hub__error-icon">⚠️</span>
        <h2>Erro ao Carregar o Family Hub</h2>
        <p>{error}</p>
        <button onClick={fetchAllData} className="family-hub__btn family-hub__btn--primary">
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="family-hub animate-fade-in">
      <div className="family-hub__header">
        <div>
          <h1 className="family-hub__title">Family Hub</h1>
          <p className="family-hub__subtitle">Gestão Unificada da Casa, Compras e Finanças Familiares</p>
        </div>
        <button onClick={fetchAllData} className="family-hub__refresh-btn" title="Sincronizar dados">
          🔄 Atualizar
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="family-hub__tabs">
        <button
          className={`family-hub__tab-btn ${activeTab === 'finance' ? 'family-hub__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          <span className="family-hub__tab-icon">💰</span> Finanças
        </button>
        <button
          className={`family-hub__tab-btn ${activeTab === 'shopping' ? 'family-hub__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('shopping')}
        >
          <span className="family-hub__tab-icon">🛒</span> Compras
        </button>
        <button
          className={`family-hub__tab-btn ${activeTab === 'tasks' ? 'family-hub__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <span className="family-hub__tab-icon">📋</span> Tarefas da Casa
        </button>
        <button
          className={`family-hub__tab-btn ${activeTab === 'meals' ? 'family-hub__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('meals')}
        >
          <span className="family-hub__tab-icon">🍳</span> Cardápio Semanal
        </button>
      </div>

      {/* Tab Content */}
      <div className="family-hub__content">
        
        {/* ==================== TAB: FINANCE ==================== */}
        {activeTab === 'finance' && finance && (
          <div className="family-hub__finance-tab">
            {/* Summary Cards */}
            <div className="family-hub__summary-cards">
              <div className="family-hub__summary-card family-hub__summary-card--balance">
                <span className="family-hub__card-icon">🏦</span>
                <div className="family-hub__card-info">
                  <span className="family-hub__card-label">Saldo Acumulado</span>
                  <span className={`family-hub__card-value ${finance.summary.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                    R$ {finance.summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="family-hub__summary-card family-hub__summary-card--income">
                <span className="family-hub__card-icon">📈</span>
                <div className="family-hub__card-info">
                  <span className="family-hub__card-label">Entradas (Mês)</span>
                  <span className="family-hub__card-value text-success">
                    + R$ {finance.summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="family-hub__summary-card family-hub__summary-card--expense">
                <span className="family-hub__card-icon">📉</span>
                <div className="family-hub__card-info">
                  <span className="family-hub__card-label">Saídas (Mês)</span>
                  <span className="family-hub__card-value text-danger">
                    - R$ {Math.abs(finance.summary.expense).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Section: Split Layout */}
            <div className="family-hub__finance-layout">
              {/* Transactions list */}
              <div className="family-hub__panel family-hub__finance-list">
                <h2 className="family-hub__panel-title">Últimas Transações</h2>
                <div className="family-hub__table-wrapper">
                  <table className="family-hub__table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Título</th>
                        <th>Categoria</th>
                        <th>Conta</th>
                        <th className="text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finance.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted">Nenhuma transação registrada.</td>
                        </tr>
                      ) : (
                        finance.transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td className="text-muted font-mono">{tx.date}</td>
                            <td>
                              <div className="font-semibold">{tx.title}</div>
                              {tx.notes && <div className="family-hub__table-note">{tx.notes}</div>}
                            </td>
                            <td>
                              <span className="family-hub__category-tag">{tx.category}</span>
                            </td>
                            <td className="text-muted">{tx.account_name || 'Conta'}</td>
                            <td className={`text-right font-semibold ${tx.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                              {tx.amount >= 0 ? '+' : ''} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transaction register form */}
              <div className="family-hub__panel family-hub__finance-form">
                <h2 className="family-hub__panel-title">Registrar Transação</h2>
                <form onSubmit={handleAddTransaction} className="family-hub__form">
                  <div className="family-hub__form-group">
                    <label>Descrição</label>
                    <input
                      type="text"
                      placeholder="Ex: Aluguel, Supermercado"
                      value={newTxTitle}
                      onChange={(e) => setNewTxTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="family-hub__form-row">
                    <div className="family-hub__form-group">
                      <label>Valor (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: -150.00 (despesa)"
                        value={amountValueStr(newTxAmount)}
                        onChange={(e) => setNewTxAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="family-hub__form-group">
                      <label>Data</label>
                      <input
                        type="date"
                        value={newTxDate}
                        onChange={(e) => setNewTxDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="family-hub__form-row">
                    <div className="family-hub__form-group">
                      <label>Categoria</label>
                      <select value={newTxCategory} onChange={(e) => setNewTxCategory(e.target.value)}>
                        <option value="Receitas">Receitas / Ganhos</option>
                        <option value="Alimentação">Alimentação / Mercado</option>
                        <option value="Habitação">Habitação / Contas</option>
                        <option value="Lazer">Lazer / Viagens</option>
                        <option value="Saúde">Saúde / Farmácia</option>
                        <option value="Transporte">Transporte / Combustível</option>
                        <option value="Educação">Educação</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div className="family-hub__form-group">
                      <label>Conta</label>
                      <select value={newTxAccount} onChange={(e) => setNewTxAccount(e.target.value)}>
                        {finance.accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="family-hub__form-row">
                    <div className="family-hub__form-group">
                      <label>Responsável</label>
                      <select value={newTxOwner} onChange={(e) => setNewTxOwner(e.target.value)}>
                        <option value="family">Família (Geral)</option>
                        <option value="luis">Luís</option>
                        <option value="eluma">Eluma</option>
                      </select>
                    </div>
                  </div>

                  <div className="family-hub__form-group">
                    <label>Observações</label>
                    <textarea
                      placeholder="Detalhes adicionais (opcional)"
                      value={newTxNotes}
                      onChange={(e) => setNewTxNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <button type="submit" className="family-hub__btn family-hub__btn--primary">
                    Salvar Transação
                  </button>
                </form>

                {/* Categories Chart fallback / budget review */}
                {Object.keys(finance.summary.byCategory).length > 0 && (
                  <div className="family-hub__budgets-section">
                    <h3 className="family-hub__section-subtitle">Gastos por Categoria</h3>
                    <div className="family-hub__categories-progress">
                      {Object.entries(finance.summary.byCategory).map(([cat, amount]) => (
                        <div key={cat} className="family-hub__category-progress-item">
                          <div className="family-hub__category-progress-header">
                            <span>{cat}</span>
                            <span className="font-semibold">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="family-hub__progress-bar">
                            <div 
                              className="family-hub__progress-fill" 
                              style={{ width: `${Math.min(100, (amount / (finance.summary.income || 10000)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: SHOPPING ==================== */}
        {activeTab === 'shopping' && (
          <div className="family-hub__shopping-tab">
            <div className="family-hub__shopping-layout">
              {/* Shopping items by department */}
              <div className="family-hub__panel family-hub__shopping-list-panel">
                <h2 className="family-hub__panel-title">Lista de Compras Ativa</h2>
                
                {Object.keys(shoppingGroups).length === 0 ? (
                  <p className="text-center text-muted pad-lg">Sua lista de compras está vazia.</p>
                ) : (
                  <div className="family-hub__shopping-grid">
                    {Object.entries(shoppingGroups).map(([dept, items]) => (
                      <div key={dept} className="family-hub__dept-card">
                        <h3 className="family-hub__dept-title">{dept}</h3>
                        <ul className="family-hub__shopping-items">
                          {items.map((item) => (
                            <li key={item.name} className="family-hub__shopping-item">
                              <label className="family-hub__checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  onChange={() => handleToggleShopping(item.name, item.checked)}
                                />
                                <span className={`family-hub__checkbox-text ${item.checked ? 'family-hub__checkbox-text--checked' : ''}`}>
                                  {item.name}
                                </span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add item form */}
              <div className="family-hub__panel family-hub__shopping-add-panel">
                <h2 className="family-hub__panel-title">Adicionar à Lista</h2>
                <form onSubmit={handleAddShoppingItem} className="family-hub__form">
                  <div className="family-hub__form-group">
                    <label>Item</label>
                    <input
                      type="text"
                      placeholder="Ex: Tomate cereja, Papel higiênico"
                      value={newShopName}
                      onChange={(e) => setNewShopName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="family-hub__form-group">
                    <label>Seção/Departamento</label>
                    <select value={newShopDept} onChange={(e) => setNewShopDept(e.target.value)}>
                      <option value="Hortifruti">Hortifruti</option>
                      <option value="Laticínios">Laticínios</option>
                      <option value="Açougue">Açougue</option>
                      <option value="Padaria">Padaria</option>
                      <option value="Limpeza e Outros">Limpeza e Higiene</option>
                      <option value="Mercearia">Mercearia / Despensa</option>
                      <option value="Bebidas">Bebidas</option>
                    </select>
                  </div>
                  <button type="submit" className="family-hub__btn family-hub__btn--primary">
                    Adicionar Item
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: TASKS ==================== */}
        {activeTab === 'tasks' && (
          <div className="family-hub__tasks-tab">
            <div className="family-hub__tasks-layout">
              {/* Tasks list panel */}
              <div className="family-hub__panel family-hub__tasks-list-panel">
                <h2 className="family-hub__panel-title">Tarefas Domésticas Pendentes</h2>
                
                <div className="family-hub__tasks-priorities">
                  {/* High priority */}
                  <div className="family-hub__task-priority-section">
                    <h3 className="family-hub__task-priority-title family-hub__task-priority-title--high">⚠️ Alta Prioridade</h3>
                    {tasks.filter(t => t.priority === 'Alta Prioridade').length === 0 ? (
                      <p className="text-muted font-sm italic">Nenhuma tarefa.</p>
                    ) : (
                      <ul className="family-hub__tasks-list">
                        {tasks.filter(t => t.priority === 'Alta Prioridade').map(task => (
                          <li key={task.title} className="family-hub__task-item">
                            <label className="family-hub__checkbox-label">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleToggleTask(task.title, task.done)}
                              />
                              <div className="family-hub__task-body">
                                <span className={`family-hub__checkbox-text ${task.done ? 'family-hub__checkbox-text--checked' : ''}`}>
                                  {task.title}
                                </span>
                                <div className="family-hub__task-meta">
                                  {task.assignee && <span className="family-hub__task-assignee">👤 {task.assignee}</span>}
                                  {task.dateInfo && <span className="family-hub__task-date">📅 {task.dateInfo}</span>}
                                </div>
                              </div>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Medium priority */}
                  <div className="family-hub__task-priority-section">
                    <h3 className="family-hub__task-priority-title family-hub__task-priority-title--medium">📋 Média Prioridade</h3>
                    {tasks.filter(t => t.priority === 'Média Prioridade').length === 0 ? (
                      <p className="text-muted font-sm italic">Nenhuma tarefa.</p>
                    ) : (
                      <ul className="family-hub__tasks-list">
                        {tasks.filter(t => t.priority === 'Média Prioridade').map(task => (
                          <li key={task.title} className="family-hub__task-item">
                            <label className="family-hub__checkbox-label">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleToggleTask(task.title, task.done)}
                              />
                              <div className="family-hub__task-body">
                                <span className={`family-hub__checkbox-text ${task.done ? 'family-hub__checkbox-text--checked' : ''}`}>
                                  {task.title}
                                </span>
                                <div className="family-hub__task-meta">
                                  {task.assignee && <span className="family-hub__task-assignee">👤 {task.assignee}</span>}
                                  {task.dateInfo && <span className="family-hub__task-date">📅 {task.dateInfo}</span>}
                                </div>
                              </div>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Recently Completed */}
                  <div className="family-hub__task-priority-section">
                    <h3 className="family-hub__task-priority-title family-hub__task-priority-title--completed">✓ Concluídas Recentes</h3>
                    {tasks.filter(t => t.priority === 'Concluídas (recentes)').length === 0 ? (
                      <p className="text-muted font-sm italic">Nenhuma tarefa concluída.</p>
                    ) : (
                      <ul className="family-hub__tasks-list">
                        {tasks.filter(t => t.priority === 'Concluídas (recentes)').map(task => (
                          <li key={task.title} className="family-hub__task-item family-hub__task-item--done">
                            <label className="family-hub__checkbox-label">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleToggleTask(task.title, task.done)}
                              />
                              <div className="family-hub__task-body">
                                <span className="family-hub__checkbox-text family-hub__checkbox-text--checked">
                                  {task.title}
                                </span>
                                <div className="family-hub__task-meta">
                                  {task.assignee && <span className="family-hub__task-assignee">👤 {task.assignee}</span>}
                                  {task.dateInfo && <span className="family-hub__task-date">📅 {task.dateInfo}</span>}
                                </div>
                              </div>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Add task form */}
              <div className="family-hub__panel family-hub__tasks-add-panel">
                <h2 className="family-hub__panel-title">Criar Tarefa</h2>
                <form onSubmit={handleAddTask} className="family-hub__form">
                  <div className="family-hub__form-group">
                    <label>Título da Tarefa</label>
                    <input
                      type="text"
                      placeholder="Ex: Lavar garagem, Pagar internet"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="family-hub__form-group">
                    <label>Prioridade</label>
                    <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}>
                      <option value="Alta Prioridade">Alta Prioridade</option>
                      <option value="Média Prioridade">Média Prioridade</option>
                    </select>
                  </div>
                  <div className="family-hub__form-group">
                    <label>Responsável</label>
                    <input
                      type="text"
                      placeholder="Luis, Eluma, Geral"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                    />
                  </div>
                  <div className="family-hub__form-group">
                    <label>Data de Vencimento</label>
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="family-hub__btn family-hub__btn--primary">
                    Adicionar Tarefa
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: MEALS ==================== */}
        {activeTab === 'meals' && (
          <div className="family-hub__meals-tab">
            <div className="family-hub__panel family-hub__meals-panel">
              <h2 className="family-hub__panel-title">Cardápio da Semana</h2>
              <p className="family-hub__panel-description">Clique em qualquer refeição para editá-la e mantenha o cardápio atualizado.</p>

              <div className="family-hub__table-wrapper">
                <table className="family-hub__meals-table">
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>Dia</th>
                      <th style={{ width: '28%' }}>Café da Manhã</th>
                      <th style={{ width: '28%' }}>Almoço</th>
                      <th style={{ width: '28%' }}>Jantar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meals.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-muted">Nenhum cardápio cadastrado.</td>
                      </tr>
                    ) : (
                      meals.map((meal) => (
                        <tr key={meal.day}>
                          <td className="family-hub__meals-day">{meal.day}</td>
                          
                          {/* Breakfast */}
                          <td className="family-hub__meals-cell">
                            {editingMealCell?.day === meal.day && editingMealCell?.type === 'breakfast' ? (
                              <div className="family-hub__inline-edit">
                                <input
                                  type="text"
                                  value={editingMealValue}
                                  onChange={(e) => setEditingMealValue(e.target.value)}
                                  autoFocus
                                />
                                <div className="family-hub__inline-actions">
                                  <button onClick={handleSaveMeal} className="family-hub__inline-btn family-hub__inline-btn--save">✓</button>
                                  <button onClick={() => setEditingMealCell(null)} className="family-hub__inline-btn family-hub__inline-btn--cancel">✕</button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="family-hub__meals-cell-content"
                                onClick={() => startEditMeal(meal.day, 'breakfast', meal.breakfast)}
                              >
                                {meal.breakfast || <span className="text-muted italic">Vazio</span>}
                                <span className="family-hub__edit-icon">✏️</span>
                              </div>
                            )}
                          </td>

                          {/* Lunch */}
                          <td className="family-hub__meals-cell">
                            {editingMealCell?.day === meal.day && editingMealCell?.type === 'lunch' ? (
                              <div className="family-hub__inline-edit">
                                <input
                                  type="text"
                                  value={editingMealValue}
                                  onChange={(e) => setEditingMealValue(e.target.value)}
                                  autoFocus
                                />
                                <div className="family-hub__inline-actions">
                                  <button onClick={handleSaveMeal} className="family-hub__inline-btn family-hub__inline-btn--save">✓</button>
                                  <button onClick={() => setEditingMealCell(null)} className="family-hub__inline-btn family-hub__inline-btn--cancel">✕</button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="family-hub__meals-cell-content"
                                onClick={() => startEditMeal(meal.day, 'lunch', meal.lunch)}
                              >
                                {meal.lunch || <span className="text-muted italic">Vazio</span>}
                                <span className="family-hub__edit-icon">✏️</span>
                              </div>
                            )}
                          </td>

                          {/* Dinner */}
                          <td className="family-hub__meals-cell">
                            {editingMealCell?.day === meal.day && editingMealCell?.type === 'dinner' ? (
                              <div className="family-hub__inline-edit">
                                <input
                                  type="text"
                                  value={editingMealValue}
                                  onChange={(e) => setEditingMealValue(e.target.value)}
                                  autoFocus
                                />
                                <div className="family-hub__inline-actions">
                                  <button onClick={handleSaveMeal} className="family-hub__inline-btn family-hub__inline-btn--save">✓</button>
                                  <button onClick={() => setEditingMealCell(null)} className="family-hub__inline-btn family-hub__inline-btn--cancel">✕</button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="family-hub__meals-cell-content"
                                onClick={() => startEditMeal(meal.day, 'dinner', meal.dinner)}
                              >
                                {meal.dinner || <span className="text-muted italic">Vazio</span>}
                                <span className="family-hub__edit-icon">✏️</span>
                              </div>
                            )}
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function amountValueStr(val: string): string {
  return val
}
