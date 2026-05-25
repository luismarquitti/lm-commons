const notionApiKey = process.env.NOTION_API_KEY;
const parentPageId = '36888fbc-b79e-806e-819d-c8840937dd8e';
const pessoasDbId = '107bd58f-11e3-4ed5-b41f-6445b63a4da2';

async function notionRequest(endpoint, method, body) {
  const url = `https://api.notion.com/v1/${endpoint}`;
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion API error: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

async function main() {
  const dbIds = {
    Pessoas: pessoasDbId
  };

  console.log('--- starting creation of Notion databases ---');

  // 1. Eventos
  console.log('Creating: 📅 Eventos...');
  const eventos = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '📅 Eventos' } }],
    properties: {
      'Título': { title: {} },
      'Data/Hora': { date: {} },
      'Recorrência': {
        select: {
          options: [
            { name: 'Única', color: 'blue' },
            { name: 'Diária', color: 'green' },
            { name: 'Semanal', color: 'purple' },
            { name: 'Mensal', color: 'orange' }
          ]
        }
      },
      'Responsável': {
        relation: {
          database_id: dbIds.Pessoas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Visibilidade': {
        select: {
          options: [
            { name: 'Família', color: 'blue' },
            { name: 'Pessoal', color: 'gray' }
          ]
        }
      },
      'Local': { rich_text: {} },
      'Google Event ID': { rich_text: {} },
      'Status': {
        select: {
          options: [
            { name: 'Confirmado', color: 'green' },
            { name: 'Pendente', color: 'yellow' },
            { name: 'Cancelado', color: 'red' }
          ]
        }
      },
      'Notas': { rich_text: {} }
    }
  });
  dbIds.Eventos = eventos.id;
  console.log(`Created: 📅 Eventos (ID: ${eventos.id})`);

  // 2. Rotinas
  console.log('Creating: 🔁 Rotinas...');
  const rotinas = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '🔁 Rotinas' } }],
    properties: {
      'Nome': { title: {} },
      'Responsável': {
        relation: {
          database_id: dbIds.Pessoas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Horário': { rich_text: {} },
      'Frequência': {
        select: {
          options: [
            { name: 'Diária', color: 'green' },
            { name: 'Dias úteis', color: 'blue' },
            { name: 'Fins de semana', color: 'orange' },
            { name: 'Semanal', color: 'purple' }
          ]
        }
      },
      'Dias da semana': {
        multi_select: {
          options: [
            { name: 'Seg', color: 'blue' },
            { name: 'Ter', color: 'blue' },
            { name: 'Qua', color: 'blue' },
            { name: 'Qui', color: 'blue' },
            { name: 'Sex', color: 'blue' },
            { name: 'Sáb', color: 'orange' },
            { name: 'Dom', color: 'orange' }
          ]
        }
      },
      'Ativa': { checkbox: {} },
      'Notas': { rich_text: {} }
    }
  });
  dbIds.Rotinas = rotinas.id;
  console.log(`Created: 🔁 Rotinas (ID: ${rotinas.id})`);

  // 3. Manutenção da Casa
  console.log('Creating: 🛠️ Manutenção da Casa...');
  const manutencao = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '🛠️ Manutenção da Casa' } }],
    properties: {
      'Item': { title: {} },
      'Categoria': {
        select: {
          options: [
            { name: 'Elétrica', color: 'yellow' },
            { name: 'Hidráulica', color: 'blue' },
            { name: 'Veículo', color: 'red' },
            { name: 'Limpeza', color: 'green' },
            { name: 'Outros', color: 'gray' }
          ]
        }
      },
      'Frequência': {
        select: {
          options: [
            { name: 'Mensal', color: 'green' },
            { name: 'Bimestral', color: 'blue' },
            { name: 'Trimestral', color: 'purple' },
            { name: 'Semestral', color: 'orange' },
            { name: 'Anual', color: 'red' }
          ]
        }
      },
      'Último feito': { date: {} },
      'Próximo em': {
        formula: {
          expression: 'prop("Último feito")'
        }
      },
      'Designado': {
        relation: {
          database_id: dbIds.Pessoas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Status': {
        select: {
          options: [
            { name: 'Em dia', color: 'green' },
            { name: 'Atenção', color: 'yellow' },
            { name: 'Atrasado', color: 'red' }
          ]
        }
      },
      'Custo estimado (R$)': { number: { format: 'real' } },
      'Notas': { rich_text: {} }
    }
  });
  dbIds.Manutencao = manutencao.id;
  console.log(`Created: 🛠️ Manutenção da Casa (ID: ${manutencao.id})`);

  // 4. Mercados / Idas
  console.log('Creating: 🏪 Mercados / Idas...');
  const mercados = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '🏪 Mercados / Idas' } }],
    properties: {
      'Nome': { title: {} },
      'Tipo': {
        select: {
          options: [
            { name: 'Supermercado', color: 'green' },
            { name: 'Feira', color: 'orange' },
            { name: 'Atacado', color: 'blue' },
            { name: 'Online', color: 'purple' }
          ]
        }
      },
      'Data planejada': { date: {} },
      'Responsável': {
        relation: {
          database_id: dbIds.Pessoas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Status': {
        select: {
          options: [
            { name: 'Planejada', color: 'yellow' },
            { name: 'Concluída', color: 'green' },
            { name: 'Cancelada', color: 'red' }
          ]
        }
      },
      'Gasto total (R$)': { number: { format: 'real' } },
      'Notas': { rich_text: {} }
    }
  });
  dbIds.Mercados = mercados.id;
  console.log(`Created: 🏪 Mercados / Idas (ID: ${mercados.id})`);

  // 5. Receitas
  console.log('Creating: 📖 Receitas...');
  const receitas = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '📖 Receitas' } }],
    properties: {
      'Nome': { title: {} },
      'Categoria': {
        select: {
          options: [
            { name: 'Massa', color: 'yellow' },
            { name: 'Carne', color: 'red' },
            { name: 'Peixe', color: 'blue' },
            { name: 'Vegano', color: 'green' },
            { name: 'Sobremesa', color: 'pink' },
            { name: 'Outros', color: 'gray' }
          ]
        }
      },
      'Tempo preparo': { number: {} },
      'Rendimento': { rich_text: {} },
      'Ingredientes': { rich_text: {} },
      'Modo de preparo': { rich_text: {} },
      'Link / fonte': { url: {} },
      'Favorita': { checkbox: {} },
      'Fotos': { files: {} }
    }
  });
  dbIds.Receitas = receitas.id;
  console.log(`Created: 📖 Receitas (ID: ${receitas.id})`);

  // 6. Exercícios
  console.log('Creating: 🏋️ Exercícios...');
  const exercicios = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '🏋️ Exercícios' } }],
    properties: {
      'Atividade': { title: {} },
      'Responsável': {
        relation: {
          database_id: dbIds.Pessoas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Tipo': {
        select: {
          options: [
            { name: 'Musculação', color: 'blue' },
            { name: 'Cardio', color: 'green' },
            { name: 'Flexibilidade', color: 'purple' },
            { name: 'Esporte', color: 'orange' }
          ]
        }
      },
      'Data': { date: {} },
      'Duração (min)': { number: {} },
      'Distância (km)': { number: {} },
      'Concluído': { checkbox: {} },
      'Intensidade': {
        select: {
          options: [
            { name: 'Leve', color: 'green' },
            { name: 'Moderada', color: 'yellow' },
            { name: 'Intensa', color: 'red' }
          ]
        }
      },
      'Notas': { rich_text: {} }
    }
  });
  dbIds.Exercicios = exercicios.id;
  console.log(`Created: 🏋️ Exercícios (ID: ${exercicios.id})`);

  // 7. Finanças — Contas
  console.log('Creating: 💳 Finanças — Contas...');
  const contas = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '💳 Finanças — Contas' } }],
    properties: {
      'Nome': { title: {} },
      'Tipo': {
        select: {
          options: [
            { name: 'Conta corrente', color: 'green' },
            { name: 'Poupança', color: 'blue' },
            { name: 'Cartão crédito', color: 'red' },
            { name: 'Carteira', color: 'orange' },
            { name: 'Investimento', color: 'purple' }
          ]
        }
      },
      'Titular': {
        relation: {
          database_id: dbIds.Pessoas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Banco / instituição': { rich_text: {} },
      'Últimos 4 dígitos': { rich_text: {} },
      'Ativa': { checkbox: {} },
      'Notas': { rich_text: {} }
    }
  });
  dbIds.Contas = contas.id;
  console.log(`Created: 💳 Finanças — Contas (ID: ${contas.id})`);

  // 8. Finanças — Orçamento
  console.log('Creating: 🎯 Finanças — Orçamento...');
  const orcamento = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '🎯 Finanças — Orçamento' } }],
    properties: {
      'Categoria': { title: {} },
      'Teto mensal (R$)': { number: { format: 'real' } },
      'Mês/Ano': { rich_text: {} }
    }
  });
  dbIds.Orcamento = orcamento.id;
  console.log(`Created: 🎯 Finanças — Orçamento (ID: ${orcamento.id})`);

  // 9. Finanças — Metas
  console.log('Creating: 🌱 Finanças — Metas...');
  const metas = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '🌱 Finanças — Metas' } }],
    properties: {
      'Nome': { title: {} },
      'Valor alvo (R$)': { number: { format: 'real' } },
      'Valor atual (R$)': { number: { format: 'real' } },
      'Prazo': { date: {} },
      'Progresso (%)': {
        formula: {
          expression: 'prop("Valor atual (R$)") / prop("Valor alvo (R$)") * 100'
        }
      },
      'Status': {
        select: {
          options: [
            { name: 'Ativa', color: 'green' },
            { name: 'Pausada', color: 'yellow' },
            { name: 'Concluída', color: 'blue' }
          ]
        }
      },
      'Notas': { rich_text: {} }
    }
  });
  dbIds.Metas = metas.id;
  console.log(`Created: 🌱 Finanças — Metas (ID: ${metas.id})`);

  // --- GROUP B (with relations to group A) ---

  // 10. Tarefas
  console.log('Creating: ✅ Tarefas...');
  const tarefas = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '✅ Tarefas' } }],
    properties: {
      'Título': { title: {} },
      'Status': {
        select: {
          options: [
            { name: 'Backlog', color: 'gray' },
            { name: 'A fazer', color: 'red' },
            { name: 'Em andamento', color: 'blue' },
            { name: 'Concluída', color: 'green' }
          ]
        }
      },
      'Responsável': {
        relation: {
          database_id: dbIds.Pessoas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Visibilidade': {
        select: {
          options: [
            { name: 'Família', color: 'blue' },
            { name: 'Pessoal', color: 'gray' }
          ]
        }
      },
      'Prazo': { date: {} },
      'Área': {
        select: {
          options: [
            { name: 'Casa', color: 'green' },
            { name: 'Saúde', color: 'pink' },
            { name: 'Trabalho', color: 'blue' },
            { name: 'Finanças', color: 'yellow' },
            { name: 'Outros', color: 'gray' }
          ]
        }
      },
      'Prioridade': {
        select: {
          options: [
            { name: 'Alta', color: 'red' },
            { name: 'Média', color: 'yellow' },
            { name: 'Baixa', color: 'blue' }
          ]
        }
      },
      'Notas': { rich_text: {} },
      'Evento relacionado': {
        relation: {
          database_id: dbIds.Eventos,
          type: 'single_property',
          single_property: {}
        }
      }
    }
  });
  dbIds.Tarefas = tarefas.id;
  console.log(`Created: ✅ Tarefas (ID: ${tarefas.id})`);

  // 11. Lista de Compras
  console.log('Creating: 🛒 Lista de Compras...');
  const compras = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '🛒 Lista de Compras' } }],
    properties: {
      'Item': { title: {} },
      'Categoria': {
        select: {
          options: [
            { name: 'Hortifruti', color: 'orange' },
            { name: 'Laticínios', color: 'blue' },
            { name: 'Carnes', color: 'red' },
            { name: 'Limpeza', color: 'green' },
            { name: 'Higiene', color: 'pink' },
            { name: 'Outros', color: 'gray' }
          ]
        }
      },
      'Quantidade': { number: {} },
      'Unidade': {
        select: {
          options: [
            { name: 'un', color: 'blue' },
            { name: 'kg', color: 'green' },
            { name: 'L', color: 'purple' },
            { name: 'cx', color: 'orange' },
            { name: 'pct', color: 'gray' }
          ]
        }
      },
      'Adicionado por': {
        relation: {
          database_id: dbIds.Pessoas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Comprado': { checkbox: {} },
      'Recorrente': { checkbox: {} },
      'Prioridade': {
        select: {
          options: [
            { name: 'Urgente', color: 'red' },
            { name: 'Normal', color: 'blue' },
            { name: 'Se encontrar', color: 'gray' }
          ]
        }
      },
      'Mercado preferido': {
        relation: {
          database_id: dbIds.Mercados,
          type: 'dual_property',
          dual_property: {
            synced_property_name: 'Itens da compra'
          }
        }
      }
    }
  });
  dbIds.Compras = compras.id;
  console.log(`Created: 🛒 Lista de Compras (ID: ${compras.id})`);

  // 12. Cardápio
  console.log('Creating: 🍽️ Cardápio...');
  const cardapio = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '🍽️ Cardápio' } }],
    properties: {
      'Refeição': { title: {} },
      'Tipo': {
        select: {
          options: [
            { name: 'Café', color: 'orange' },
            { name: 'Almoço', color: 'green' },
            { name: 'Jantar', color: 'blue' },
            { name: 'Lanche', color: 'purple' }
          ]
        }
      },
      'Data': { date: {} },
      'Responsável preparo': {
        relation: {
          database_id: dbIds.Pessoas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Feito': { checkbox: {} },
      'Notas': { rich_text: {} },
      'Receita': {
        relation: {
          database_id: dbIds.Receitas,
          type: 'dual_property',
          dual_property: {
            synced_property_name: 'Aparece no cardápio'
          }
        }
      }
    }
  });
  dbIds.Cardapio = cardapio.id;
  console.log(`Created: 🍽️ Cardápio (ID: ${cardapio.id})`);

  // 13. Finanças — Transações
  console.log('Creating: 💸 Finanças — Transações...');
  const transacoes = await notionRequest('databases', 'POST', {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: '💸 Finanças — Transações' } }],
    properties: {
      'Descrição': { title: {} },
      'Valor (R$)': { number: { format: 'real' } },
      'Tipo': {
        select: {
          options: [
            { name: 'Entrada', color: 'green' },
            { name: 'Saída', color: 'red' }
          ]
        }
      },
      'Categoria': {
        select: {
          options: [
            { name: 'Mercado', color: 'orange' },
            { name: 'Moradia', color: 'blue' },
            { name: 'Saúde', color: 'pink' },
            { name: 'Lazer', color: 'green' },
            { name: 'Transporte', color: 'purple' },
            { name: 'Outros', color: 'gray' }
          ]
        }
      },
      'Data': { date: {} },
      'Responsável': {
        relation: {
          database_id: dbIds.Pessoas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Visibilidade': {
        select: {
          options: [
            { name: 'Família', color: 'blue' },
            { name: 'Pessoal', color: 'gray' }
          ]
        }
      },
      'Parcelado': { checkbox: {} },
      'Parcela': { rich_text: {} },
      'Comprovante': { files: {} },
      'Status': {
        select: {
          options: [
            { name: 'Confirmado', color: 'green' },
            { name: 'Previsto', color: 'yellow' }
          ]
        }
      },
      'Conta': {
        relation: {
          database_id: dbIds.Contas,
          type: 'single_property',
          single_property: {}
        }
      },
      'Orçamento': {
        relation: {
          database_id: dbIds.Orcamento,
          type: 'dual_property',
          dual_property: {
            synced_property_name: 'Transações'
          }
        }
      }
    }
  });
  dbIds.Transacoes = transacoes.id;
  console.log(`Created: 💸 Finanças — Transações (ID: ${transacoes.id})`);

  // --- STEP 3: Patch rollups and complex formulas ---
  console.log('Adding rollups and formulas to 🎯 Finanças — Orçamento...');
  await notionRequest(`databases/${dbIds.Orcamento}`, 'PATCH', {
    properties: {
      'Gasto até agora': {
        rollup: {
          relation_property_name: 'Transações',
          rollup_property_name: 'Valor (R$)',
          function: 'sum'
        }
      },
      'Saldo restante': {
        formula: {
          expression: 'prop("Teto mensal (R$)") - prop("Gasto até agora")'
        }
      },
      'Status': {
        formula: {
          expression: 'if(prop("Saldo restante") < 0, "Estourado", if(prop("Saldo restante") < prop("Teto mensal (R$)") * 0.2, "Atenção", "OK"))'
        }
      }
    }
  });
  console.log('Updated: 🎯 Finanças — Orçamento with Rollups & Formulas');

  console.log('--- ALL DATABASES CREATED SUCCESSFULLY ---');
  console.log('Summary of Database IDs:');
  console.log(JSON.stringify(dbIds, null, 2));
}

main().catch(error => {
  console.error('Fatal execution error:', error);
  process.exit(1);
});
