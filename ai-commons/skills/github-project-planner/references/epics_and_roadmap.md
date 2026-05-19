# Épicos e Roadmap — estrutura e armadilhas

## O que é um épico

Um épico é uma **fronteira de valor maior que uma história**, geralmente algo que leva 2-6 sprints e entrega uma capacidade reconhecível pelo usuário. Não é uma "feature inflada" e não é um tema (temas são guarda-chuvas ainda mais amplos, tipo "Onboarding").

**Bons épicos:**
- *Recuperação de conta sem suporte humano* (engloba: esqueci a senha, MFA reset, e-mail bloqueado)
- *Checkout em parcelamento sem juros* (engloba: simulação, escolha de parcelas, comunicação com adquirente)
- *Dashboard de métricas para gerente de loja* (engloba: 5-7 widgets, exportação, filtros temporais)

**Maus épicos:**
- *Backend* (não é valor, é camada)
- *Login* (pequeno demais; é uma história ou conjunto pequeno)
- *Melhorias gerais* (sem fronteira; vira saco de gatos)

## Estrutura de um épico no GitHub

Crie o épico como uma **issue** com label `type:epic` e o seguinte corpo:

```markdown
## Visão (o porquê)
[1 parágrafo: que problema resolve, para quem, e qual o sinal de sucesso]

## Resultado esperado (o quê)
[bullet de 2-4 outcomes mensuráveis: "redução de X% em Y", "habilita Z"]

## Escopo
**Inclui:**
- [story 1]
- [story 2]
- …

**Não inclui (out of scope):**
- [coisa que parece, mas deixamos para depois]

## Histórias filhas
- [ ] #NNN Recuperar senha por e-mail
- [ ] #NNN Reset de MFA com código de backup
- [ ] #NNN Desbloquear conta após N tentativas

## Critério de "épico pronto"
- Todas as histórias filhas fechadas
- Métricas-alvo medidas e reportadas
- Documentação para suporte atualizada
```

## Roadmap — formato

Um roadmap não é uma lista linear de features. É uma **sequência de fases com outcome por fase**. Cada fase contém épicos. Cada épico contém histórias.

Use `assets/roadmap_template.md` como esqueleto:

```markdown
# Roadmap — [Produto]

## Contexto
- **Visão:** [uma frase]
- **Personas principais:** [...]
- **Horizonte:** [v1 em X semanas / Q1+Q2 / etc.]

## Fora de escopo (explicitamente)
- [coisa que aparece muito como pedido mas decidimos não fazer agora]

## Fase 1 — [nome curto, ex: "Foundations"] (Sprints 1-2)
**Outcome:** [um resultado mensurável, ex: "usuários conseguem se cadastrar, logar e recuperar senha"]
- Épico: [nome] — [link/#issue]
- Épico: [nome] — [link/#issue]

## Fase 2 — [nome] (Sprints 3-5)
**Outcome:** [...]
- Épico: ...

## Fase 3 — [nome] (Sprints 6-8)
...
```

## Quão longe planejar

Regra prática:
- **Próximas 1-2 fases:** épicos + histórias detalhadas (corpo completo, critérios de aceite, pontos)
- **Fases 3-4:** épicos com escopo macro, histórias por título apenas
- **Além disso:** apenas temas e épicos como placeholder, sem decompor

Resistir à vontade de planejar 12 sprints com 80 histórias detalhadas. Metade vai ser repensada antes de chegar lá. Detalhar muito cedo é desperdício e cria a ilusão de certeza.

## PRD-lite vs. roadmap completo

- **PRD-lite** (≤ 1 página): para projetos pequenos ou um épico. Visão + outcomes + lista de histórias. Vive em `roadmap.md` ou no README.
- **Roadmap completo** (3-6 páginas): para produtos novos ou releases grandes. Inclui contexto, métricas, fases, e fora-de-escopo explícito.

Não force PRD completo em projetos pequenos — perde-se mais tempo escrevendo do que entregando.

## Armadilhas de roadmap

- **Datas-promessa em roadmaps internos.** Use "Sprint X-Y" ou "Q1" em vez de "15 de março". Datas absolutas viram dívida quando algo escorrega.
- **Roadmap como lista de tarefas.** Se a fase é "implementar JWT", não é roadmap — é backlog. Roadmap é por outcome.
- **Sem outcome mensurável por fase.** Como você vai saber que a Fase 1 acabou? Defina antes.
- **Sem out-of-scope.** Sem isso, todo pedido novo parece pertencer "à v1".
