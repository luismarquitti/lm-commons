---
description: Gerencia, analisa e cria documentação de produto e arquitetura (ADRs, PRDs, Specs, Contexto)
---
# Workflow de Gerenciamento de Projeto e Documentação

Este workflow orquestra ferramentas para manter o projeto alinhado com sua documentação, garantindo visibilidade para evoluções futuras. Sempre que você não tiver certeza sobre o estado do projeto, execute este workflow.

1. **Auditoria de Contexto e Código**
// turbo
Execute uma varredura nas pastas de documentação (ex: `doc/`, `Definições e Planejamento/` e `README.md`).
Em seguida, invoque a skill `wiki-architect` ou `docs-architect` para entender as discrepâncias entre a implementação atual (código base) e o que está documentado.

2. **Revisão e Criação de PRDs e Visão do Produto**
Invoque a skill `product-manager-toolkit` para gerar, estruturar ou manter atualizados os *Product Requirements Documents* (PRDs) com base no roadmap existente.

3. **Registro de Decisões de Arquitetura (ADRs)**
Sempre que uma mudança técnica significativa for feita ou planejada, invoque a skill `architecture-decision-records` para formalizar a decisão técnica de forma padronizada.

4. **Atualização de Especificações (SPECs)**
Utilize a skill `code-documentation-doc-generate` para documentar detalhadamente o código desenvolvido e manter as SPECs atualizadas, garantindo que o plano e a prática sejam equivalentes.

5. **Mapeamento de Arquitetura em Nível de Componentes (Opcional)**
Invoque a família de skills `c4-architecture` (como `c4-context`, `c4-container`, `c4-component`, `c4-code`) para mapear visual e textualmente as relações entre módulos (apenas quando solicitado por grandes refatorações).

6. **Planejamento de Novas Tarefas**
Ao iniciar o trabalho em uma nova funcionalidade que emergiu dessa análise, chame a skill `planning-with-files` para delinear os próximos passos táticos.
