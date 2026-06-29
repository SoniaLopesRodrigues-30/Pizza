import { useState } from 'react'
import PaginaCliente from './PaginaCliente.jsx'
import PaginaControleVendas from './PaginaControleVendas'

export default function App() {
  const [telaAtiva, setTelaAtiva] = useState('cliente')

  // 1. CONFISSÃO DA SUA SENHA: Mude para a senha que você preferir usar na pizzaria
  const SENHA_ADMIN = 'pizza123'

  // Função que valida o acesso por senha
  const tentarAcessarAdmin = () => {
    const senhaDigitada = prompt('🔒 Acesso Restrito! Digite a senha de administrador:')
    
    if (senhaDigitada === SENHA_ADMIN) {
      setTelaAtiva('admin')
    } else if (senhaDigitada !== null) {
      alert('❌ Senha inválida! Acesso negado.')
    }
  }

  // Função para deslogar do painel de vendas por segurança
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
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
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
          🍕 Frente de Loja (Cliente)
        </button>

        {telaAtiva === 'admin' ? (
          // SE O GERENTE JÁ ESTIVER LOGADO, MOSTRA O BOTÃO DE SAIR/TRANCAR
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
            🔒 Sair e Trancar Painel
          </button>
        ) : (
          // SE ESTIVER NA TELA DO CLIENTE, PEDE A SENHA AO CLICAR
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
        {telaAtiva === 'cliente' ? <PaginaCliente /> : <PaginaControleVendas />}
      </main>

    </div>
  )
}
