import { useState } from 'react'
import { supabase } from './supabaseClient'
import './PaginaCliente.css'
import logoCentro from '/logoCentro.png' 

const CARDAPIO_PIZZAS = [
  { id: 1, sabor: '4 Queijos', preco: 35.00 },
  { id: 2, sabor: 'Frango',  preco: 35.00 },
  { id: 3, sabor: 'Marguerita', preco: 35.00 },
  { id: 4, sabor: 'Milho', preco: 35.00 },
  { id: 5, sabor: 'Presunto e Queijo', preco: 35.00 },
  { id: 6, sabor: 'Calabresa', preco: 35.00 }
]

// 1. LISTA FIXA DE VENDEDORES (Edite ou adicione nomes aqui)
const VENDEDORES = ['Adriana (Drica)','Ângela',  'Katia', 'Nega', 'Rose','Sérgio','Sônia','Suelena' ]

export default function PaginaCliente() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [vendedor, setVendedor] = useState('') // Começa vazio para forçar a escolha  
  const [quantidades, setQuantidades] = useState(
    CARDAPIO_PIZZAS.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
  )

  const alterarQuantidade = (id, operacao) => {
    setQuantidades(prev => {
      const atual = prev[id] || 0
      const novaQtd = operacao === 'mais' ? atual + 1 : Math.max(0, atual - 1)
      return { ...prev, [id]: novaQtd }
    })
  }

  const totalItens = CARDAPIO_PIZZAS.reduce((acc, p) => acc + (quantidades[p.id] || 0), 0)
  const precoUnitarioAtual = totalItens >= 4 ? 32.50 : 35.00
  const valorTotalExibicao = totalItens * precoUnitarioAtual

    async function EnviarPedidoCliente(e) {
    e.preventDefault()
    
    const itensSelecionados = CARDAPIO_PIZZAS
      .filter(p => quantidades[p.id] > 0)
      .map(p => ({
        pizza_id: p.id,
        sabor_copia: p.sabor,
        quantidade: quantidades[p.id],
        preco_unitario: precoUnitarioAtual
      }))

    if (itensSelecionados.length === 0) {
      return alert('Por favor, adicione pelo menos 1 pizza ao seu pedido!')
    }

    if (!nome || !vendedor ) {
      return alert('Por favor, preencha todos os campos de identificação!')
    }

    const valorTotalBanco = itensSelecionados.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0)

    // 1. Salva o Cliente incluindo o campo telefone
    const { data: clienteData, error: errC } = await supabase
      .from('clientes')
      .insert([{ nome, vendedor, telefone }]) // Campo adicionado aqui
      .select(); 
    if (errC) return alert('Erro ao salvar os dados: ' + errC.message);
    if (!clienteData || clienteData.length === 0) return alert('Erro: Cliente não foi retornado pelo banco.');
    
    const cliente = clienteData[0]; 

    // 2. Salva o Pedido
    const { data: pedidoData, error: errP } = await supabase
      .from('pedidos')
      .insert([{ cliente_id: cliente.id, total: valorTotalBanco, status: 'Recebido' }])
      .select();

    if (errP) return alert('Erro ao criar pedido: ' + errP.message);
    if (!pedidoData || pedidoData.length === 0) return alert('Erro: Pedido não foi retornado pelo banco.');

    const pedido = pedidoData[0];

    // 3. Insere os itens
    const itensParaInserir = itensSelecionados.map(item => ({
      pedido_id: pedido.id,
      pizza_id: item.pizza_id,
      quantidade: item.quantidade
    }))

    const { error: errI } = await supabase
      .from('itens_pedido')
      .insert(itensParaInserir)

    if (errI) return alert('Erro ao registrar os sabores: ' + errI.message)

    alert('🍕 Pedido cadastrado com sucesso!')
    
    setNome('')    
    setTelefone('') // Limpa o telefone
    setVendedor('') 
    setQuantidades(CARDAPIO_PIZZAS.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}))
  }


      return (
    <div className="cliente-page">
      <div className="banner-pizzaria">
        <img src="/logoCentro.png" alt="Logo Pizza Solidária" className="logo-pizzaria" />              
      </div>

      {/* 🌟 NOVO BLOCO DO FOLDER DE ANÚNCIO */}
      <div className="folder-anuncio-container">
        <div className="folder-card">          
          <img 
            src="/anuncio.png" 
            alt="Cartaz de Vendas Pizza Solidária" 
            className="img-folder" 
          />
          <p className="folder-legenda">Toque ou clique na imagem para ampliar se necessário.</p>
        </div>
      </div>

      <div className="cliente-container">
        <h2>Novo Pedido</h2>        
        <form onSubmit={EnviarPedidoCliente} className="form-cliente">
          <div className="dados-entrega">
            <h3>Identificação:</h3>
            
            <div className="input-group">
              <label>Nome do Cliente:</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Digite seu nome aqui!" required />
            </div>            

            
            <div className="input-group">
              <label>Vendedor responsável:</label>
              <select 
                value={vendedor} 
                onChange={e => setVendedor(e.target.value)} 
                required
                style={{
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="" disabled>-- Selecione o atendente --</option>
                {VENDEDORES.map((v, index) => (
                  <option key={index} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cardapio-selecao">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Escolha as Pizzas e Quantidades:</h3>
              {totalItens >= 4 && (
                <span style={{ backgroundColor: '#2ecc71', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  🔥 Desconto Ativado!
                </span>
              )}
            </div>

            {CARDAPIO_PIZZAS.map(p => (
              <div key={p.id} className="pizza-item-linha">
                <div className="pizza-info">
                  <span className="pizza-sabor">{p.sabor}</span>                  
                  <span className="pizza-preco">R$ {precoUnitarioAtual.toFixed(2)}</span>
                </div>
                
                <div className="contador-container">
                  <button type="button" onClick={() => alterarQuantidade(p.id, 'menos')} className="btn-contador">-</button>
                  <span className="numero-quantidade">{quantidades[p.id]}</span>
                  <button type="button" onClick={() => alterarQuantidade(p.id, 'mais')} className="btn-contador">+</button>
                </div>
              </div>
            ))}
          </div>

          {/* BLOCO DE RESUMO DOS TOTAIS */}
          {totalItens > 0 && (
            <div className="resumo-pedido-container" style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '12px',
              border: '2px dashed #e74c3c',
              marginTop: '15px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: '#2c3e50', borderBottom: 'none', paddingBottom: 0 }}>
                🛒 Resumo do Pedido {totalItens >= 4 && <span style={{ color: '#2ecc71', fontSize: '0.9rem' }}>(Preço Promocional)</span>}
              </h3>
              
              {CARDAPIO_PIZZAS.filter(p => quantidades[p.id] > 0).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#555' }}>
                  <span>{quantidades[p.id]}x {p.sabor}</span>
                  <span>R$ {(precoUnitarioAtual * quantidades[p.id]).toFixed(2)}</span>
                </div>
              ))}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 'bold', 
                fontSize: '1.2rem', 
                borderTop: '1px solid #e2e8f0', 
                paddingTop: '10px',
                marginTop: '5px',
                color: '#2c3e50'
              }}>
                <span>Total Geral:</span>
                <span style={{ color: '#e74c3c' }}>R$ {valorTotalExibicao.toFixed(2)}</span>
              </div>
            </div>
          )}
 
          <button type="submit" className="btn-enviar-pedido">
            Finalizar e Salvar Pedido 🚀
          </button>
        </form>
      </div>
    </div>
  )
}
