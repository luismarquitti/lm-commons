#!/bin/bash
# check_status.sh - Verifica o estado do OpenClaw no lm-claw remotamente.

HOST="192.168.3.10"
USER="luismarquitti"

echo "--- Verificando Gateway OpenClaw ---"
ssh $USER@$HOST "openclaw gateway status"

echo -e "\n--- Rodando OpenClaw Doctor ---"
ssh $USER@$HOST "openclaw doctor"

echo -e "\n--- Verificando Ollama ---"
ssh $USER@$HOST "ollama ps"
