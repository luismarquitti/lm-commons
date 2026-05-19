---
description: Revisão e Definição de Arquitetura da Aplicação
---

# 🏗️ Revisão e Definição de Arquitetura da Aplicação

Este workflow utiliza uma série de agentes e skills especializadas para analisar, planejar e documentar a arquitetura de software da aplicação ClinicCare. O objetivo é garantir que o sistema seja estruturado, robusto, escalável e siga as melhores práticas modernas, mantendo as decisões sempre registradas.

## Passo 1: Análise Arquitetural Inicial (Senior Architect)

- **Ação:** O agente atua utilizando a skill `senior-architect`.
- **Objetivo:** Analisar criticamente a base de código (caso exista) os requisitos atuais e técnicos, avaliando infraestrutura, dívidas técnicas e gargalos do produto.
- **Saídas Esperadas:** Avaliação completa das configurações do projeto, revisão do design do sistema de alto nível e geração das primeiras recomendações estruturais.

## Passo 2: Emprego e Definição de Padrões Arquiteturais (Architecture Patterns)

- **Ação:** Aplicação da skill `architecture-patterns`.
- **Objetivo:** Estabelecer as fundações sólidas (Clean Architecture, Hexagonal Architecture, Domain-Driven Design - DDD).
- **Saídas Esperadas:** Definição clara dos *Bounded Contexts*, camadas de domínio e aplicação, regras de dependência entre módulos independentes e como o isolamento do "core business" do sistema será garantido.

## Passo 3: Design e Estratégia de Microsserviços (Microservices Patterns)

- **Ação:** Intervenção da skill `microservices-patterns`.
- **Objetivo:** Estruturar um projeto orientado a microsserviços, definindo decomposição funcional.
- **Saídas Esperadas:** Planejamento dos limites dos serviços baseados no domínio, os contratos entre as APIs (REST/GraphQL/gRPC), as definições de resiliência e a organização do banco de dados distribuído para cada microsserviço.

## Passo 4: Escalabilidade Complexa com CQRS e Event Sourcing (Event Sourcing Architect)

- **Ação:** Uso especializado da skill `event-sourcing-architect`.
- **Objetivo:** Atuar nas áreas mais críticas do sistema que necessitam de trilha de auditoria completa, histórico imutável (Event Store) e separação de escrita/leitura.
- **Saídas Esperadas:** Modelagem robusta de comandos e eventos, separação CQRS com projeções eficientes de leitura, e padrões de orquestração de sistema distribuído via *Sagas* para consistência transacional.

## Passo 5: Registro Formal das Escolhas Arquiteturais (Architecture Decision Records)

- **Ação:** Formalização através da skill `architecture-decision-records`.
- **Objetivo:** Documentar e centralizar tudo o que foi decidido nos módulos anteriores.
- **Saídas Esperadas:** Documentos ADR salvos e versionados detalhando o contexto, alternativas consideradas, a decisão fundamentada e os "trade-offs" das escolhas feitas (ex: escolha entre um BD Relacional vs NoSQL para o financeiro).

---
> **Dica de ativação:** Para executar este workflow em conjunto com seus arquivos atuais, você pode pedir ao agente: *"Inicie o workflow `architecture-review.workflow` para mapear e revisar a arquitetura do meu módulo [NOME_MÓDULO]"*.
