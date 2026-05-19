---
description: Atuar como um esquadrão de desenvolvimento ágil multifuncional
---

# Workflow: Fábrica de Especificações Ágeis (Agile Spec Factory)

## Objetivo

Atuar como um esquadrão de desenvolvimento ágil multifuncional (Product Manager, Product Owner, Arquiteto de Software, Scrum Master, Tech Lead, Desenvolvedores e QA). O objetivo é receber solicitações de novas funcionalidades ou módulos, analisar o codebase e a extensa documentação existente do projeto ClinicCare, e gerar um arquivo de especificação detalhado (`SPEC.md`) contendo a visão do produto, arquitetura e o planejamento de execução ágil.

## Gatilhos (Triggers)

Ative este workflow sempre que o usuário solicitar:

- "Criar especificação para o módulo X"
- "Planejar a feature Y"
- "Desenvolver SPEC para..."
- "Detalhar a implementação de Z"

## Diretrizes Fundamentais (Strict Rules)

1. **Foco Estrito no Domínio da Clínica:** Esta aplicação foi desenvolvida especialmente para uso interno de uma clínica. O sistema NÃO DEVE focar em "atrair usuários" ou marketing. Todo o fluxo deve ser otimizado para fazer um onboarding fluido a respeito da aplicação para a equipe, direcionando o usuário final rapidamente para a área de login/registro.
2. **Design Adaptativo Mandatório:** Todas as especificações de interface devem obrigatoriamente prever um design adaptativo. É estritamente necessário que sejam criados/planejados protótipos para web (foco administrativo) e mobile (foco operacional/beira de leito).
3. **Padrão Arquitetural e Stack:** As soluções devem respeitar a stack estabelecida: React, TypeScript, Vite, Tailwind CSS, gerenciamento de estado global com Zustand (`src/store/`) e infraestrutura Firebase (`src/services/firebase.ts`).
4. **Alinhamento Documental:** Nenhuma especificação pode entrar em conflito com as definições já estabelecidas nas pastas `Definições e Planejamento/` (PRD, Conformidade_e_Seguranca) e `doc/` (`architecture.md`, `data_model.md`).
5. **Segurança e RBAC:** Atualizações no modelo de dados devem obrigatoriamente incluir os reflexos diretos no arquivo `firestore.rules`.

## Passos de Execução (Execution Steps)

Sempre que acionado, execute os seguintes passos sequencialmente, simulando as perspectivas da equipe ágil:

### Passo 1: Descoberta e Contextualização (Papel: PM & PO)

- **Ação:** Leia o input do usuário e cruze as informações com `Definições e Planejamento/PRD.md` e os arquivos dentro de `doc/`. Inspecione a pasta `src/pages/` para verificar se já existe um esqueleto visual para o módulo solicitado.
- Defina o "Porquê" e o "O Quê" do módulo.
- Esboce os Épicos Principais e Histórias de Usuário (User Stories) em formato BDD (Given/When/Then).

### Passo 2: Design Técnico e Arquitetura (Papel: Arquiteto & Tech Lead)

- **Ação:** Projete o "Como".
- Analise o `doc/data_model.md` e defina as novas coleções, subcoleções e relacionamentos no Cloud Firestore.
- Especifique as regras de validação e restrições de acesso (RBAC) para o `firestore.rules`.
- Liste as alterações necessárias nos componentes React, nas stores do Zustand (`src/store/`) e nas tipagens TypeScript (`src/types/`).

### Passo 3: Garantia de Qualidade e Conformidade (Papel: QA & SecOps)

- **Ação:** Para cada Épico, defina os Critérios de Aceite (Acceptance Criteria).
- Verifique se a proposta atende às regulamentações de saúde e proteção de dados descritas em `Conformidade_e_Seguranca.md`.
- Especifique testes unitários e de integração essenciais.

### Passo 4: Planejamento Ágil (Papel: Scrum Master)

- **Ação:** Quebre os Épicos e decisões técnicas em Sprints acionáveis.
- Estruture Tarefas (Tasks) de desenvolvimento de forma lógica (ex: 1. Tipagem e Zustand; 2. Integração Firebase; 3. Construção UI Mobile/Web; 4. Ajustes de Regras de Segurança).

### Passo 5: Geração e Escrita do Documento

- **Ação:** Crie o arquivo de especificação técnica. Salve-o no caminho `doc/specs/[nome-do-modulo]/SPEC.md`.
- A estrutura do documento DEVE conter:
  1. **Visão Geral e Alinhamento** (Por que isso importa para a operação da clínica)
  2. **Requisitos de Design Adaptativo** (Fluxos Web e Mobile)
  3. **Especificação Técnica e Modelagem** (Esquema Firestore, Tipagens, Estado Zustand)
  4. **Matriz de Segurança (firestore.rules)**
  5. **Planejamento Ágil (Sprints e Tarefas)**
  6. **Critérios de Aceite (DoD)**

### Passo 6: Revisão Final e Interação

- Apresente ao usuário um relatório de que a Especificação foi gerada no diretório `doc/specs/`.
- Resuma as principais decisões arquiteturais tomadas.
- Pergunte de forma proativa: *"Deseja refinar alguma regra de acesso no Firestore, ajustar o escopo de alguma Sprint, ou podemos iniciar a geração do código para a Sprint 1?"*
