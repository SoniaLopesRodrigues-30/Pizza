import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const CARDAPIO_PIZZAS = [
  { id: 1, sabor: '4 Queijos' },
  { id: 2, sabor: 'Frango' },
  { id: 3, sabor: 'Marguerita' },
  { id: 4, sabor: 'Milho' },
  { id: 5, sabor: 'Presunto e Queijo' },
  { id: 6, sabor: 'Calabresa' }
]

export default function PaginaCadastroProdutos() {
  const [pizzaId, setPizzaId] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [listaIngredientes, setListaIngredientes] = useState([
    { nome: '', quantidade: '', unidade: 'kg' }
  ])

  // 🌟 BUSCA AUTOMÁTICA DE INGREDIENTES AO SELECIONAR O SABOR
  useEffect(() => {
    async function buscarReceitaExistente() {
      if (!pizzaId) {
        // Se resetar o select, deixa apenas uma linha limpa na tela
        setListaIngredientes([{ nome: '', quantidade: '', unidade: 'kg' }])
        return
      }

      const { data, error } = await supabase
        .from('receita_pizzas')
        .select('ingrediente_nome, quantidade_gasta, unidade_medida')
        .eq('pizza_id', Number(pizzaId))

      if (error) {
        console.error('Erro ao buscar receita:', error.message)
        return
      }

      if (data && data.length > 0) {
        // Se já existir receita no banco, preenche a lista dinamicamente na tela
        const receitaFormatada = data.map(item => ({
          nome: item.ingrediente_nome,
          quantidade: item.quantidade_gasta,
          unidade: item.unidade_medida
        }))
        setListaIngredientes(receitaFormatada)
      } else {
        // Se for um sabor novo sem receita, deixa uma linha em branco pronta para digitação
        setListaIngredientes([{ nome: '', quantidade: '', unidade: 'kg' }])
      }
    }

    buscarReceitaExistente()
  }, [pizzaId]) // O useEffect roda toda vez que o pizzaId mudar

  const adicionarNovaLinha = () => {
    setListaIngredientes([...listaIngredientes, { nome: '', quantidade: '', unidade: 'kg' }])
  }

  const removerLinha = (index) => {
    if (listaIngredientes.length === 1) return
    setListaIngredientes(listaIngredientes.filter((_, i) => i !== index))
  }

  const atualizarCampoLinha = (index, campo, valor) => {
    const novasLinhas = [...listaIngredientes]
    novasLinhas[index][campo] = valor
    setListaIngredientes(novasLinhas)
  }

  // Envia os dados atualizados para o banco (deletando os antigos primeiro para não duplicar)
  async function cadastrarReceitaCompleta(e) {
    e.preventDefault()

    if (!pizzaId) {
      alert('⚠️ Por favor, selecione o sabor da pizza.')
      return
    }

    const linhasValidas = listaIngredientes.every(item => item.nome.trim() && item.quantidade)
    if (!linhasValidas) {
      alert('⚠️ Por favor, preencha o nome e a quantidade de todos os ingredientes.')
      return
    }

    const pizzaObjeto = CARDAPIO_PIZZAS.find(p => p.id === Number(pizzaId))
    setSalvando(true)

    // 🌟 ESTRATÉGIA: Deleta o que já existia desse sabor para salvar a nova lista atualizada sem duplicar linhas
    await supabase
      .from('receita_pizzas')
      .delete()
      .eq('pizza_id', Number(pizzaId))

    const dadosParaEnviar = listaIngredientes.map(item => ({
      pizza_id: Number(pizzaId),
      sabor_pizza: pizzaObjeto.sabor,
      ingrediente_nome: item.nome.trim(),
      quantidade_gasta: Number(item.quantidade),
      unidade_medida: item.unidade
    }))

    const { error } = await supabase
      .from('receita_pizzas')
      .insert(dadosParaEnviar)

    setSalvando(false)

    if (error) {
      alert('❌ Erro ao salvar receita: ' + error.message)
    } else {
      alert(`✅ Receita de ${pizzaObjeto.sabor} atualizada com sucesso!`)
      setPizzaId('')
    }
  }
  return (
    <div style={{ padding: '25px', maxWidth: '650px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>📐 Ficha Técnica / Cadastro Dinâmico</h2>
      <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '20px' }}>Selecione um sabor para carregar a receita existente ou criar uma nova</p>

      <form onSubmit={cadastrarReceitaCompleta} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SELEÇÃO DO SABOR DA PIZZA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#34495e' }}>1. Selecione o Sabor da Pizza:</label>
          <select
            value={pizzaId}
            onChange={(e) => setPizzaId(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none', backgroundColor: '#fff' }}
          >
            <option value="">Selecione uma pizza...</option>
            {CARDAPIO_PIZZAS.map(p => (
              <option key={p.id} value={p.id}>{p.sabor}</option>
            ))}
          </select>
        </div>

        {/* LISTA DINÂMICA DE INGREDIENTES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#34495e' }}>2. Ingredientes da Receita:</label>
          
          {listaIngredientes.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {/* Nome do ingrediente */}
              <input
                type="text"
                placeholder="Ex: Queijo Muçarela"
                value={item.nome}
                onChange={(e) => atualizarCampoLinha(index, 'nome', e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', flex: 2, minWidth: '150px', outline: 'none' }}
              />

              {/* Quantidade */}
              <input
                type="number"
                step="0.001"
                placeholder="Qtd: 0.150"
                value={item.quantidade}
                onChange={(e) => atualizarCampoLinha(index, 'quantidade', e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', flex: 1, minWidth: '90px', outline: 'none' }}
              />

              {/* Unidade */}
              <select
                value={item.unidade}
                onChange={(e) => atualizarCampoLinha(index, 'unidade', e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', width: '90px', outline: 'none', backgroundColor: '#fff' }}
              >
                <option value="kg">kg</option>
                <option value="unid">unid</option>
                <option value="litro">litro</option>
                <option value="g">g</option>
              </select>

              {/* Botão para remover linha individual */}
              <button
                type="button"
                onClick={() => removerLinha(index)}
                disabled={listaIngredientes.length === 1}
                style={{
                  padding: '10px 14px',
                  backgroundColor: listaIngredientes.length === 1 ? '#e2e8f0' : '#e74c3c',
                  color: listaIngredientes.length === 1 ? '#94a3b8' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: listaIngredientes.length === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* BOTÃO PARA ADICIONAR MAIS UMA LINHA DE INGREDIENTE */}
        <button
          type="button"
          onClick={adicionarNovaLinha}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 15px',
            backgroundColor: '#34495e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          ➕ Adicionar Mais um Ingrediente
        </button>

        <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />

        {/* BOTÃO FINAL DE SUBMIT EM LOTE */}
        <button
          type="submit"
          disabled={salvando}
          style={{
            padding: '14px',
            backgroundColor: salvando ? '#bdc3c7' : '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: salvando ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {salvando ? 'Salvando Receita...' : '💾 Atualizar Receita Completa'}
        </button>
      </form>
    </div>
  )
}
