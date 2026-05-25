import React, { useState } from 'react'
import { usePolling } from '../../hooks/usePolling'
import './HomeLab.css'

interface Device {
  id: string
  name: string
  displayName: string
  ip: string
  mac?: string
  tailscaleIp?: string
  type: 'network' | 'host' | 'vm' | 'lxc'
  connType: 'cable' | 'wifi' | 'virtual'
  description: string
  vmid?: number
  os?: string
  services?: string[]
  specs?: string
  cx: number
  cy: number
  emoji: string
}

const DEVICES: Device[] = [
  {
    id: 'modem',
    name: 'Modem Provedor',
    displayName: 'Modem Provedor',
    ip: '192.168.0.1',
    type: 'network',
    connType: 'cable',
    description: 'Modem principal da operadora em modo Bridge/Roteador (Double NAT)',
    specs: 'WAN IP Dinâmico / LAN: 192.168.0.0/24',
    cx: 400,
    cy: 40,
    emoji: '🌐'
  },
  {
    id: 'mesh-principal',
    name: 'Mercusys Halo H60XR (Principal)',
    displayName: 'Halo H60XR (Principal)',
    ip: '192.168.3.1',
    mac: '30-16-9D-B2-D1-98',
    type: 'network',
    connType: 'cable',
    description: 'Roteador Mesh Principal no escritório, gerencia a subnet principal 192.168.3.0/24',
    specs: 'Mercusys Halo H60XR Gigabit Mesh',
    cx: 400,
    cy: 120,
    emoji: '📶'
  },
  {
    id: 'mesh-satelite',
    name: 'Mercusys Halo H60XS (Satélite)',
    displayName: 'Halo H60XS (Satélite)',
    ip: '192.168.3.250',
    type: 'network',
    connType: 'wifi',
    description: 'Satélite Mesh no quarto principal para extensão de cobertura sem fio',
    specs: 'Mercusys Halo H60XS Dual-Band',
    cx: 220,
    cy: 200,
    emoji: '📡'
  },
  {
    id: 'lm-claw',
    name: 'lm-claw',
    displayName: 'lm-claw (Optiplex)',
    ip: '192.168.3.10',
    mac: '74:86:7A:FA:8E:C8',
    tailscaleIp: '100.65.65.92',
    type: 'host',
    connType: 'cable',
    description: 'Servidor Bare-Metal AI rodando OpenClaw e Ollama diretamente no hardware',
    os: 'Debian 13 Trixie',
    specs: 'Dell Optiplex 7040 Core i5-6500 / 16GB RAM / 240GB NVMe + 300GB HDD',
    services: ['OpenClaw Agent Service', 'Ollama API', 'Mission Control Backend'],
    cx: 400,
    cy: 220,
    emoji: '🧠'
  },
  {
    id: 'pve-inspiron',
    name: 'pve-inspiron',
    displayName: 'pve-inspiron',
    ip: '192.168.3.50',
    mac: 'BC:24:11:A5:32:E5',
    tailscaleIp: '100.92.32.71',
    type: 'host',
    connType: 'cable',
    description: 'Nó único do Proxmox VE para virtualização e serviços de infraestrutura',
    os: 'Proxmox VE 8.x',
    specs: 'Dell Inspiron 14R Core i5-3337U / 8GB RAM / 240GB SSD + 1TB HDD',
    services: ['Proxmox VE Manager (https://192.168.3.50:8006)'],
    cx: 580,
    cy: 220,
    emoji: '🖥️'
  },
  {
    id: 'adguard',
    name: 'adguard',
    displayName: 'AdGuard Home',
    ip: '192.168.3.5',
    vmid: 100,
    type: 'lxc',
    connType: 'virtual',
    description: 'Filtro DNS local e bloqueador de anúncios para toda a rede',
    os: 'Debian 12 LXC',
    specs: 'LXC ID 100 / 1 vCPU / 512MB RAM',
    services: ['AdGuard DNS Resolver (Port 53)', 'Interface de Controle (Port 80)'],
    cx: 420,
    cy: 350,
    emoji: '🛡️'
  },
  {
    id: 'uptime-kuma',
    name: 'uptime-kuma',
    displayName: 'Uptime Kuma',
    ip: '192.168.3.6',
    vmid: 101,
    type: 'lxc',
    connType: 'virtual',
    description: 'Monitoramento contínuo de conectividade e serviços locais',
    os: 'Debian 12 LXC',
    specs: 'LXC ID 101 / 1 vCPU / 512MB RAM',
    services: ['Uptime Kuma Dashboard (Port 3001)'],
    cx: 500,
    cy: 350,
    emoji: '📊'
  },
  {
    id: 'nginx-proxy',
    name: 'nginx-proxy',
    displayName: 'Nginx Proxy Manager',
    ip: '192.168.3.7',
    vmid: 102,
    type: 'lxc',
    connType: 'virtual',
    description: 'Proxy reverso centralizado para rotear domínios locais e SSL',
    os: 'Debian 12 LXC',
    specs: 'LXC ID 102 / 1 vCPU / 1GB RAM',
    services: ['Nginx Admin (Port 81)', 'HTTP/HTTPS Proxying (80/443)'],
    cx: 580,
    cy: 350,
    emoji: '🔀'
  },
  {
    id: 'postgres-db',
    name: 'postgres-db',
    displayName: 'PostgreSQL DB',
    ip: '192.168.3.20',
    vmid: 104,
    type: 'lxc',
    connType: 'virtual',
    description: 'Banco de dados PostgreSQL central para automações e aplicações do laboratório',
    os: 'Debian LXC',
    specs: 'LXC ID 104 / 2 vCPUs / 2GB RAM',
    services: ['PostgreSQL Server (Port 5432)'],
    cx: 660,
    cy: 350,
    emoji: '🗄️'
  },
  {
    id: 'homeassistant',
    name: 'homeassistant',
    displayName: 'Home Assistant',
    ip: '192.168.3.22',
    vmid: 151,
    type: 'vm',
    connType: 'virtual',
    description: 'Centralização definitiva de automação residencial e IoT',
    os: 'Home Assistant OS (HASSOS)',
    specs: 'QEMU VM ID 151 / 2 vCPUs / 2GB RAM',
    services: ['Home Assistant Dashboard (Port 8123)', 'Zigbee2MQTT Integration', 'HomeKit Bridge'],
    cx: 740,
    cy: 350,
    emoji: '🏠'
  }
]

