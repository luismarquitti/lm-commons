# Instruções de Ansible para o Novo Nó (pve-media)

Para integrar o novo nó `192.168.3.51` ao ecossistema existente, siga os passos abaixo utilizando os playbooks localizados em `/home/luismarquitti/home-lab/ansible/`.

## 1. Preparação do Inventário
Edite o arquivo `ansible/inventory/hosts.yml` para incluir o novo host:

```yaml
proxmox:
  hosts:
    pve-media:
      ansible_host: 192.168.3.51
      pve_node_name: pve-media
      pve_is_primary: false
      storage_disks:
        media_storage:
          device: /dev/sdb  # Ajustar conforme identificação do disco (ex: /dev/sdb)
          mount: /mnt/media-library
          fstype: ext4
          format: true
          content: "images,iso"
```

Atualize também o arquivo `ansible/inventory/group_vars/all.yml` na seção `etc_hosts_entries`:

```yaml
etc_hosts_entries:
  # ... entradas existentes ...
  - ip: "192.168.3.51"
    names: "pve-media pve-media.lan"
```

## 2. Execução dos Playbooks

### Passo A: Bootstrap (Configuração Base)
Prepara os repositórios, instala pacotes base e configura o acesso SSH.
```bash
ansible-playbook -i inventory/hosts.yml playbooks/00-bootstrap.yml --limit pve-media
```

### Passo B: Configuração de Armazenamento
Utilize o playbook `01-storage.yml`. **Nota:** Certifique-se de que o playbook esteja configurado para atuar em `hosts: proxmox` ou use `--limit pve-media`.
```bash
ansible-playbook -i inventory/hosts.yml playbooks/01-storage.yml --limit pve-media
```

### Passo C: Adição ao Cluster
Une o novo nó ao cluster existente `mqt-homelab`.
```bash
ansible-playbook -i inventory/hosts.yml playbooks/02-cluster.yml
```

### Passo D: Deployment do LXC (Plex/Jellyfin)
Crie um novo grupo no inventário (ex: `lxc_media`) e utilize o playbook `05-lxc-deploy.yml` adaptado para apontar para o `pve-media`.
```bash
ansible-playbook -i inventory/hosts.yml playbooks/05-lxc-deploy.yml --tags plex
```

## 3. Playbooks Principais a Utilizar
1.  **`00-bootstrap.yml`**: Essencial para equalizar o nó com o restante do lab.
2.  **`01-storage.yml`**: Para automatizar a montagem do disco de mídia e registro no PVE.
3.  **`02-cluster.yml`**: Para garantir que o novo nó apareça na interface única do Proxmox.
4.  **`05-lxc-deploy.yml`**: Para a criação automatizada do container de mídia.
