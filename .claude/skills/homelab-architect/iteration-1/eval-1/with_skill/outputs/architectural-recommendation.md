# Recomendação Arquitetural: Nó de Mídia (pve-media)

## 1. Identificação do Nó
- **Nome:** `pve-media`
- **Endereço IP:** `192.168.3.51`
- **Finalidade:** Servidor dedicado para Plex/Jellyfin e processamento de mídia.

## 2. Estratégia de Armazenamento
Para garantir o melhor desempenho no streaming e na navegação da biblioteca, recomendo uma abordagem de armazenamento em camadas:

### Camada 1: Sistema e Metadados (SSD)
- **Implementação:** Instalação do Proxmox VE diretamente em um SSD.
- **Uso:** Armazenamento do SO e dos discos raiz (Root Disk) dos containers LXC.
- **Justificativa:** Os bancos de dados do Plex/Jellyfin e os arquivos de metadados (capas, descrições) realizam muitas operações de leitura/escrita aleatória. O SSD elimina o gargalo na interface do usuário.

### Camada 2: Biblioteca de Mídia (HDD de Alta Capacidade)
- **Implementação:** Um HDD SATA dedicado (ex: 4TB ou superior) montado diretamente no host.
- **Configuração no Host:** Formatado em **ext4** (para simplicidade e performance em disco único) ou **ZFS** (se houver necessidade de redundância/snapshots).
- **Montagem:** `/mnt/media-library` no host Proxmox.
- **Exposição ao Serviço:** Utilizar **Bind Mounts** para expor a pasta do host diretamente para o container LXC. Isso permite que o container acesse os arquivos com performance nativa e facilita a migração ou recuperação de dados.

### Camada 3: Cache de Transcoding (RAM ou SSD)
- **Implementação:** Configurar o diretório de transcodificação para usar `/dev/shm` (RAM) ou uma partição dedicada no SSD.
- **Justificativa:** Reduz o desgaste do disco principal e acelera o início do streaming.

## 3. Provisionamento do Serviço
- **Método:** **Container LXC Privilegiado**.
- **Justificativa:** Facilita a passagem de hardware (GPU Passthrough) para transcodificação via hardware (Intel QuickSync ou NVIDIA), o que é essencial para não sobrecarregar a CPU.
- **Isolamento:** Embora privilegiado, o nó estará em um host separado, mitigando riscos de segurança para o restante do cluster.
