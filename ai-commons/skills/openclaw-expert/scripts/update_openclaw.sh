#!/bin/bash
# update_openclaw.sh - Executa o playbook Ansible para atualizar o OpenClaw.

REPO_ROOT="/home/luismarquitti/home-lab"
ANSIBLE_DIR="$REPO_ROOT/ansible"

cd $ANSIBLE_DIR
ansible-playbook playbooks/07-openclaw-deploy.yml --tags openclaw
