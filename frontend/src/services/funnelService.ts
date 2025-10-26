// ===========================================
// SERVIÇO DE FUNIL DE PROCESSOS
// ===========================================

import axios from 'axios';
import { config } from '../config/env';

const api = axios.create({
  baseURL: `${config.API_BASE_URL}/funnel`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ProcessFunnel {
  id: number;
  name: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stages?: FunnelStage[];
}

export interface FunnelStage {
  id: number;
  funnel_id: number;
  name: string;
  description?: string;
  stage_type: string;
  order_position: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessStage {
  id: number;
  process_id: number;
  stage_id: number;
  moved_at: string;
  moved_by_user_id?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class FunnelService {
  // ===========================================
  // FUNIS
  // ===========================================

  async listFunnels(): Promise<ProcessFunnel[]> {
    try {
      const response = await api.get('/funnels');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar funis:', error);
      throw error;
    }
  }

  async getFunnel(funnelId: number): Promise<ProcessFunnel> {
    try {
      const response = await api.get(`/funnels/${funnelId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter funil:', error);
      throw error;
    }
  }

  async createFunnel(funnelData: Partial<ProcessFunnel>): Promise<ProcessFunnel> {
    try {
      const response = await api.post('/funnels', funnelData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar funil:', error);
      throw error;
    }
  }

  async updateFunnel(funnelId: number, funnelData: Partial<ProcessFunnel>): Promise<ProcessFunnel> {
    try {
      const response = await api.put(`/funnels/${funnelId}`, funnelData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar funil:', error);
      throw error;
    }
  }

  async deleteFunnel(funnelId: number): Promise<void> {
    try {
      await api.delete(`/funnels/${funnelId}`);
    } catch (error: any) {
      console.error('Erro ao excluir funil:', error);
      throw error;
    }
  }

  // ===========================================
  // ETAPAS DO FUNIL
  // ===========================================

  async listFunnelStages(funnelId: number): Promise<FunnelStage[]> {
    try {
      const response = await api.get(`/funnels/${funnelId}/stages`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar etapas do funil:', error);
      throw error;
    }
  }

  async createFunnelStage(funnelId: number, stageData: Partial<FunnelStage>): Promise<FunnelStage> {
    try {
      const response = await api.post(`/funnels/${funnelId}/stages`, stageData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar etapa do funil:', error);
      throw error;
    }
  }

  async updateFunnelStage(funnelId: number, stageId: number, stageData: Partial<FunnelStage>): Promise<FunnelStage> {
    try {
      const response = await api.put(`/funnels/${funnelId}/stages/${stageId}`, stageData);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar etapa do funil:', error);
      throw error;
    }
  }

  async deleteFunnelStage(funnelId: number, stageId: number): Promise<void> {
    try {
      await api.delete(`/funnels/${funnelId}/stages/${stageId}`);
    } catch (error: any) {
      console.error('Erro ao excluir etapa do funil:', error);
      throw error;
    }
  }

  // ===========================================
  // MOVIMENTAÇÃO DE PROCESSOS
  // ===========================================

  async moveProcessToStage(processId: number, stageId: number, notes?: string): Promise<ProcessStage> {
    try {
      const response = await api.post('/processes/move-stage', {
        process_id: processId,
        stage_id: stageId,
        notes
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao mover processo para etapa:', error);
      throw error;
    }
  }

  async getProcessStages(processId: number): Promise<ProcessStage[]> {
    try {
      const response = await api.get(`/processes/${processId}/stages`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter etapas do processo:', error);
      throw error;
    }
  }

  // ===========================================
  // ANÁLISES E ESTATÍSTICAS
  // ===========================================

  async getFunnelAnalytics(funnelId: number): Promise<any> {
    try {
      const response = await api.get(`/funnels/${funnelId}/analytics`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter análises do funil:', error);
      throw error;
    }
  }

  async getFunnelStats(funnelId: number): Promise<any> {
    try {
      const response = await api.get(`/funnels/${funnelId}/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter estatísticas do funil:', error);
      throw error;
    }
  }

  // ===========================================
  // PROCESSOS POR ETAPA
  // ===========================================

  async getProcessesByStage(stageId: number): Promise<any[]> {
    try {
      const response = await api.get(`/stages/${stageId}/processes`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter processos por etapa:', error);
      throw error;
    }
  }

  async getProcessesByFunnel(funnelId: number): Promise<any[]> {
    try {
      const response = await api.get(`/funnels/${funnelId}/processes`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter processos por funil:', error);
      throw error;
    }
  }
}

export const funnelService = new FunnelService();
