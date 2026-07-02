import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './PaginaControleVendas.css'

// Cardápio de referência sincronizado com a PaginaCliente
const CARDAPIO_PIZZAS = [
  { id: 1, sabor: '4 Queijos' },
  { id: 2, sabor: 'Frango' },
  { id: 3, sabor: 'Marguerita' },
  { id: 4, sabor: 'Milho' },
  { id: 5, sabor: 'Presunto e Queijo' },
  { id: 6, sabor: 'Calabresa' }
]

export default function PaginaControleVendas() {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('') 
  const [limpando, setLimpando] = useState(false)

  // BUSCAR PEDIDOS E SEUS DETALHES RELACIONADOS
  async function buscarPedidos() {
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
      console.error('Erro ao buscar vendas:', error.message)
    } else {
      setPedidos(data || [])
    }
    setCarregando(false)
  }

  useEffect(() => {
    buscarPedidos()

    const canal = supabase
      .channel('controle-vendas-realtime')
      .on('postgres_changes', { event: '*', pattern: 'public', table: 'pedidos' }, () => {
        buscarPedidos()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  // ALTERAR STATUS DA PRODUÇÃO/VENDA
  async function alterarStatus(pedidoId, novoStatus) {
    const { error } = await supabase
      .from('pedidos')
      .update({ status: novoStatus })
      .eq('id', pedidoId)

    if (error) {
      alert('Erro ao atualizar status: ' + error.message)
    } else {
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p))
    }
  }

  const obterNomeSabor = (pizzaId) => {
    const pizza = CARDAPIO_PIZZAS.find(p => p.id === pizzaId)
    return pizza ? pizza.sabor : `Sabor #${pizzaId}`
  }

  // 🌟 FUNÇÃO QUE DELETA TODOS OS PEDIDOS LOGO APÓS DUPLA CONFIRMAÇÃO
  async function limparTodosOsPedidos() {
    const confirmarPrimeiro = window.confirm(
      "🚨 ALERTA GERAL: Você tem certeza absoluta de que deseja APAGAR TODOS os pedidos cadastrados no sistema?"
    )
    if (!confirmarPrimeiro) return

    const confirmarSegundo = window.confirm(
      "⚠️ ATENÇÃO: Esta ação vai zerar o painel da cozinha, o caixa e todo o faturamento acumulado de forma definitiva! Confirma mesmo?"
    )
    if (!confirmarSegundo) return

    setLimpando(true)

    // 1. Limpa os itens de todos os pedidos primeiro (evita erro de foreign key)
    const { error: erroItens } = await supabase
      .from('itens_pedido')
      .delete()
      .gte('id', 0)

    if (erroItens) {
      alert('❌ Erro ao limpar itens dos pedidos: ' + erroItens.message)
      setLimpando(false)
      return
    }

    // 2. Limpa a tabela principal de pedidos
    const { error: erroPedidos } = await supabase
      .from('pedidos')
      .delete()
      .gte('id', 0)

    setLimpando(false)

    if (erroPedidos) {
      alert('❌ Erro ao limpar o histórico de pedidos: ' + erroPedidos.message)
    } else {
      alert('🗑️ Todos os pedidos foram apagados e o painel foi zerado com sucesso!')
      buscarPedidos()
    }
  }

  // FILTRAGEM DINÂMICA PELO NOME DO CLIENTE
  const pedidosFiltrados = pedidos.filter(pedido => {
    const nomeCliente = pedido.clientes?.nome?.toLowerCase() || ''
    return nomeCliente.includes(busca.toLowerCase())
  })

  // FATURAMENTO TOTAL ACUMULADO
  const faturamentoTotal = pedidos.reduce((acc, p) => acc + Number(p.total), 0)

  // ================= CÁLCULO DOS INSUMOS E SABORES =================
  const contagemSabores = CARDAPIO_PIZZAS.reduce((acc, pizza) => {
    acc[pizza.sabor] = 0
    return acc
  }, {})

  let totalPizzasVendidas = 0

  pedidos.forEach(pedido => {
    pedido.itens_pedido?.forEach(item => {
      const nomeSabor = obterNomeSabor(item.pizza_id)
      const qtd = Number(item.quantidade) || 0
      
      if (contagemSabores[nomeSabor] !== undefined) {
        contagemSabores[nomeSabor] += qtd
      }
      totalPizzasVendidas += qtd
    })
  })
  // =================================================================

  if (carregando) return <div className="controle-loading">Carregando Controle de Vendas... 📈</div>
  return (
    <div className="controle-page">
      {/* CABEÇALHO COM TÍTULO E BOTÃO DE LIMPEZA EM LINHA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e293b' }}>📊 Painel de Controle de Vendas</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Acompanhe pedidos, mude o status da produção e monitore o caixa</p>
        </div>
        
        <button
          onClick={limparTodosOsPedidos}
          disabled={limpando}
          style={{
            padding: '12px 18px',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            cursor: limpando ? 'not-allowed' : 'pointer',
            backgroundColor: '#e74c3c',
            color: 'white',
            boxShadow: '0 2px 4px rgba(231, 76, 60, 0.2)',
            transition: 'background 0.2s',
          }}
        >
          {limpando ? 'Limpando Painel...' : '🗑️ Limpar Todos os Pedidos'}
        </button>
      </div>

      <div className="controle-container">
        {/* CARD DO CAIXA E FATURAMENTO */}
        <div className="card-caixa">
          <h3>Faturamento das Vendas</h3>
          <p className="caixa-valor">R$ {faturamentoTotal.toFixed(2)}</p>
          <span>Total de {pedidos.length} pedidos finalizados ou em andamento</span>
        </div>

        {/* CAMPO VISUAL DE BUSCA PELO NOME */}
        <div className="busca-container" style={{ marginBottom: '25px' }}>
          <input
            type="text"
            placeholder="🔍 Procurar pedido pelo nome do cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '1rem',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* 📊 SEÇÃO DE CONSUMO DE MATERIAIS / QUANTIDADE POR SABOR */}
        <div className="relatorio-secao" style={{ marginTop: '20px', backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '1.3rem', borderBottom: '2px solid #34495e', paddingBottom: '8px' }}>
            📦 Total de Pizzas Produzidas / Insumos
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            {CARDAPIO_PIZZAS.map(pizza => {
              const quantidade = contagemSabores[pizza.sabor] || 0
              return (
                <div key={pizza.id} style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #3498db', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>{pizza.sabor}</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>
                    {quantidade} <small style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#94a3b8' }}>unid.</small>
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '15px 20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
            <span>Total Geral de Pizzas:</span>
            <span style={{ fontSize: '1.4rem', color: '#f1c40f' }}>{totalPizzasVendidas} unidades</span>
          </div>
        </div>

        <h2>Fluxo de Pedidos Ativos</h2>

        {pedidosFiltrados.length === 0 ? (
          <p className="sem-vendas">Nenhum pedido encontrado para esta busca. 🔎</p>
        ) : (
          <div className="grid-vendas">
            {pedidosFiltrados.map(pedido => (
              <div key={pedido.id} className={`card-venda status-${pedido.status.toLowerCase().replace(' ', '-')}`}>
                <div className="venda-header">
                  <span className="venda-id">Pedido #{pedido.id}</span>
                  <span className="venda-status-badge">{pedido.status}</span>
                </div>

                <div className="venda-corpo">
                  <p><strong>Cliente:</strong> {pedido.clientes?.nome || 'Não informado'}</p>
                  <p><strong>Vendedor:</strong> {pedido.clientes?.vendedor || 'Não informado'}</p>
                  
                  <div className="venda-sabores">
                    <strong>Pizzas Escolhidas:</strong>
                    <ul>
                      {pedido.itens_pedido?.map((item, idx) => (
                        <li key={idx}>
                          {item.quantidade}x {obterNomeSabor(item.pizza_id)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="venda-footer">
                  <span className="venda-total">R$ {Number(pedido.total).toFixed(2)}</span>
                  
                  <div className="venda-acoes">
                    {pedido.status === 'Recebido' && (
                      <button onClick={() => alterarStatus(pedido.id, 'Em Processo')} className="btn-controle preparo">
                        👨‍🍳 Em Processo
                      </button>
                    )}
                    
                    {pedido.status === 'Em Processo' && (
                      <button 
                        onClick={() => alterarStatus(pedido.id, 'Finalizado')} 
                        className="btn-controle"
                        style={{
                          backgroundColor: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 14px',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        🛵 Finalizado / Entregue
                      </button>
                    )}
                    
                    {pedido.status === 'Finalizado' && (
                      <span className="venda-concluida" style={{ color: '#27ae60', fontWeight: 'bold' }}>
                        Concluído 🎉
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
