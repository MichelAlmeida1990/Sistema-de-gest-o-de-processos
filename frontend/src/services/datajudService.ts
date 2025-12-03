// ===========================================
// SERVIÇO DE INTEGRAÇÃO COM API DATAJUD (CNJ)
// ===========================================

import axios from 'axios'
import config from '../config/env'

const API_BASE_URL = config.API_BASE_URL

export interface ProcessoDataJud {
  numero_processo: string
  numero_cnj: string
  classe_processual: string
  assunto_principal: string
  tribunal: string
  orgao_julgador: string
  autor?: string
  reu?: string
  valor_causa?: number
  data_distribuicao?: string
  ultima_movimentacao?: {
    data: string
    descricao: string
    tipo: string
  }
  status: string
  grau_jurisdicao: string
}

export interface ConsultaProcessoResponse {
  sucesso: boolean
  dados?: ProcessoDataJud
  erro?: string
}

export interface ConsultaDocumentoResponse {
  sucesso: boolean
  processos: ProcessoDataJud[]
  total: number
  erro?: string
}

export interface TribunaisResponse {
  sucesso: boolean
  tribunais: any[]
  total: number
}

export interface TesteConexaoResponse {
  sucesso: boolean
  mensagem: string
  teste_realizado: boolean
  resultado_teste: boolean
}

export interface InfoApiResponse {
  nome: string
  descricao: string
  url_base: string
  fonte: string
  funcionalidades: string[]
  limitacoes: string[]
  status: string
}

