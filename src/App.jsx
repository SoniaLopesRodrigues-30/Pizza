import { useState } from 'react'
import PaginaCliente from './PaginaCliente.jsx'
import PaginaControleVendas from './PaginaControleVendas.jsx'
import PaginaRelatorioVendas from './PaginaRelatorioVendas.jsx' 

export default function App() {
  // CORREÇÃO: Alterado de 'relatorio' para 'cliente' para abrir por padrão
  const [telaAtiva, setTelaAtiva] = useState('cliente')

  const SENHA_ADMIN = 'pizza123'

  // Função que valida o acesso por senha
  const tentarAcessarAdmin = () => {
    const senhaDigitada = prompt('🔒 Acesso Restrito! Digite a senha de administrador:')
    
    if (senhaDigitada === SENHA_ADMIN) {
      setTelaAtiva('admin') // Entra direto no controle de vendas ao acertar
    } else if (senhaDigitada !== null) {
      alert('❌ Senha inválida! Acesso negado.')
    }
  }

  // Função para deslogar de qualquer painel administrativo por segurança
  const fecharPainelAdmin = () => {
    setTelaAtiva('cliente')
  }

  return (
    <div className="app-main-wrapper" style={{ fontFamily: 'sans-serif' }}>
      
      {/* BARRA DE NAVEGAÇÃO SUPERIOR CONTROLANDO AS TELAS */}
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        padding: '15px',
        backgroundColor: '#2c3e50',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        flexWrap: 'wrap' // Garante que fique bom em telas menores
      }}>
        <button 
          onClick={fecharPainelAdmin}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: telaAtiva === 'cliente' ? '#e74c3c' : '#7f8c8d',
            color: 'white',
            transition: 'background 0.2s'
          }}
        >
          🍕 Dados do Pedido (Cliente)
        </button>
        {/* 🌟 SE ESTIVER LOGADO (ADMIN OU RELATÓRIO), EXIBE OS BOTÕES GERENCIAIS */}
        {(telaAtiva === 'admin' || telaAtiva === 'relatorio') ? (
          <>
            <button 
              onClick={() => setTelaAtiva('admin')}
              style={{
                padding: '10px 20px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: telaAtiva === 'admin' ? '#3498db' : '#546e7a',
                color: 'white',
                transition: 'background 0.2s'
              }}
            >
              👨‍🍳 Cozinha (Controle)
            </button>

            <button 
              onClick={() => setTelaAtiva('relatorio')}
              style={{
                padding: '10px 20px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: telaAtiva === 'relatorio' ? '#e67e22' : '#546e7a',
                color: 'white',
                transition: 'background 0.2s'
              }}
            >
              📊 Financeiro (Relatório)
            </button>

            <button 
              onClick={fecharPainelAdmin}
              style={{
                padding: '10px 20px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#d35400',
                color: 'white',
                transition: 'background 0.2s'
              }}
            >
              🔒 Sair e Trancar
            </button>
          </>
        ) : (
          // SE ESTIVER NA TELA DO CLIENTE, PEDE A SENHA AO CLICAR EM ADMINISTRAÇÃO
          <button 
            onClick={tentarAcessarAdmin}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#7f8c8d',
              color: 'white',
              transition: 'background 0.2s'
            }}
          >
            📊 Controle de Vendas (Admin)
          </button>
        )}
      </nav>

      {/* ÁREA ONDE AS TELAS SÃO EXIBIDAS */}
      <main>
        {telaAtiva === 'cliente' && <PaginaCliente />}
        {telaAtiva === 'admin' && <PaginaControleVendas />}
        {telaAtiva === 'relatorio' && <PaginaRelatorioVendas />}
      </main>

    </div>
  )
}
