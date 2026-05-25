import { Router } from 'express'
import { exec } from 'child_process'
import fs from 'fs'

const router = Router()

const IPS = [
  '192.168.3.1',
  '192.168.3.250',
  '192.168.3.10',
  '192.168.3.50',
  '192.168.3.22',
  '192.168.3.5',
  '192.168.3.6',
  '192.168.3.7',
  '192.168.3.20'
]

let cachedStatuses: Record<string, 'online' | 'offline'> = {}
let cachedIotDevices: any = null
let lastUpdated = 0
let activeScanPromise: Promise<Record<string, 'online' | 'offline'>> | null = null

let haConfig: { endpoint: string, token: string } | null = null

function loadHaConfig() {
  if (haConfig) return haConfig
  try {
    const secretsPath = '/home/luismarquitti/.openclaw/workspace/.home_assistant_secrets'
    if (fs.existsSync(secretsPath)) {
      const content = fs.readFileSync(secretsPath, 'utf-8')
      const lines = content.split('\n')
      let endpoint = ''
      let token = ''
      for (const line of lines) {
        if (line.startsWith('ENDPOINT=')) {
          endpoint = line.substring('ENDPOINT='.length).replace(/['"]/g, '').trim()
        }
        if (line.startsWith('ACCESS_TOKEN=')) {
          token = line.substring('ACCESS_TOKEN='.length).replace(/['"]/g, '').trim()
        }
      }
      if (endpoint && token) {
        haConfig = { endpoint, token }
      }
    }
  } catch (err) {
    console.error('Failed to load HA secrets:', err)
  }
  return haConfig
}

async function fetchHaIotDevices() {
  const config = loadHaConfig()
  if (!config) return null

  const entityIds = [
    'light.abajur_sala_tv',
    'light.led_tv_sala',
    'sensor.central_suite_temperature',
    'sensor.central_suite_humidity',
    'light.abajur_suite',
    'light.lamp_abajur_escritorio',
    'switch.monitores_escritorio_sonoff_1000456012',
    'switch.lampada_pia_cozinha_sonoff_10004504c8',
    'light.abajur_lh'
  ]

  const iotDevices: Record<string, { state: string, friendly_name: string }> = {}

  try {
    const url = `${config.endpoint}/api/states`
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      }
    })
    if (res.ok) {
      const states = await res.json() as any[]
      for (const entityId of entityIds) {
        const item = states.find(s => s.entity_id === entityId)
        if (item) {
          iotDevices[entityId] = {
            state: item.state,
            friendly_name: item.attributes.friendly_name || entityId
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch HA states for homelab status:', err)
  }

  return Object.keys(iotDevices).length > 0 ? iotDevices : null
}


function pingIp(ip: string): Promise<'online' | 'offline'> {
  return new Promise((resolve) => {
    exec(`ping -c 1 -W 1 ${ip}`, (error) => {
      resolve(error ? 'offline' : 'online')
    })
  })
}

function runStatusScan(): Promise<Record<string, 'online' | 'offline'>> {
  if (activeScanPromise) {
    return activeScanPromise
  }

  activeScanPromise = Promise.all(
    IPS.map(async (ip) => {
      const status = await pingIp(ip)
      return { ip, status }
    })
  ).then((results) => {
    const statuses: Record<string, 'online' | 'offline'> = {}
    for (const r of results) {
      statuses[r.ip] = r.status
    }
    cachedStatuses = statuses
    lastUpdated = Date.now()
    activeScanPromise = null
    return statuses
  }).catch((err) => {
    activeScanPromise = null
    throw err
  })

  return activeScanPromise
}

router.get('/homelab/status', async (req, res) => {
  try {
    const now = Date.now()
    if (now - lastUpdated < 10000 && Object.keys(cachedStatuses).length > 0) {
      return res.json({
        statuses: cachedStatuses,
        lastUpdated: new Date(lastUpdated).toISOString(),
        cached: true,
        iotDevices: cachedIotDevices
      })
    }

    const statuses = await runStatusScan()
    const iotDevices = await fetchHaIotDevices()
    cachedIotDevices = iotDevices

    res.json({
      statuses,
      lastUpdated: new Date(lastUpdated).toISOString(),
      cached: false,
      iotDevices
    })
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve homelab status',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

export default router
