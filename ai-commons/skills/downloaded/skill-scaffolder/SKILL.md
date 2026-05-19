---
name: skill-scaffolder
description: Cria a estrutura inicial (scaffold) para uma nova Skill do Gemini CLI no projeto Intellifinance, garantindo adesão aos padrões de metadados e estrutura de diretórios.
---

# 🏗️ Skill Scaffolder (Meta-Skill)

Esta habilidade guia o usuário na criação de novas ferramentas agênticas, assegurando que todas sigam a arquitetura de governança do Intellifinance e os padrões de "Agent Skills".

## Protocolo de Execução

### 1. 🗣️ Entrevista de Requisitos

Antes de criar qualquer arquivo, você deve obter as seguintes informações do usuário (interaja passo a passo se necessário):

1. **Nome da Skill (Slug):** O nome técnico da pasta/comando (ex: `database-migrator`, `pr-reviewer`). Deve ser em `kebab-case`.
2. **Objetivo (Intent):** Uma frase curta descrevendo *o que* a skill faz e *quando* o agente deve ativá-la (ex: "Analisa diffs do Git para gerar Changelogs semânticos").

### 2. 📂 Verificação e Estrutura

1. Verifique se o diretório `.gemini/skills/` existe na raiz do monorepo. Se não, crie-o.
2. Verifique se já existe uma pasta com o `{nome-da-skill}`. Se existir, pergunte ao usuário se deve sobrescrever ou abortar.
3. Crie o diretório: `.gemini/skills/{nome-da-skill}/`.

### 3. 📝 Geração do Artefato (Template)

Crie o arquivo `.gemini/skills/{nome-da-skill}/SKILL.md` preenchendo o template abaixo com as informações coletadas.

**⚠️ IMPORTANTE:** Ao escrever o arquivo, mantenha as referências ao contexto do Intellifinance (AGENTS.md/Constituição).

#### Template para Injeção

```markdown
---
name: {nome-da-skill}
description: {objetivo-da-skill}
---

# 🤖 {nome-da-skill}

> **CONTEXTO DO PROJETO:** Esta skill opera dentro do ecossistema Intellifinance.
> Consulte sempre o `AGENTS.md` na raiz para diretrizes de personalidade (DevSquad) e `packages/database/prisma/schema.prisma` para integridade de dados.

## 🎯 Gatilho e Propósito
Use esta skill quando o usuário solicitar: "{objetivo-da-skill}".

## 🛠️ Protocolo (Passo a Passo)

1.  **Análise de Contexto**
    * [Defina aqui o primeiro passo lógico. Ex: Ler arquivos, verificar estado do git, etc.]
    * *Nota: Lembre-se de verificar o `package.json` antes de sugerir novos imports.*

2.  **Execução**
    * [Defina a ação principal. Ex: Gerar código, executar script, criar arquivo.]

3.  **Validação (Quality Gate)**
    * [Defina como o agente deve validar o resultado antes de entregar.]
    * *Conforme a Constituição: Valide inputs com Zod e outputs estruturados.*

## 📦 Dependências e Recursos
* Se esta skill precisar de scripts auxiliares, eles devem residir em `.gemini/skills/{nome-da-skill}/scripts/`.

```

### 4. 🚀 Finalização e Teste

1. Informe ao usuário que a skill foi criada em `.gemini/skills/{nome-da-skill}/`.
2. Sugira ao usuário que edite o arquivo criado para detalhar o "Protocolo (Passo a Passo)" com a lógica específica da tarefa.
3. Convide o usuário a testar a nova skill imediatamente (o Gemini CLI recarrega skills dinamicamente).
