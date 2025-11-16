import apiService from './api';

export interface IndiceEconomico {
  codigo: string;
  nome: string;
  descricao: string;
  codigo_bcb: number;
}

export interface ValorIndice {
  data: string;
  valor: number;
}

export interface CalculoAtualizacao {
  sucesso: boolean;
  valor_origem: number;
  valor_atualizado: number;
  fator_atualizacao: number;
  indice_usado: string;
  data_base: string;
  data_atualizacao: string;
  valor_indice_base: number;
  valor_indice_atual: number;
  variacao_percentual: number;
  erro?: string;
}

export interface CalculoAtualizacaoAcumulada extends CalculoAtualizacao {
  historico: Array<{
    data: string;
    valor_indice: number;
    valor_atualizado: number;
    variacao_mensal: number;
  }>;
  total_meses: number;
}

class IndicesEconomicosService {
  private baseUrl = '/api/v1/indices-economicos';

  async getStatus() {
    const response = await apiService.get(`${this.baseUrl}/status`);
    return response.data;
  }

  async getIndicesDisponiveis(): Promise<IndiceEconomico[]> {
    const response = await apiService.get(`${this.baseUrl}/disponiveis`);
    return response.data.indices;
  }

  async consultarIndice(
    indice: string,
    dataInicio?: string,
    dataFim?: string
  ): Promise<ValorIndice[]> {
    const params = new URLSearchParams();
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);

    const response = await apiService.get(
      `${this.baseUrl}/${indice}?${params.toString()}`
    );
    return response.data.dados;
  }

  async obterValorIndice(indice: string, data: string): Promise<number> {
    const response = await apiService.get(
      `${this.baseUrl}/${indice}/valor/${data}`
    );
    return response.data.valor;
  }

  async calcularAtualizacao(
    valorOrigem: number,
    dataBase: string,
    dataAtualizacao?: string,
    indice: string = 'IPCA_E'
  ): Promise<CalculoAtualizacao> {
    const response = await apiService.post(`${this.baseUrl}/calcular-atualizacao`, {
      valor_origem: valorOrigem,
      data_base: dataBase,
      data_atualizacao: dataAtualizacao,
      indice: indice,
    });
    return response.data;
  }

  async calcularAtualizacaoAcumulada(
    valorOrigem: number,
    dataBase: string,
    dataAtualizacao?: string,
    indice: string = 'IPCA_E'
  ): Promise<CalculoAtualizacaoAcumulada> {
    const response = await apiService.post(
      `${this.baseUrl}/calcular-atualizacao-acumulada`,
      {
        valor_origem: valorOrigem,
        data_base: dataBase,
        data_atualizacao: dataAtualizacao,
        indice: indice,
      }
    );
    return response.data;
  }

  async calcularAtualizacaoPrecatorio(
    precatorioId: number,
    indice: string = 'IPCA_E',
    dataAtualizacao?: string
  ) {
    const params = new URLSearchParams();
    params.append('indice', indice);
    if (dataAtualizacao) params.append('data_atualizacao', dataAtualizacao);

    const response = await apiService.post(
      `/api/v1/precatorios/${precatorioId}/calcular-atualizacao?${params.toString()}`
    );
    return response.data;
  }

  async calcularAtualizacaoAcumuladaPrecatorio(
    precatorioId: number,
    indice: string = 'IPCA_E',
    dataAtualizacao?: string
  ) {
    const params = new URLSearchParams();
    params.append('indice', indice);
    if (dataAtualizacao) params.append('data_atualizacao', dataAtualizacao);

    const response = await apiService.post(
      `/api/v1/precatorios/${precatorioId}/calcular-atualizacao-acumulada?${params.toString()}`
    );
    return response.data;
  }
}

export default new IndicesEconomicosService();

