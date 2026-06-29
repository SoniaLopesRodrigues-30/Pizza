import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './PaginaControleVendas.css'

// Cardápio de referência para sabermos o nome do sabor pelo ID
const CARDAPIO_PIZZAS = [
  { id: 1, sabor: '4 Queijos' },
  { id: 2, sabor: 'Frango' },
  { id: 3, sabor: 'Marguerita' },
  { id: 4, sabor: 'Presunto e Queijo' },
  { id: 5, sabor: 'Calabresa' }
]

export default function PaginaControleVendas() {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)

  // 1. BUSCAR PEDIDOS E SEUS DETALHES RELACIONADOS
  async function buscarPedidos() {
    setCarregando(true)
    
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        total,
        status,
        criado_em,
        clientes ( nome, telefone, vendedor ),
        itens_pedido ( quantidade, pizza_id )
      `)
      .order('criado_em', { ascending: false }) // Mais recentes no topo

    if (error) {
      console.error('Erro ao buscar vendas:', error.message)
    } else {
      setPedidos(data || [])
    }
    setCarregando(false)
  }

  useEffect(() => {
    buscarPedidos()

    // 2. ESCUTA EM TEMPO REAL (Se entrar pedido novo, a tela atualiza sozinha)
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

  // 3. ALTERAR STATUS DA PRODUÇÃO/VENDA
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

  // 4. AUXILIAR: Encontra o nome do sabor usando o pizza_id vindo do banco
  const obterNomeSabor = (pizzaId) => {
    const pizza = CARDAPIO_PIZZAS.find(p => p.id === pizzaId)
    return pizza ? pizza.sabor : `Sabor #${pizzaId}`
  }

  // 5. FATURAMENTO TOTAL ACUMULADO
  const faturamentoTotal = pedidos.reduce((acc, p) => acc + Number(p.total), 0)

  if (carregando) return <div className="controle-loading">Carregando Controle de Vendas... 📈</div>

  return (
    <div className="controle-page">
      <div className="controle-header">
        <h1>📊 Painel de Controle de Vendas</h1>
        <p>Acompanhe pedidos, mude o status da produção e monitore o caixa</p>
      </div>

      <div className="controle-container">
        {/* CARD DO CAIXA E FATURAMENTO */}
        <div className="card-caixa">
          <h3>Faturamento das Vendas</h3>
          <p className="caixa-valor">R$ {faturamentoTotal.toFixed(2)}</p>
          <span>Total de {pedidos.length} pedidos finalizados ou em andamento</span>
        </div>

        <h2>Fluxo de Pedidos Ativos</h2>

        {pedidos.length === 0 ? (
          <p className="sem-vendas">Nenhuma venda registrada até o momento. 😴</p>
        ) : (
          <div className="grid-vendas">
            {pedidos.map(pedido => (
              <div key={pedido.id} className={`card-venda status-${pedido.status.toLowerCase().replace(' ', '-')}`}>
                <div className="venda-header">
                  <span className="venda-id">Pedido #{pedido.id}</span>
                  <span className="venda-status-badge">{pedido.status}</span>
                </div>

                <div className="venda-corpo">
                  <p><strong>Cliente:</strong> {pedido.clientes?.nome || 'Não informado'}</p>
                  <p><strong>Telefone:</strong> {pedido.clientes?.telefone || 'Não informado'}</p>
                  <p><strong>Vendedor:</strong> {pedido.clientes?.vendedor || 'Não informado'}</p>
                  
                  {/* EXIBIÇÃO DOS SABORES ESCOLHIDOS */}
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
                      <button onClick={() => alterarStatus(pedido.id, 'Em Preparo')} className="btn-controle preparo">👨‍🍳 Preparar</button>
                    )}
                    {pedido.status === 'Em Preparo' && (
                      <button onClick={() => alterarStatus(pedido.id, 'Finalizado')} className="btn-controle pronto">✅ Finalizar</button>
                    )}
                    {pedido.status === 'Finalizado' && (
                      <span className="venda-concluida">Pronto / Entregue 🛵</span>
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
