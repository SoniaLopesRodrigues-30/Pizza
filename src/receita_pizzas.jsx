import { useState } from 'react'
import { supabase } from './supabaseClient'

// Cardápio de referência alinhado com o restante do seu projeto
const CARDAPIO_PIZZAS = [
  { id: 1, sabor: '4 Queijos' },
  { id: 2, sabor: 'Frango' },
  { id: 3, sabor: 'Marguerita' },
  { id: 4, sabor: 'Milho' },
  { id: 5, sabor: 'Presunto e Queijo' },
  { id: 6, sabor: 'Calabresa' }
]

export default function PaginaCadastroReceita() {
  const [pizzaId, setPizzaId] = useState('')
  const [ingredienteNome, setIngredienteNome] = useState('')
  const [quantidadeGasta, setQuantidadeGasta] = useState('')
  const [unidadeMedida, setUnidadeMedida] = useState('kg')
  const [enviando, setEnviando] = useState(false)

  // Função para salvar o insumo do sabor no Supabase
  async function salvarIngrediente(e) {
    e.preventDefault()

    if (!pizzaId || !ingredienteNome || !quantidadeGasta) {
      alert('⚠️ Por favor, preencha todos os campos obrigatórios.')
      return
    }

    // Encontra o objeto da pizza para capturar o nome do sabor por extenso
    const pizzaObjeto = CARDAPIO_PIZZAS.find(p => p.id === Number(pizzaId))

    setEnviando(true)

    const { error } = await supabase
      .from('receita_pizzas')
      .insert([
        {
          pizza_id: Number(pizzaId),
          sabor_pizza: pizzaObjeto.sabor,
          ingrediente_nome: ingredienteNome.trim(),
          quantidade_gasta: Number(quantidadeGasta),
          unidade_medida: unidadeMedida
        }
      ])

    setEnviando(false)

    if (error) {
      alert('❌ Erro ao salvar ingrediente: ' + error.message)
    } else {
      alert('✅ Ingrediente cadastrado na receita com sucesso!')
      setIngredienteNome('')
      setQuantidadeGasta('')
    }
  }
  return (
    <div style={{ padding: '25px', maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>📐 Cadastro de Receitas</h2>
      <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '20px' }}>Cadastre as quantidades gastas por ingrediente para cada pizza</p>

      <form onSubmit={salvarIngrediente} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* SELEÇÃO DA PIZZA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#34495e' }}>1. Escolha a Pizza:</label>
          <select
            value={pizzaId}
            onChange={(e) => setPizzaId(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }}
          >
            <option value="">Selecione um sabor...</option>
            {CARDAPIO_PIZZAS.map(p => (
              <option key={p.id} value={p.id}>{p.sabor}</option>
            ))}
          </select>
        </div>

        {/* NOME DO INGREDIENTE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#34495e' }}>2. Nome do Ingrediente:</label>
          <input
            type="text"
            placeholder="Ex: Queijo Muçarela, Calabresa, Molho"
            value={ingredienteNome}
            onChange={(e) => setIngredienteNome(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }}
          />
        </div>

        {/* QUANTIDADE E UNIDADE EM LINHA */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#34495e' }}>3. Qtd. Gasta (por Pizza):</label>
            <input
              type="number"
              step="0.001"
              placeholder="Ex: 0.200 ou 1"
              value={quantidadeGasta}
              onChange={(e) => setQuantidadeGasta(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '120px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#34495e' }}>Unidade:</label>
            <select
              value={unidadeMedida}
              onChange={(e) => setUnidadeMedida(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }}
            >
              <option value="kg">kg (Quilo)</option>
              <option value="unid">unid (Unidade)</option>
              <option value="litro">litro (Litro)</option>
              <option value="g">g (Grama)</option>
            </select>
          </div>
        </div>
        
        <small style={{ color: '#95a5a6', fontSize: '0.8rem', marginTop: '-5px' }}>
          💡 Dica: Para 200g, use o padrão de quilos digitando <b>0.200</b> com a unidade <b>kg</b>.
        </small>

        {/* BOTÃO DE SUBMIT */}
        <button
          type="submit"
          disabled={enviando}
          style={{
            padding: '12px',
            backgroundColor: enviando ? '#bdc3c7' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: enviando ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            marginTop: '10px'
          }}
        >
          {enviando ? 'Salvando...' : '💾 Cadastrar Ingrediente'}
        </button>
      </form>
    </div>
  )
}