class DataJudService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/datajud`,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Interceptor para adicionar token de autenticação
  constructor() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Erro na API DataJud:', error)
        
        // Só redirecionar para login se realmente for erro de autenticação
        if (error.response?.status === 401) {
          console.log('Token expirado ou inválido, redirecionando para login')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          // Temporariamente desabilitado para debug
          // window.location.href = '/login'
        }
        
        return Promise.reject(error)
      }
    )
  }

  /**
   * Consulta um processo específico pelo número CNJ
   */
  async consultarProcesso(numeroProcesso: string): Promise<ConsultaProcessoResponse> {
    try {
      const response = await this.api.get(`/process/${numeroProcesso}`)
      return response.data
    } catch (error: any) {
      console.error('Erro ao consultar processo:', error)
      return {
        sucesso: false,
        erro: error.response?.data?.detail || 'Erro ao consultar processo'
      }
    }
  }

  /**
   * Consulta processos por CPF ou CNPJ
   */
  async consultarPorDocumento(documento: string): Promise<ConsultaDocumentoResponse> {
    try {
      const response = await this.api.get(`/search/document/${documento}`, {
        params: { documento }
      })
      return response.data
    } catch (error: any) {
      console.error('Erro ao consultar por documento:', error)
      return {
        sucesso: false,
        processos: [],
        total: 0,
        erro: error.response?.data?.detail || 'Erro ao consultar por documento'
      }
    }
  }

  /**
   * Lista todos os tribunais disponíveis
   */
  async listarTribunais(): Promise<TribunaisResponse> {
    try {
      const response = await this.api.get('/tribunals')
      return response.data
    } catch (error: any) {
      console.error('Erro ao listar tribunais:', error)
      return {
        sucesso: false,
        tribunais: [],
        total: 0
      }
    }
  }

  /**
   * Testa a conexão com a API DataJud
   */
  async testarConexao(): Promise<TesteConexaoResponse> {
    try {
      const response = await this.api.get('/status')
      return {
        sucesso: response.data.status === 'active',
        mensagem: response.data.message,
        teste_realizado: true,
        resultado_teste: response.data.status === 'active'
      }
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error)
      return {
        sucesso: false,
        mensagem: 'Erro ao testar conexão com DataJud',
        teste_realizado: false,
        resultado_teste: false
      }
    }
  }

  /**
   * Buscar processo por número
   */
  async buscarProcesso(numeroProcesso: string): Promise<any> {
    try {
      const response = await this.api.get(`/process/${numeroProcesso}`)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar processo:', error)
      throw error
    }
  }

  /**
   * Buscar movimentações do processo
   */
  async buscarMovimentacoes(numeroProcesso: string): Promise<any> {
    try {
      const response = await this.api.get(`/process/${numeroProcesso}/movements`)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar movimentações:', error)
      throw error
    }
  }

  /**
   * Buscar processos por CPF/CNPJ
   */
  async buscarPorDocumento(documento: string): Promise<any> {
    try {
      const response = await this.api.get(`/search/document/${documento}`)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar por documento:', error)
      throw error
    }
  }

  /**
   * Validar número de processo
   */
  async validarNumeroProcesso(numeroProcesso: string): Promise<any> {
    try {
      const response = await this.api.post('/validate/process-number', { process_number: numeroProcesso })
      return response.data
    } catch (error: any) {
      console.error('Erro ao validar número:', error)
      throw error
    }
  }

  /**
   * Retorna informações sobre a API DataJud
   */
  async obterInformacoes(): Promise<any> {
    try {
      const response = await this.api.get('/api-info')
      return response.data
    } catch (error: any) {
      console.error('Erro ao obter informações:', error)
      throw error
    }
  }

  /**
   * Buscar processos por classe processual
   */
  async buscarPorClasse(classeProcessual: string, tribunal?: string): Promise<any> {
    try {
      const url = `/search/class/${encodeURIComponent(classeProcessual)}${tribunal ? `?tribunal=${tribunal}` : ''}`
      const response = await this.api.get(url)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar por classe:', error)
      throw error
    }
  }

  /**
   * Buscar estatísticas de tribunal
   */
  async buscarEstatisticasTribunal(tribunal: string): Promise<any> {
    try {
      const response = await this.api.get(`/statistics/tribunal/${tribunal}`)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  /**
   * Buscar movimentações detalhadas
   */
  async buscarMovimentacoesDetalhadas(numeroProcesso: string): Promise<any> {
    try {
      const response = await this.api.get(`/process/${numeroProcesso}/movements/detailed`)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar movimentações detalhadas:', error)
      throw error
    }
  }

  /**
   * Buscar processos por documento (versão detalhada)
   */
  async buscarPorDocumentoDetalhado(documento: string): Promise<any> {
    try {
      const response = await this.api.get(`/search/document/${documento}/detailed`)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar por documento detalhado:', error)
      throw error
    }
  }

  /**
   * Obter classes processuais
   */
  async obterClassesProcessuais(): Promise<any> {
    try {
      const response = await this.api.get('/tables/classes')
      return response.data
    } catch (error: any) {
      console.error('Erro ao obter classes:', error)
      throw error
    }
  }

  /**
   * Obter assuntos processuais
   */
  async obterAssuntosProcessuais(): Promise<any> {
    try {
      const response = await this.api.get('/tables/subjects')
      return response.data
    } catch (error: any) {
      console.error('Erro ao obter assuntos:', error)
      throw error
    }
  }

  /**
   * Valida formato do número do processo CNJ (versão síncrona)
   */
  validarFormatoNumero(numero: string): boolean {
    // Remove formatação
    const numeroLimpo = numero.replace(/\D/g, '')
    
    // Verifica se tem 20 dígitos
    if (numeroLimpo.length !== 20) {
      return false
    }
    
    // Valida formato: NNNNNNN-DD.AAAA.J.TR.OOOO
    const regex = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/
    return regex.test(numero)
  }

  /**
   * Valida CPF ou CNPJ
   */
  validarDocumento(documento: string): boolean {
    const documentoLimpo = documento.replace(/\D/g, '')
    return documentoLimpo.length === 11 || documentoLimpo.length === 14
  }

  /**
   * Formata número do processo para exibição
   */
  formatarNumeroProcesso(numero: string): string {
    const numeroLimpo = numero.replace(/\D/g, '')
    
    if (numeroLimpo.length === 20) {
      return `${numeroLimpo.slice(0, 7)}-${numeroLimpo.slice(7, 9)}.${numeroLimpo.slice(9, 13)}.${numeroLimpo.slice(13, 14)}.${numeroLimpo.slice(14, 16)}.${numeroLimpo.slice(16, 20)}`
    }
    
    return numero
  }

  /**
   * Formata CPF ou CNPJ para exibição
   */
  formatarDocumento(documento: string): string {
    const documentoLimpo = documento.replace(/\D/g, '')
    
    if (documentoLimpo.length === 11) {
      // CPF: 000.000.000-00
      return `${documentoLimpo.slice(0, 3)}.${documentoLimpo.slice(3, 6)}.${documentoLimpo.slice(6, 9)}-${documentoLimpo.slice(9, 11)}`
    } else if (documentoLimpo.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return `${documentoLimpo.slice(0, 2)}.${documentoLimpo.slice(2, 5)}.${documentoLimpo.slice(5, 8)}/${documentoLimpo.slice(8, 12)}-${documentoLimpo.slice(12, 14)}`
    }
    
    return documento
  }

  /**
   * Converte dados do DataJud para formato do sistema
   */
  converterParaProcessoSistema(dados: ProcessoDataJud): any {
    return {
      title: `${dados.classe_processual} - ${dados.assunto_principal}`,
      description: `Processo consultado via DataJud CNJ. Tribunal: ${dados.tribunal}. Órgão julgador: ${dados.orgao_julgador}.`,
      process_number: dados.numero_processo,
      client_name: dados.autor || dados.reu || 'Não informado',
      client_document: '', // Não disponível na API DataJud
      status: this.mapearStatusDataJud(dados.status),
      priority: 'medium',
      estimated_value: dados.valor_causa,
      category: this.mapearCategoriaDataJud(dados.classe_processual),
      tribunal: dados.tribunal,
      orgao_julgador: dados.orgao_julgador,
      classe_processual: dados.classe_processual,
      assunto_principal: dados.assunto_principal,
      data_distribuicao: dados.data_distribuicao,
      ultima_movimentacao: dados.ultima_movimentacao,
      fonte: 'DataJud CNJ',
      dados_originais: dados
    }
  }

  /**
   * Mapeia status do DataJud para status do sistema
   */
  private mapearStatusDataJud(status: string): string {
    const mapeamento: { [key: string]: string } = {
      'Julgado': 'completed',
      'Arquivado': 'archived',
      'Suspenso': 'paused',
      'Em Andamento': 'active'
    }
    
    return mapeamento[status] || 'active'
  }

  /**
   * Mapeia classe processual para categoria do sistema
   */
  private mapearCategoriaDataJud(classe: string): string {
    const classeLower = classe.toLowerCase()
    
    if (classeLower.includes('trabalh') || classeLower.includes('rescis')) {
      return 'Trabalhista'
    } else if (classeLower.includes('criminal') || classeLower.includes('penal')) {
      return 'Criminal'
    } else if (classeLower.includes('civil') || classeLower.includes('danos')) {
      return 'Civil'
    } else if (classeLower.includes('família') || classeLower.includes('divórcio') || classeLower.includes('divorcio')) {
      return 'Família'
    } else if (classeLower.includes('previdenci') || classeLower.includes('aposentadoria')) {
      return 'Previdenciário'
    } else if (classeLower.includes('consumidor') || classeLower.includes('consumidor')) {
      return 'Consumidor'
    }
    
    return 'Outros'
  }
}

// Instância singleton do serviço
export const datajudService = new DataJudService()
export default datajudService
