import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './PaginaRelatorioVendas.css'

const CARDAPIO_PIZZAS = [
  { id: 1, sabor: '4 Queijos' },
  { id: 2, sabor: 'Frango' },
  { id: 3, sabor: 'Marguerita' },
  { id: 4, sabor: 'Milho' },
  { id: 5, sabor: 'Presunto e Queijo' },
  { id: 6, sabor: 'Calabresa' }
]

export default function PaginaRelatorioVendas() {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)

  async function buscarDadosRelatorio() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        total,
        status,
        criado_em,
        clientes ( nome, vendedor ),
        itens_pedido ( quantidade, pizza_id )
      `)
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao gerar relatório:', error.message)
    } else {
      setPedidos(data || [])
    }
    setCarregando(false)
  }

  useEffect(() => {
    buscarDadosRelatorio()
  }, [])

  const obterNomeSabor = (pizzaId) => {
    const pizza = CARDAPIO_PIZZAS.find(p => p.id === pizzaId)
    return pizza ? pizza.sabor : `Sabor #${pizzaId}`
  }

  // 📊 SEPARAÇÃO DOS PEDIDOS POR STATUS
  const pedidosEntregues = pedidos.filter(p => p.status === 'Finalizado')
  const pedidosEmProcesso = pedidos.filter(p => p.status === 'Em Processo' || p.status === 'Recebido')

  // 💰 CÁLCULOS FINANCEIROS
  const faturamentoEntregue = pedidosEntregues.reduce((acc, p) => acc + Number(p.total), 0)
  const faturamentoPendente = pedidosEmProcesso.reduce((acc, p) => acc + Number(p.total), 0)
  const faturamentoTotalGeral = faturamentoEntregue + faturamentoPendente

  if (carregando) return <div className="relatorio-loading">Gerando relatório de fechamento... 📊</div>

  return (
    <div className="relatorio-page">
      <div className="relatorio-header">
        <h1>📋 Relatório Geral de Vendas</h1>
        <p>Fechamento de caixa, pizzas produzidas e balanço financeiro do evento</p>
        <button onClick={buscarDadosRelatorio} className="btn-atualizar-relatorio">🔄 Atualizar Dados</button>
      </div>

      {/* CARDS RESUMO DO CAIXA */}
      <div className="relatorio-cards-container">
        <div className="card-relatorio total-geral">
          <h3>Faturamento Bruto Total</h3>
          <p className="valor-destaque">R$ {faturamentoTotalGeral.toFixed(2)}</p>
          <span>Total de {pedidos.length} pedidos registrados</span>
        </div>

        <div className="card-relatorio caixa-entregue">
          <h3>💰 Valor Já Entregue</h3>
          <p className="valor-sucesso">R$ {faturamentoEntregue.toFixed(2)}</p>
          <span>{pedidosEntregues.length} pedidos concluídos</span>
        </div>

        <div className="card-relatorio caixa-pendente">
          <h3>⏳ Valor Em Processo</h3>
          <p className="valor-alerta">R$ {faturamentoPendente.toFixed(2)}</p>
          <span>{pedidosEmProcesso.length} pedidos na cozinha</span>
        </div>
      </div>

      {/* SEÇÃO 1: PEDIDOS EM PROCESSO */}
      <div className="relatorio-secao">
        <div className="secao-titulo-container">
          <h2>⏳ Pedidos em Processo / Aguardando ({pedidosEmProcesso.length})</h2>
        </div>
        
        {pedidosEmProcesso.length === 0 ? (
          <p className="sem-dados-relatorio">Nenhum pedido pendente na fila de produção. 🙌</p>
        ) : (
          <div className="tabela-responsiva">
            <table className="tabela-relatorio">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Pizzas Escolhidas</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidosEmProcesso.map(p => (
                  <tr key={p.id} className="linha-pendente">
                    <td>#{p.id}</td>
                    <td><strong className="nome-destaque">{p.clientes?.nome}</strong></td>
                    <td>{p.clientes?.vendedor}</td>
                    <td>
                      <ul className="lista-pizzas-tabela">
                        {p.itens_pedido?.map((item, idx) => (
                          <li key={idx}>{item.quantidade}x {obterNomeSabor(item.pizza_id)}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="coluna-preco">R$ {Number(p.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SEÇÃO 2: PEDIDOS ENTREGUES */}
      <div className="relatorio-secao" style={{ marginTop: '40px' }}>
        <div className="secao-titulo-container">
          <h2>✅ Pedidos Finalizados / Entregues ({pedidosEntregues.length})</h2>
        </div>

        {pedidosEntregues.length === 0 ? (
          <p className="sem-dados-relatorio">Nenhum pedido finalizado até o momento. 🛵</p>
        ) : (
          <div className="tabela-responsiva">
            <table className="tabela-relatorio">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Pizzas Entregues</th>
                  <th>Total Pago</th>
                </tr>
              </thead>
              <tbody>
                {pedidosEntregues.map(p => (
                  <tr key={p.id} className="linha-finalizada">
                    <td>#{p.id}</td>
                    <td>{p.clientes?.nome}</td>
                    <td>{p.clientes?.vendedor}</td>
                    <td>
                      <ul className="lista-pizzas-tabela">
                        {p.itens_pedido?.map((item, idx) => (
                          <li key={idx}>{item.quantidade}x {obterNomeSabor(item.pizza_id)}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="coluna-preco valor-pago">R$ {Number(p.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
