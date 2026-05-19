# Rule: Commits Atômicos e Conventional Commits

## Objetivo

Garantir que todo o histórico de versionamento (Git) do projeto siga o padrão estruturado do [Conventional Commits (v1.0.0)](https://www.conventionalcommits.org/en/v1.0.0/) e que cada commit seja rigorosamente **atômico**. Cada commit deve representar apenas uma unidade lógica de alteração, evitando a mistura de refatorações, novas features e correções isoladas em um único commit.

## Triggers (Quando Ativar)

- Constantemente ao fazer stage de arquivos (`git add`) ou criar um commit (`git commit`).
- Ao estruturar uma mensagem de commit a pedido do usuário.
- Quando for avaliar, analisar ou reescrever o histórico de commits de uma branch ou Pull Request.
- Ao atuar como um agente revisor de código sugerindo integrações.

## Regras Essenciais

1. **Estrutura Obrigatória:** Todos os commits devem seguir a sintaxe `<tipo>[escopo opcional]: <descrição>`
   - *Tipos mais comuns:* `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
2. **Atomicidade Perfeita:** Um commit deve fazer apenas UMA coisa. Se você criou uma feature no módulo A e consertou um typo no módulo B, devem ser feitos 2 commits separados.
3. **Formatação da Descrição:** Use o verbo no imperativo e tempo presente (ex: "add" em vez de "added" ou "adds"; "fix" em vez de "fixed"). Não use ponto final no término da descrição curta.
4. **Quebra Opcional (Corpo/Rodapé):** Se a alteração necessitar de contexto adicional, insira uma quebra de linha após a descrição e adicione um corpo (`body`) explicando o "por quê" ou o "como" detalhado.

## Exemplos

### ❌ Incorreto (Don'ts)

- **Não Atômico (fazendo muitas coisas juntas):** `feat: adiciona módulo de pagamento e além disso arruma o bug da navbar`
- **Fora do Padrão (sem prefixo):** `atualizando os testes do usuário`
- **Gramática Inadequada (verbo no passado):** `fix: fixed null pointer exception on login`

### ✅ Correto (Do's)

- **Atômico (Apenas a Feature):** `feat(payment): add Stripe integration checkout`
- **Atômico (Apenas o Fix separado):** `fix(ui): resolve navbar overlapping on mobile view`
- **Apenas Documentação:** `docs: update setup instructions in README`
- **Refatoração sem mudança de escopo lógico:** `refactor(auth): extract jwt validation to separate middleware`
