---
description: Gerencia as definições de regras (.agents/rules/*). Analisa regras existentes e o código da aplicação para propor atualizações, e cria regras específicas após aprovação do usuário.
---

# Workflow: Gerenciador de Regras (Rules Manager)

## Objetivo

Gerenciamento dinâmico e inteligente das definições de regras do projeto localizadas no diretório `.agents/rules/`. Este workflow permite que o assistente valide regras atuais, avalie padrões do codebase para propor novas automações e ajude na criação sistemática de novas regras específicas exigidas pelo usuário garantindo sempre o refinamento através de perguntas e a validação antes da persistência.

## Gatilhos (Triggers)

Inicie as etapas deste workflow sempre que o usuário disser algo como:

- "Avalie as regras do projeto" ou "Faça uma análise das rules"
- "Quais regras deveríamos adicionar?"
- "Crie uma rule para..." (ex: "Crie uma rule para sempre utilizar conventional commits")
- "Altere a regra de..."

## Skills Integradas

Para garantir excelência na análise e criação de regras, ative e incorpore o conhecimento dos seguintes skills dependendo do contexto:

- **`cc-skill-coding-standards`**: Para embasar a criação de regras relacionadas a formatação, TypeScript, abstrações de uso geral e padrões arquiteturais do frontend/backend.
- **`clean-code`**: Para auditar o codebase em busca de smells e código não padronizado, e para gerar regras de nomenclatura, tamanho de funções e boas práticas do SOLID.
- **`lint-and-validate`**: Para analisar a infraestrutura atual de integração contínua e configuração local (ESLint, Prettier, testes) e propor regras que amarrem procedimentos de checagem.
- **`commit`**: Especificamente para definir, avaliar ou criar regras de versionamento, histórico do Git e padrões de *Conventional Commits*.
- **`cc-skill-security-review`**: Para ser acionado durante a auditoria em busca de vulnerabilidades comuns para as quais podemos criar validações automatizadas de segurança (validação de entrada, autenticação).

## Passos de Execução (Execution Steps)

Siga sempre as orientações abaixo dependendo do caso requisitado:

### Cenário 1: Análise e Proposta de Regras

Quando a intenção for avaliar o cenário geral e sugerir melhorias.

1. **Leitura do Estado Atual:** Utilize suas ferramentas para ler os arquivos presentes no diretório `.agents/rules/`.
2. **Auditoria do Codebase (Skills: `clean-code`, `lint-and-validate`):** Inspecione as configurações vitais (`package.json`, `.eslintrc`, etc), leia documentações ativas e faça um overview por amostragem das pastas de código para checar a adesão a regras de clean code e validações de lint.
3. **Plano de Sugestões (Skills: `cc-skill-coding-standards`, `cc-skill-security-review`):** Com base no que foi encontrado, monte uma lista de 3 a 5 regras sugeridas com títulos e razões fortes.
4. **Consulta:** Exiba as sugestões geradas e pergunte de forma proativa se o usuário deseja iniciar a documentação de alguma regra específica listada.

### Cenário 2: Solicitações de Criação/Edição de Regras

Quando o usuário já sabe o que quer e pede por uma nova funcionalidade ou edição de regra.

1. **Análise Pessoal e Discovery:** Entenda brevemente o que foi solicitado. O nível de descrição é suficiente para formalizar uma regra de IA impecável?
2. **Esclarecimento Guiado por Skills:** Dependendo do tema, ative o *skill* pertinente para fazer o melhor *discovery* possível. Formule de 1 a 3 perguntas essenciais:
   - Regra sobre git? Consulte o skill `commit`. (ex: "As mensagens devem conter o ID das issues do JIRA nos Conventional Commits?")
   - Regra de formatação de interface? Consulte `cc-skill-coding-standards`.
3. **Geração do Rascunho (Draft):** Após as respostas ou caso a regra seja simples o bastante, gere uma sugestão de *markdown* projetada para ser lida e interpretada tanto por desenvolvedores quanto por IAs. O draft da Rule deve incluir:
   - Um objetivo claro sobre o propósito central da regra.
   - Instruções de *quando* a regra deve ser ativada (Triggers).
   - Exemplos contrastantes (Do's / Don'ts ou formato Incorreto / Correto).
4. **Validação:** Crie um *codeblock* exibindo todo o arquivo de regra pretendido. Faça uma pergunta explícita, ex.: *"O que acha desta redação? Podemos criar o arquivo agora?"*
5. **Gravação:** **Apenas grave o arquivo `.md` no disco após o usuário afirmar de forma explícita que está validado.** O salvamento deve ocorrer preferencialmente dentro da pasta `.agents/rules/`.