interface Shortcut {
  name: string
  url: string
  description: string
  emoji: string
}

const SHORTCUTS: Shortcut[] = [
  {
    name: 'OpenClaw Control',
    url: 'https://lm-claw.tail2a8138.ts.net',
    description: 'Interface e painel de controle do OpenClaw (via Tailscale)',
    emoji: '🧠'
  },
  {
    name: 'Proxmox VE',
    url: 'https://192.168.3.50:8006',
    description: 'Gerenciador de Máquinas Virtuais e LXC',
    emoji: '🖥️'
  },
  {
    name: 'Home Assistant',
    url: 'http://192.168.3.22:8123',
    description: 'Servidor de automação residencial e IoT',
    emoji: '🏠'
  },
  {
    name: 'Uptime Kuma',
    url: 'http://192.168.3.6:3001',
    description: 'Painel de monitoramento de status e uptime',
    emoji: '📊'
  },
  {
    name: 'AdGuard Home',
    url: 'http://192.168.3.5',
    description: 'DNS local e bloqueio de anúncios na rede',
    emoji: '🛡️'
  },
  {
    name: 'Nginx Proxy Manager',
    url: 'http://192.168.3.7:81',
    description: 'Gerenciador de proxy reverso e certificados SSL',
    emoji: '🔀'
  },
  {
    name: 'Mercusys Halo',
    url: 'http://192.168.3.1',
    description: 'Roteador e console de gerenciamento Wi-Fi Mesh',
    emoji: '📶'
  },
  {
    name: 'Tailscale Admin',
    url: 'https://login.tailscale.com/admin/machines',
    description: 'Console administrativo da VPN Tailscale',
    emoji: '🔑'
  }
]

interface HomeLabStatusResponse {
  statuses: Record<string, 'online' | 'offline'>
  lastUpdated: string
  cached: boolean
  iotDevices?: Record<string, { state: string, friendly_name: string }>
}

