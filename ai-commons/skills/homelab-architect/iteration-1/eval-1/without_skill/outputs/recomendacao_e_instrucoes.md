### Recomendação Arquitetural: Novo Nó de Mídia (192.168.3.51)

Para configurar o novo nó Proxmox dedicado a serviços de mídia (Plex/Jellyfin), a recomendação de armazenamento segue uma estrutura de três camadas para otimizar a performance e a vida útil do hardware:

#### 1. Planejamento de Armazenamento
*   **Camada de Sistema e Metadados (SSD Local):** O Proxmox e o disco raiz do LXC/VM do Plex/Jellyfin devem residir em um SSD. É crucial que o diretório de metadados (onde ficam as capas e o banco de dados) esteja no SSD para garantir que a navegação na biblioteca seja fluida.
*   **Camada de Dados de Mídia (HDD Centralizado ou Local):**
    *   **Abordagem Recomendada:** Montar o HDD de dados do nó principal (`pve-optiplex`) via **NFS**. Isso centraliza a biblioteca de mídia e facilita backups.
    *   **Abordagem Local:** Se o novo nó possuir HDDs de alta capacidade, utilize-os para armazenamento local de mídia, formatando-os como `ext4` (via Ansible) para minimizar o overhead.
*   **Camada de Cache/Transcodificação (RAM Disk):** Configure o diretório de transcodificação do Plex/Jellyfin para apontar para `/dev/shm`. Isso utiliza a memória RAM para arquivos temporários de vídeo, poupando o SSD de escritas constantes e aumentando a velocidade de início dos vídeos.

#### 2. Configuração de Hardware (Dica)
*   Certifique-se de habilitar o suporte a **Intel QuickSync** na BIOS se o processador possuir iGPU, para permitir transcodificação por hardware com baixo consumo de CPU.

---

### Instruções de Ansible

Para preparar o nó `192.168.3.51`, você deve utilizar a sequência de playbooks já estabelecida no repositório, com foco principal no **`01-storage.yml`** para a preparação dos discos.

#### Passo 1: Atualizar o Inventário
Adicione o novo nó ao arquivo `ansible/inventory/hosts.yml`:

```yaml
        pve-media:
          ansible_host: 192.168.3.51
          pve_node_name: pve-media
          pve_is_primary: false
          storage_disks:
            pve_storage:
              device: /dev/sdb1  # Ajuste para o seu dispositivo real
              mount: /mnt/pve-storage
              fstype: ext4
              format: true
              content: "images,rootdir,backup,iso,snippets,vztmpl"
```

#### Passo 2: Executar a Preparação

1.  **Bootstrap (Preparação de Sistema):**
    Prepare o nó com repositórios e pacotes base:
    ```bash
    ansible-playbook playbooks/00-bootstrap.yml --limit pve-media
    ```

2.  **Storage (Preparação de Discos):**
    Utilize o playbook **`playbooks/01-storage.yml`**. O playbook foi generalizado para rodar em todos os nós do grupo `proxmox`, executando apenas as tarefas cujos discos estejam definidos no inventário.
    ```bash
    ansible-playbook playbooks/01-storage.yml --limit pve-media
    ```

3.  **Cluster (Integração):**
    Junte o novo nó ao cluster existente:
    ```bash
    ansible-playbook playbooks/02-cluster.yml --limit pve-media
    ```

4.  **Sharing (Montagem de Mídia Remota):**
    Se optar por usar a mídia do nó principal, utilize o **`03-sharing.yml`** para montar o NFS automaticamente.
