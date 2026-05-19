# User Stories — formato, anti-padrões e Gherkin

Uma user story é o menor incremento de valor entregável a um usuário. Não é uma tarefa técnica nem uma "feature". Se você não consegue ler a história e dizer "isso, sozinho, deixa alguém melhor", divida ou rebatize como `type:task`.

## INVEST — o checklist que vale a pena

- **I**ndependent — pode ir para produção sem depender de outra história ainda não pronta. Quando duas são "irmãs siamesas", é sinal de que precisam virar uma só ou ser reordenadas.
- **N**egotiable — descreve a intenção, não o contrato técnico fechado.
- **V**aluable — entrega valor a alguém (usuário final, operador, integrador). "Refatorar o módulo X" não é user story; é `type:task`.
- **E**stimable — o time consegue palpitar um tamanho (pontos). Se ninguém faz ideia, falta refinamento.
- **S**mall — cabe em 1 sprint, idealmente em 1-3 dias de uma pessoa. Histórias de 13+ pontos quase sempre precisam quebrar.
- **T**estable — dá para escrever critérios de aceite objetivos.

## Formato do título

Use **verbo no infinitivo + objeto + qualificador opcional**, não "Como [persona]…". O título precisa ser escaneável em listas; "Como usuário, eu quero…" repetido 80 vezes na backlog vira ruído.

**Bom:**
- `Recuperar senha por e-mail`
- `Exportar relatório mensal em PDF`
- `Filtrar pedidos por status`

**Ruim:**
- `Como cliente, quero recuperar minha senha` (formato no corpo, não no título)
- `Reset password endpoint` (descreve a *implementação*, não o valor)
- `Senha` (sem verbo, sem objeto — adivinha o que é?)

## Formato do corpo

Use este template (em `assets/issue_templates/user_story.md`):

```markdown
## História
Como **[persona]**, quero **[ação]**, para **[valor / motivação]**.

## Critérios de aceite
- **Dado** [contexto inicial]
- **Quando** [ação que o usuário executa]
- **Então** [resultado observável pelo usuário]

(repita Dado/Quando/Então para cada cenário, incluindo caminhos de erro)

## Definition of Done
- [ ] Testes automatizados cobrindo cenários acima
- [ ] Documentação atualizada (README/changelog se aplicável)
- [ ] Telemetria/log de eventos relevantes
- [ ] Revisão de UX (se houver tela)
- [ ] Deploy em ambiente de staging com validação manual

## Notas técnicas (opcional)
Pistas, não decisões. Decisões técnicas viram tasks separadas (`type:task`) ou ADRs.
```

## Critérios de aceite em Gherkin — o que evitar

Critérios de aceite descrevem **o que o usuário percebe**, não como o sistema faz. O teste é: um designer ou PM consegue ler e saber se está certo, sem abrir o código.

**Bom:**
```
Dado que estou logado e tenho um pedido pendente
Quando clico em "Cancelar pedido"
Então recebo uma confirmação de cancelamento
E o pedido some da minha lista de "Em andamento"
```

**Ruim:**
```
Dado que o token JWT está válido
Quando o frontend dispara DELETE /api/orders/:id
Então a API retorna 204 e o registro tem deleted_at != null
```

O segundo exemplo é um *teste de contrato técnico*, não um critério de aceite. Vire `type:task` ou coloque em "Notas técnicas".

## Estimativa em story points

Use Fibonacci: 1, 2, 3, 5, 8, 13. Não use horas. Pontos são **tamanho relativo** (complexidade + esforço + incerteza), não tempo.

Heurística rápida:
- **1** — trivial, mudança em um lugar, sem incerteza (mudar copy de um botão)
- **2** — pequena mudança, talvez em 2-3 arquivos, testes diretos
- **3** — feature simples completa: um endpoint + uma tela + testes
- **5** — feature mediana com 2-3 caminhos, integração com algo conhecido
- **8** — algo novo no domínio, exige decisão de design, várias telas/endpoints
- **13** — grande demais; quase sempre é sinal de "quebra essa história"

Ao estimar, anote a justificativa em uma linha. Justificativa do tipo "porque sim" não ajuda na retro.

## Anti-padrões comuns

- **História-frankenstein** ("Como usuário, quero fazer login OU cadastro OU recuperar senha"). Quebre por verbo.
- **História-tarefa disfarçada** ("Como dev, quero refatorar o módulo de auth"). Isso é `type:task` ou `type:tech-debt`.
- **História-sem-persona** ("Sistema deve permitir cancelamento de pedido"). Quem? Cliente final? Atendente? Faz diferença no design.
- **Critérios de aceite genéricos** ("Funcionar corretamente"). Inútil. Descreva o cenário observável.
- **História que não cabe em um sprint** (13+ pontos). Quebre por cenário, por persona, ou por caminho feliz vs. caminhos de erro.
