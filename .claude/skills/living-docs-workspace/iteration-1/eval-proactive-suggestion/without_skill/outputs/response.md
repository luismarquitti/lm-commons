Ótimo! O `07-openclaw-deploy.yml` completou com sucesso. O estado atual do `lm-claw` agora é:

- **OpenClaw**: rodando no bare-metal (`192.168.3.30`)
- **Ollama**: ativo na porta `11434`
- **Tailscale**: configurado no host bare-metal

Isso conclui a migração do Optiplex para bare-metal que estava planejada — o `lm-claw` agora tem acesso direto aos 16GB de RAM e 4 cores do i5-6500, sem overhead de virtualização.

---

Quer que eu atualize a documentação do projeto para refletir esse novo estado? Os arquivos que precisariam ser atualizados são:

- `docs/homelab-context.md` — estado atual da infra está desatualizado (ainda mostra a arquitetura anterior com Proxmox no Optiplex)
- `optiplex-openclaw-report.md` — o relatório de análise das opções ainda está com status "em análise"; poderia ser marcado como "Opção C implementada"
- `homelab-implementation-report.html` — relatório HTML de implementação
- `homelab-network-docs.md` — documentação de rede pode precisar refletir o novo papel do `lm-claw` como bare-metal com Tailscale

Se quiser, é só confirmar e eu atualizo todos de uma vez.
