# Trechos de Código Modificados

### 1. Architecture Nodes (LXC Optiplex)
```html
            <div class="arch-node" style="font-size:10px;padding:8px 12px;"><div class="node-label">LXC</div><div class="node-name">Coolify</div><div class="node-ip">.8</div></div>
            <div class="arch-node" style="font-size:10px;padding:8px 12px;"><div class="node-label">LXC</div><div class="node-name">Paperless-ngx</div><div class="node-ip">.15</div></div>
```

### 2. Addressing Plan
```text
192.168.3.14    luis-laptop          <span class="c-dim"># Lenovo (reserva DHCP)</span>
192.168.3.15    paperless            <span class="c-dim"># LXC — gestão de documentos</span>
192.168.3.19    openclaw             <span class="c-dim"># VM — Openclaw</span>
```

### 3. Tool Stack Card
```html
    <div class="tool-card">
      <div class="tool-icon" style="background:rgba(96,165,250,0.1);color:var(--blue)">PN</div>
      <div class="tool-info">
        <div class="tool-name">Paperless-ngx</div>
        <div class="tool-desc">Gestão de documentos self-hosted com OCR e organização automática</div>
        <div class="tool-repo">LXC — 192.168.3.15</div>
      </div>
    </div>
```

### 4. Access Table Row
```html
          <tr><td class="td-ip">paperless.lan</td><td style="font-family:var(--mono);font-size:12px;">192.168.3.15</td><td class="td-port">8000</td><td>Let's Encrypt</td></tr>
```
