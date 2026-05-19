#!/bin/bash
# backup_config.sh - Faz backup do arquivo de configuração do OpenClaw.

HOST="192.168.3.10"
USER="luismarquitti"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

ssh $USER@$HOST "cp ~/.openclaw/config.json5 ~/.openclaw/config.json5.bak_$TIMESTAMP"
echo "Backup criado: config.json5.bak_$TIMESTAMP"
