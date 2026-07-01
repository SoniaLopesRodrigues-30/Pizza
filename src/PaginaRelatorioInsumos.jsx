import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function PaginaRelatorioInsumos() {
  const [insumos, setInsumos] = useState([])
  const [carregando, setCarregando] = useState(true)

  // Função que chama o cálculo de gastos direto do banco de dados
  async function carregarRelatorioInsumos() {
    setCarregando(true)
    
    // Executa a função RPC criada no SQL Editor
    const { data, error } = await supabase.rpc('calcular_total_insumos')

    if (error) {
      console.error('Erro ao gerar relatório de insumos:', error.message)
    } else {
      setInsumos(data || [])
    }
    setCarregando(false)
  }

  // Carrega os dados sempre que a página for aberta
  useEffect(() => {
    carregarRelatorioInsumos()
  }, [])

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'sans-serif' }}>
        <h3>Calculando gastos de ingredientes... 🧮</h3>
      </div>
    )
  }
  return (
    <div style={{ padding: '25px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '2px solid #34495e', paddingBottom: '10px' }}>
        <h2 style={{ color: '#2c3e50', margin: 0 }}>📊 Relatório Geral de Insumos Gastos</h2>
        <button 
          onClick={carregarRelatorioInsumos}
          style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔄 Atualizar
        </button>
      </div>
      <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '20px' }}>
        Abaixo está a soma total de materiais utilizados considerando <b>todos os pedidos</b> cadastrados no sistema.
      </p>

      {insumos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#95a5a6', padding: '20px' }}>Nenhum ingrediente gasto até o momento. 🔎</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 10px', color: '#64748b', fontWeight: '600' }}>Ingrediente</th>
                <th style={{ padding: '12px 10px', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>Total Gasto Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #edf2f7', transition: 'background 0.2s' }}>
                  <td style={{ padding: '12px 10px', color: '#1e293b', fontWeight: '500' }}>
                    {item.ingrediente}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#e74c3c', fontWeight: 'bold', textAlign: 'right', fontSize: '1.1rem' }}>
                    {Number(item.total_gasto).toFixed(3)} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>{item.unidade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
