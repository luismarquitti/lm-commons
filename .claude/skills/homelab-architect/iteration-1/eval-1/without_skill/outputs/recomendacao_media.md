# Recomendação Arquitetural e Instruções Ansible para Novo Nó de Mídia (192.168.3.51)

## 1. Planejamento de Armazenamento

Para um nó dedicado a serviços de mídia como Plex ou Jellyfin, o desempenho de leitura e o gerenciamento de metadados são cruciais.

### Recomendação de Layout:
*   **Disco de Sistema (SSD):** Utilize um SSD (mesmo que pequeno, ex: 120GB-250GB) para o SO Proxmox e, principalmente, para os discos virtuais (rootfs) dos LXCs de mídia. Os metadados do Plex/Jellyfin (capas, informações de elenco, cache de busca) se beneficiam drasticamente da baixa latência de um SSD.
*   **Disco de Mídia (HDD):** Utilize um HDD de alta capacidade formatado em **EXT4** ou **XFS**. Estes sistemas de arquivos são maduros, performáticos para grandes arquivos de vídeo e fáceis de recuperar em caso de falhas.
*   **Acesso aos Dados:** Recomenda-se o uso de **Bind Mounts** para passar o diretório de mídia do host Proxmox diretamente para o container LXC. Isso oferece performance nativa de I/O sem a sobrecarga de protocolos de rede como NFS/SMB dentro do próprio nó.
*   **Transcoding:** Se possível, utilize `/dev/shm` (RAM) para o diretório de transcodificação temporária para reduzir o desgaste do SSD e aumentar a velocidade.

---

## 2. Instruções de Ansible

Para preparar o novo nó, siga os passos abaixo utilizando os playbooks existentes.

### Passo 1: Atualizar o Inventário
Adicione o novo nó ao arquivo `inventory/hosts.yml` dentro do grupo `proxmox`.

```yaml
        pve-media:
          ansible_host: 192.168.3.51
          pve_node_name: pve-media
          pve_is_primary: false
          storage_disks:
            media_storage:
              device: /dev/sdb1  # Ajuste para o device correto
              mount: /mnt/media
              fstype: ext4
              format: true
              content: "images,iso" # Opcional
```

### Passo 2: Executar Playbooks na Ordem Correta

1.  **Bootstrap (Inicialização):** Configura repositórios, atualiza o sistema e instala chaves SSH.
    ```bash
    ansible-playbook playbooks/00-bootstrap.yml --limit pve-media
    ```

2.  **Storage (Armazenamento):** Formata e monta os discos conforme definido no inventário.
    *Nota: Verifique se o playbook `01-storage.yml` está usando variáveis dinâmicas ou se precisa de ajuste para o novo host.*
    ```bash
    ansible-playbook playbooks/01-storage.yml --limit pve-media
    ```

3.  **Cluster (Adesão):** Adiciona o novo nó ao cluster `mqt-homelab`.
    ```bash
    ansible-playbook playbooks/02-cluster.yml --limit pve-media
    ```

4.  **Sharing (Compartilhamento):** Monta os compartilhamentos NFS existentes (ex: do `pve-optiplex`) para que o novo nó tenha acesso a ISOs e backups centralizados.
    ```bash
    ansible-playbook playbooks/03-sharing.yml --limit pve-media
    ```

### Sugestão de Melhoria no Playbook `01-storage.yml`:
O playbook atual parece estar hardcoded para `pve-optiplex`. Recomenda-se alterá-lo para:
```yaml
- name: Storage — Configurar discos
  hosts: proxmox
  # ... resto do código usando loop sobre storage_disks
```
Ou criar uma versão específica para o nó de mídia.