export default function HomeLab() {
  const [activeTab, setActiveTab] = useState<'topology' | 'inventory' | 'docs'>('topology')
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>('lm-claw')
  const [activeDocTab, setActiveDocTab] = useState<'network' | 'inventory'>('network')

  // Poll status endpoint every 15 seconds
  const { data, error, loading } = usePolling<HomeLabStatusResponse>('/api/homelab/status', 15000)

  const selectedDevice = DEVICES.find((d) => d.id === selectedDeviceId)

  const getDeviceStatus = (ip: string): 'online' | 'offline' => {
    // Modem isn't checked directly by backend pings in standard schema
    if (ip === '192.168.0.1') return 'online'
    if (data && data.statuses && data.statuses[ip]) {
      return data.statuses[ip]
    }
    return 'offline'
  }

  return (
    <div className="homelab animate-fade-in">
      <div className="homelab__header">
        <div>
          <h1 className="homelab__title">Painel do Home Lab</h1>
          <p className="homelab__description">Documentação de infraestrutura física, topologia e status de serviços em tempo real.</p>
        </div>
        
        {data && (
          <div className="homelab__refresh-info">
            <span className="homelab__refresh-badge">
              Status: {data.cached ? 'cached' : 'live'}
            </span>
            <span>Última checagem: {new Date(data.lastUpdated).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <nav className="homelab__tabs">
        <button
          className={`homelab__tab-btn ${activeTab === 'topology' ? 'homelab__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('topology')}
        >
          🌐 Topologia de Rede
        </button>
        <button
          className={`homelab__tab-btn ${activeTab === 'inventory' ? 'homelab__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📋 Inventário & Serviços
        </button>
        <button
          className={`homelab__tab-btn ${activeTab === 'docs' ? 'homelab__tab-btn--active' : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          📚 Documentação Interna
        </button>
      </nav>

      {/* Loading state indicator */}
      {loading && !data && (
        <div className="homelab__loading">
          <div className="homelab__spinner"></div>
          <p className="text-secondary">Carregando status do Home Lab...</p>
        </div>
      )}

      {/* Error state indicator */}
      {error && !data && (
        <div className="homelab__error">
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <p className="text-danger">Não foi possível obter os status do Home Lab.</p>
          <p className="text-muted" style={{ fontSize: '13px' }}>{error.message}</p>
        </div>
      )}

      {/* Topology Tab */}
      {activeTab === 'topology' && data && (
        <div className="homelab__topology-container animate-fade-in">
          <div className="homelab__diagram-panel">
            <svg viewBox="0 0 800 420" className="homelab__svg">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connections (Lines) */}
              {/* Modem to Mesh Principal */}
              <line x1="400" y1="40" x2="400" y2="120" className="homelab__link-line homelab__link-line--cable" />
              
              {/* Mesh Principal to Satélite */}
              <line x1="400" y1="120" x2="220" y2="200" className="homelab__link-line homelab__link-line--wifi" />
              
              {/* Mesh Principal to lm-claw */}
              <line x1="400" y1="120" x2="400" y2="220" className="homelab__link-line homelab__link-line--cable" />
              
              {/* Mesh Principal to pve-inspiron */}
              <line x1="400" y1="120" x2="580" y2="220" className="homelab__link-line homelab__link-line--cable" />

              {/* pve-inspiron to Nested LXCs / VMs */}
              <line x1="580" y1="220" x2="420" y2="350" className="homelab__link-line homelab__link-line--virtual" />
              <line x1="580" y1="220" x2="500" y2="350" className="homelab__link-line homelab__link-line--virtual" />
              <line x1="580" y1="220" x2="580" y2="350" className="homelab__link-line homelab__link-line--virtual" />
              <line x1="580" y1="220" x2="660" y2="350" className="homelab__link-line homelab__link-line--virtual" />
              <line x1="580" y1="220" x2="740" y2="350" className="homelab__link-line homelab__link-line--virtual" />

              {/* Draw Devices */}
              {DEVICES.map((device) => {
                const status = getDeviceStatus(device.ip)
                const isSelected = selectedDeviceId === device.id
                
                return (
                  <g
                    key={device.id}
                    className={`homelab__node ${isSelected ? 'homelab__node--selected' : ''}`}
                    transform={`translate(${device.cx}, ${device.cy})`}
                    onClick={() => setSelectedDeviceId(device.id)}
                  >
                    {/* Circle Container */}
                    <circle cx="0" cy="0" r="24" className="homelab__node-circle" />
                    
                    {/* Icon */}
                    <text x="0" y="6" className="homelab__node-icon" textAnchor="middle">
                      {device.emoji}
                    </text>
                    
                    {/* Status Ring */}
                    <circle
                      cx="16"
                      cy="-16"
                      r="5"
                      className={`homelab__node-status-ring homelab__node-status-ring--${status}`}
                      fill={status === 'online' ? '#10b981' : '#ef4444'}
                    />

                    {/* Labels */}
                    <text x="0" y="38" className="homelab__node-text">
                      {device.name.replace(/ \(.*\)/, '')}
                    </text>
                    <text x="0" y="49" className="homelab__node-subtext">
                      {device.ip}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Device details side panel */}
          <div className="homelab__info-panel">
            {selectedDevice ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="homelab__info-header">
                  <h2 className="homelab__info-title">{selectedDevice.displayName}</h2>
                  <span className={`homelab__info-badge homelab__info-badge--${selectedDevice.type}`}>
                    {selectedDevice.type}
                  </span>
                </div>

                <div className="homelab__info-status-row">
                  <span className={`homelab__status-indicator homelab__status-indicator--${getDeviceStatus(selectedDevice.ip)}`}></span>
                  <span className={getDeviceStatus(selectedDevice.ip) === 'online' ? 'text-success' : 'text-danger'}>
                    {getDeviceStatus(selectedDevice.ip) === 'online' ? 'ONLINE' : 'OFFLINE / UNREACHABLE'}
                  </span>
                </div>

                <p className="homelab__info-description">{selectedDevice.description}</p>

                <div className="homelab__info-grid">
                  <div className="homelab__info-item">
                    <span className="homelab__info-label">IP Local</span>
                    <span className="homelab__info-value homelab__info-value--mono">{selectedDevice.ip}</span>
                  </div>

                  {selectedDevice.mac && (
                    <div className="homelab__info-item">
                      <span className="homelab__info-label">MAC Address</span>
                      <span className="homelab__info-value homelab__info-value--mono">{selectedDevice.mac}</span>
                    </div>
                  )}

                  {selectedDevice.tailscaleIp && (
                    <div className="homelab__info-item">
                      <span className="homelab__info-label">Tailscale VPN IP</span>
                      <span className="homelab__info-value homelab__info-value--mono">{selectedDevice.tailscaleIp}</span>
                    </div>
                  )}

                  {selectedDevice.os && (
                    <div className="homelab__info-item">
                      <span className="homelab__info-label">Sistema Operacional</span>
                      <span className="homelab__info-value">{selectedDevice.os}</span>
                    </div>
                  )}

                  {selectedDevice.specs && (
                    <div className="homelab__info-item">
                      <span className="homelab__info-label">Especificações de Recurso</span>
                      <span className="homelab__info-value">{selectedDevice.specs}</span>
                    </div>
                  )}

                  {selectedDevice.vmid !== undefined && (
                    <div className="homelab__info-item">
                      <span className="homelab__info-label">ID Virtualization</span>
                      <span className="homelab__info-value homelab__info-value--mono">VMID {selectedDevice.vmid}</span>
                    </div>
                  )}

                  {selectedDevice.services && selectedDevice.services.length > 0 && (
                    <div className="homelab__info-item">
                      <span className="homelab__info-label">Serviços Principais</span>
                      <div className="homelab__info-services">
                        {selectedDevice.services.map((svc) => (
                          <span key={svc} className="homelab__info-service-tag">{svc}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDevice.id === 'homeassistant' && data && data.iotDevices && (
                    <div className="homelab__info-item" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                      <span className="homelab__info-label">Dispositivos IoT Ativos (Home Assistant)</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', marginTop: '8px' }}>
                        {Object.entries(data.iotDevices).map(([entityId, dev]: any) => {
                          const stateColor = dev.state === 'on' || dev.state === 'home' || (!isNaN(parseFloat(dev.state))) ? '#10b981' : '#6b7280';
                          return (
                            <div 
                              key={entityId} 
                              style={{ 
                                padding: '8px 12px', 
                                background: 'rgba(255,255,255,0.03)', 
                                borderLeft: `3px solid ${stateColor}`, 
                                borderRadius: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                boxSizing: 'border-box'
                              }}
                            >
                              <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {dev.friendly_name}
                              </span>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: dev.state === 'on' || dev.state === 'home' || !isNaN(parseFloat(dev.state)) ? '#10b981' : '#e5e7eb' }}>
                                {dev.state === 'on' ? 'LIGADO' : dev.state === 'off' ? 'DESLIGADO' : dev.state.toUpperCase()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="homelab__info-placeholder">
                <span style={{ fontSize: '48px' }}>🖱️</span>
                <p>Selecione um dispositivo na topologia para visualizar as informações de rede e recursos.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && data && (
        <div className="homelab__inventory animate-fade-in">
          <div className="homelab__table-wrapper">
            <table className="homelab__table">
              <thead>
                <tr>
                  <th>Nome / Hostname</th>
                  <th>IP Local</th>
                  <th>VPN Tailscale</th>
                  <th>Tipo</th>
                  <th>Recursos / SO</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {DEVICES.map((device) => {
                  const status = getDeviceStatus(device.ip)
                  return (
                    <tr key={device.id}>
                      <td>
                        <div className="homelab__table-name">
                          <span>{device.emoji}</span>
                          <div>
                            <div>{device.name}</div>
                            {device.vmid !== undefined && (
                              <span className="homelab__table-vmid">VMID {device.vmid}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: '12px' }}>{device.ip}</code>
                      </td>
                      <td>
                        {device.tailscaleIp ? (
                          <code style={{ fontSize: '12px' }}>{device.tailscaleIp}</code>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '12px' }}>-</span>
                        )}
                      </td>
                      <td>
                        <span className={`homelab__info-badge homelab__info-badge--${device.type}`}>
                          {device.type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '12.5px' }}>{device.specs || '-'}</div>
                        {device.os && (
                          <div className="text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                            {device.os}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="homelab__info-status-row">
                          <span className={`homelab__status-indicator homelab__status-indicator--${status}`}></span>
                          <span className={status === 'online' ? 'text-success' : 'text-danger'} style={{ fontSize: '12px', fontWeight: '600' }}>
                            {status === 'online' ? 'ONLINE' : 'OFFLINE'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Docs Tab */}
      {activeTab === 'docs' && (
        <div className="homelab__docs animate-fade-in">
          <div className="homelab__docs-menu">
            <h3 className="homelab__docs-menu-title">Documentos</h3>
            <button
              className={`homelab__docs-menu-btn ${activeDocTab === 'network' ? 'homelab__docs-menu-btn--active' : ''}`}
              onClick={() => setActiveDocTab('network')}
            >
              📄 Topologia & Rede
            </button>
            <button
              className={`homelab__docs-menu-btn ${activeDocTab === 'inventory' ? 'homelab__docs-menu-btn--active' : ''}`}
              onClick={() => setActiveDocTab('inventory')}
            >
              📄 Auditoria de Inventário
            </button>
          </div>

          <div className="homelab__docs-content">
            {activeDocTab === 'network' ? (
              <div className="homelab__doc-section animate-fade-in">
                <h1 className="homelab__doc-h1">Documentação de Rede — Home Lab</h1>
                <p className="homelab__doc-p">
                  <strong>Ambiente:</strong> MQT_Home · Subnet <code>192.168.3.0/24</code>
                </p>
                
                <h2 className="homelab__doc-h2">1. Roteador Mesh — Mercusys Halo</h2>
                <p className="homelab__doc-p">
                  O roteador principal (Halo H60XR) gerencia as conexões locais de dispositivos cabeados e Wi-Fi da residência.
                </p>
                <div className="homelab__doc-table-wrapper">
                  <table className="homelab__doc-table">
                    <thead>
                      <tr>
                        <th>Campo</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Modelo Principal</td>
                        <td>Mercusys Halo H60XR (Escritório)</td>
                      </tr>
                      <tr>
                        <td>IP Principal</td>
                        <td><code>192.168.3.1</code></td>
                      </tr>
                      <tr>
                        <td>MAC Principal</td>
                        <td><code>30-16-9D-B2-D1-98</code></td>
                      </tr>
                      <tr>
                        <td>Subnet LAN</td>
                        <td><code>192.168.3.0/24</code></td>
                      </tr>
                      <tr>
                        <td>Modelo Satélite</td>
                        <td>Mercusys Halo H60XS (Quarto Principal)</td>
                      </tr>
                      <tr>
                        <td>IP Satélite</td>
                        <td><code>192.168.3.250</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2 className="homelab__doc-h2">2. Servidores Físicos</h2>
                <p className="homelab__doc-p">
                  O laboratório é ancorado por duas máquinas físicas:
                </p>
                <ul>
                  <li className="homelab__doc-p">
                    <strong>Dell Optiplex 7040 (lm-claw):</strong> Debian 13 (bare-metal) hospedando a IA OpenClaw + Ollama. IP local fixado em <code>192.168.3.10</code>.
                  </li>
                  <li className="homelab__doc-p">
                    <strong>Dell Inspiron 14R (pve-inspiron):</strong> Servidor Proxmox VE rodando contêineres e máquinas virtuais. IP local fixado em <code>192.168.3.50</code>.
                  </li>
                </ul>

                <h2 className="homelab__doc-h2">3. VPN Mesh Tailscale</h2>
                <p className="homelab__doc-p">
                  Rede segura integrada para controle remoto e compartilhamento de recursos:
                </p>
                <div className="homelab__doc-table-wrapper">
                  <table className="homelab__doc-table">
                    <thead>
                      <tr>
                        <th>Hostname</th>
                        <th>IP Tailscale</th>
                        <th>Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>luis-laptop</td>
                        <td><code>100.105.115.103</code></td>
                        <td>Lenovo Laptop (Cliente)</td>
                      </tr>
                      <tr>
                        <td>pve-inspiron</td>
                        <td><code>100.92.32.71</code></td>
                        <td>Inspiron Host (.50)</td>
                      </tr>
                      <tr>
                        <td>lm-claw</td>
                        <td><code>100.65.65.92</code></td>
                        <td>Optiplex Host (.10)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="homelab__doc-section animate-fade-in">
                <h1 className="homelab__doc-h1">Auditoria de Inventário — MQT_Home</h1>
                <p className="homelab__doc-p">
                  Detalhamento de recursos de virtualização gerenciados no Proxmox VE (IP <code>192.168.3.50</code>).
                </p>

                <h2 className="homelab__doc-h2">1. Configurações Proxmox VE</h2>
                <div className="homelab__doc-table-wrapper">
                  <table className="homelab__doc-table">
                    <thead>
                      <tr>
                        <th>VMID / ID</th>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th>IP Local</th>
                        <th>Recursos Atribuídos</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>151</code></td>
                        <td>homeassistant-server</td>
                        <td>VM (KVM)</td>
                        <td><code>192.168.3.22</code></td>
                        <td>2 vCPUs / 2GB RAM / HAOS</td>
                      </tr>
                      <tr>
                        <td><code>100</code></td>
                        <td>adguard</td>
                        <td>LXC (Linux Container)</td>
                        <td><code>192.168.3.5</code></td>
                        <td>1 vCPU / 512MB RAM</td>
                      </tr>
                      <tr>
                        <td><code>101</code></td>
                        <td>uptime-kuma</td>
                        <td>LXC (Linux Container)</td>
                        <td><code>192.168.3.6</code></td>
                        <td>1 vCPU / 512MB RAM</td>
                      </tr>
                      <tr>
                        <td><code>102</code></td>
                        <td>nginx-proxy</td>
                        <td>LXC (Linux Container)</td>
                        <td><code>192.168.3.7</code></td>
                        <td>1 vCPU / 1GB RAM</td>
                      </tr>
                      <tr>
                        <td><code>104</code></td>
                        <td>postgres-db</td>
                        <td>LXC (Linux Container)</td>
                        <td><code>192.168.3.20</code></td>
                        <td>2 vCPUs / 2GB RAM</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2 className="homelab__doc-h2">2. Reservas DHCP estáticas</h2>
                <p className="homelab__doc-p">
                  As seguintes vinculações de endereços MAC estão reservadas no roteador Mercusys Halo para garantir IPs persistentes:
                </p>
                <div className="homelab__doc-table-wrapper">
                  <table className="homelab__doc-table">
                    <thead>
                      <tr>
                        <th>IP reservado</th>
                        <th>Hostname</th>
                        <th>Endereço MAC</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>192.168.3.10</code></td>
                        <td>lm-claw</td>
                        <td><code>74:86:7A:FA:8E:C8</code></td>
                      </tr>
                      <tr>
                        <td><code>192.168.3.50</code></td>
                        <td>pve-inspiron</td>
                        <td><code>BC:24:11:A5:32:E5</code></td>
                      </tr>
                      <tr>
                        <td><code>192.168.3.22</code></td>
                        <td>homeassistant</td>
                        <td><code>02:37:DE:E7:F3:31</code></td>
                      </tr>
                      <tr>
                        <td><code>192.168.3.14</code></td>
                        <td>luis-laptop</td>
                        <td><code>E0:D5:5D:AC:A4:59</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Links Úteis & Atalhos */}
      <div className="homelab__shortcuts">
        <h3 className="homelab__shortcuts-title">Links Úteis & Atalhos</h3>
        <div className="homelab__shortcuts-grid">
          {SHORTCUTS.map((shortcut) => (
            <a
              key={shortcut.name}
              href={shortcut.url}
              target="_blank"
              rel="noopener noreferrer"
              className="homelab__shortcut-card"
            >
              <div className="homelab__shortcut-icon">
                {shortcut.emoji}
              </div>
              <div className="homelab__shortcut-info">
                <span className="homelab__shortcut-name">{shortcut.name}</span>
                <span className="homelab__shortcut-desc">{shortcut.description}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
