# Instruções de Atualização do Relatório Homelab

Para refletir a adição do novo container Paperless-ngx no Proxmox, as seguintes seções do arquivo `homelab-implementation-report.html` foram atualizadas:

1.  **Nós da Arquitetura (Visual):** Adicionado um novo bloco `<div class="arch-node">` no grupo do Proxmox Optiplex para representar visualmente o container Paperless-ngx com o IP final `.15`.
2.  **Plano de Endereçamento (Lista):** Incluída a entrada `192.168.3.15` na lista de IPs estáticos, identificando o serviço como "gestão de documentos".
3.  **Tool Stack (Cards):** Criado um novo `tool-card` para o Paperless-ngx, descrevendo suas funcionalidades de OCR e gestão documental.
4.  **Tabela de Acessos:** Adicionada uma nova linha na tabela de domínios LAN para `paperless.lan`, apontando para a porta `8000` com SSL via Let's Encrypt.
