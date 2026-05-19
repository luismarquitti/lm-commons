# Instruções de Atualização - Paperless-ngx

Para refletir a adição do container **Paperless-ngx** no IP **192.168.3.15**, o arquivo `homelab-implementation-report.html` deve ser atualizado nos seguintes pontos:

1. **Cabeçalho (Header):** Atualize a data de "Atualizado em" para a data atual.
2. **Plano de Endereçamento (Seção 02):** Insira o novo IP no bloco `ip-plan.txt`.
3. **Stack de Serviços (Seção 04):** Adicione um novo `tool-card` para o Paperless-ngx.
4. **Deploy de Serviços (Seção 05):** Inclua o comando de instalação no bloco `install-services.sh`.
5. **DNS Local (Seção 06):** Adicione a regra de reescrita para `paperless.lan`.
