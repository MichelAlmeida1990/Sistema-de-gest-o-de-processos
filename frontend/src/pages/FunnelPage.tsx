// ===========================================
// PÁGINA DO FUNIL DE PROCESSOS
// ===========================================

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Statistic,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Tabs,
  Badge,
  Avatar,
  Checkbox
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { funnelService } from '../services/funnelService';
import { LoadingSpinner } from '../components/LoadingSpinner';

const { Title, Text } = Typography;
const { Option } = Select;

// Tipos TypeScript
interface FunnelStage {
  id: number;
  name: string;
  description: string;
  stage_type: string;
  order_position: number;
  color: string;
  is_active: boolean;
}

interface ProcessFunnel {
  id: number;
  name: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
  stages: FunnelStage[];
}

interface Process {
  id: number;
  title: string;
  process_number: string;
  client_name: string;
  status: string;
  priority: string;
  current_stage?: FunnelStage;
}

interface FunnelAnalytics {
  funnel_id: number;
  funnel_name: string;
  total_processes: number;
  processes_by_stage: Record<string, {
    stage_id: number;
    total_processes: number;
    stage_type: string;
    color: string;
  }>;
  average_time_by_stage: Record<string, number>;
  conversion_rate: Record<string, number>;
}

export const FunnelPage: React.FC = () => {
  const { user } = useAuth();
  const [funnels, setFunnels] = useState<ProcessFunnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<ProcessFunnel | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [analytics, setAnalytics] = useState<FunnelAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Novos estados para funcionalidades RD Station
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  
  // Estados para automação de tarefas
  const [automationModalVisible, setAutomationModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [automationForm] = Form.useForm();
  
  // Estados para gerenciamento de equipe
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [teamForm] = Form.useForm();
  
  // Estados para relatórios jurídicos
  const [reportsData, setReportsData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('overview');
  
  // Estados para priorização inteligente
  const [prioritizedProcesses, setPrioritizedProcesses] = useState<any[]>([]);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [priorityCriteria, setPriorityCriteria] = useState({
    deadline: true,
    value: true,
    complexity: true,
    client: true,
    stage: true
  });
  
  // Estados para WhatsApp
  const [whatsappModalVisible, setWhatsappModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [whatsappMessages, setWhatsappMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [whatsappTemplates, setWhatsappTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  // Estados para Playbook
  const [playbookModalVisible, setPlaybookModalVisible] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<any>(null);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [playbookLoading, setPlaybookLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<ProcessFunnel | null>(null);
  const [editingStage, setEditingStage] = useState<FunnelStage | null>(null);
  const [form] = Form.useForm();
  const [stageForm] = Form.useForm();

  // Carregar funis
  const loadFunnels = async () => {
    try {
      setLoading(true);
      // Dados mockados para teste
      const mockFunnels = [
        {
          id: 1,
          name: "Funil Jurídico Padrão",
          description: "Funil padrão para processos jurídicos",
          is_default: true,
          is_active: true,
          stages: [
            {
              id: 1,
              name: "Análise Inicial",
              description: "Primeira análise do caso",
              stage_type: "initial",
              order_position: 1,
              color: "#1890ff",
              is_active: true
            },
            {
              id: 2,
              name: "Documentação",
              description: "Coleta e análise de documentos",
              stage_type: "documentation",
              order_position: 2,
              color: "#52c41a",
              is_active: true
            },
            {
              id: 3,
              name: "Petição",
              description: "Elaboração de petições",
              stage_type: "petition",
              order_position: 3,
              color: "#faad14",
              is_active: true
            },
            {
              id: 4,
              name: "Audiência",
              description: "Preparação para audiências",
              stage_type: "hearing",
              order_position: 4,
              color: "#f5222d",
              is_active: true
            }
          ]
        }
      ];
      setFunnels(mockFunnels);
      if (mockFunnels.length > 0 && !selectedFunnel) {
        setSelectedFunnel(mockFunnels[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar funis:', error);
      message.error('Erro ao carregar funis');
    } finally {
      setLoading(false);
    }
  };

  // Carregar analytics
  const loadAnalytics = async (funnelId: number) => {
    try {
      // Dados mockados para analytics
      const mockAnalytics = {
        funnel_id: funnelId,
        funnel_name: "Funil Jurídico Padrão",
        total_processes: 15,
        processes_by_stage: {
          "Análise Inicial": {
            stage_id: 1,
            total_processes: 5,
            stage_type: "initial",
            color: "#1890ff"
          },
          "Documentação": {
            stage_id: 2,
            total_processes: 4,
            stage_type: "documentation",
            color: "#52c41a"
          },
          "Petição": {
            stage_id: 3,
            total_processes: 3,
            stage_type: "petition",
            color: "#faad14"
          },
          "Audiência": {
            stage_id: 4,
            total_processes: 3,
            stage_type: "hearing",
            color: "#f5222d"
          }
        },
        average_time_by_stage: {
          "Análise Inicial": 7.5,
          "Documentação": 14.2,
          "Petição": 21.8,
          "Audiência": 5.3
        },
        conversion_rate: {
          "Documentação": 80.0,
          "Petição": 75.0,
          "Audiência": 100.0
        }
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  // Novas funções RD Station
  const loadTeamPerformance = async () => {
    const mockTeamPerformance = [
      {
        user: 'João Advogado',
        processes: 5, // Baseado nos dados reais
        completion: 85,
        value: 125000,
        efficiency: 92,
        avgTime: 12.5,
        role: 'Advogado',
        email: 'joao@escritorio.com',
        phone: '(11) 99999-1111',
        specialization: ['Direito Civil', 'Direito de Família']
      },
      {
        user: 'Maria Calculista',
        processes: 4, // Baseado nos dados reais
        completion: 92,
        value: 98000,
        efficiency: 88,
        avgTime: 10.2,
        role: 'Advogada',
        email: 'maria@escritorio.com',
        phone: '(11) 99999-2222',
        specialization: ['Direito Trabalhista', 'Direito Tributário']
      },
      {
        user: 'Carlos Cliente',
        processes: 3, // Baseado nos dados reais
        completion: 75,
        value: 67000,
        efficiency: 65, // Subperformer para testar insights
        avgTime: 15.8,
        role: 'Estagiário',
        email: 'carlos@escritorio.com',
        phone: '(11) 99999-3333',
        specialization: ['Direito Criminal']
      }
    ];
    setTeamPerformance(mockTeamPerformance);
  };

  const loadAutomationRules = async () => {
    const mockRules = [
      {
        id: 1,
        name: 'Tarefa Concluída → Próximo Colaborador',
        description: 'Quando uma tarefa é concluída, move automaticamente para o próximo colaborador',
        trigger: 'Tarefa Concluída',
        triggerCondition: 'status = completed',
        action: 'Mover para Próximo',
        actionDetails: {
          nextAssignee: 'Próximo na fila',
          notification: true,
          createFollowUp: true
        },
        isActive: true,
        priority: 'high'
      },
      {
        id: 2,
        name: 'Petição Finalizada → Audiência',
        description: 'Quando petição é finalizada, agenda automaticamente audiência',
        trigger: 'Petição Finalizada',
        triggerCondition: 'task_type = petition AND status = completed',
        action: 'Agendar Audiência',
        actionDetails: {
          nextStage: 'Audiência',
          createTask: 'Preparar para Audiência',
          assignTo: 'Advogado Responsável',
          deadline: '7 dias'
        },
        isActive: true,
        priority: 'high'
      },
      {
        id: 3,
        name: 'Prazo Vencendo → Notificação Urgente',
        description: 'Envia notificação urgente quando prazo está vencendo',
        trigger: 'Prazo Vencendo',
        triggerCondition: 'due_date <= 2 dias',
        action: 'Notificação Urgente',
        actionDetails: {
          notificationType: 'urgent',
          recipients: ['Responsável', 'Supervisor'],
          escalation: true
        },
        isActive: true,
        priority: 'urgent'
      },
      {
        id: 4,
        name: 'Documentos Recebidos → Análise',
        description: 'Quando documentos são recebidos, cria tarefa de análise',
        trigger: 'Documentos Recebidos',
        triggerCondition: 'task_type = document_review',
        action: 'Criar Tarefa de Análise',
        actionDetails: {
          newTask: 'Analisar Documentos',
          assignTo: 'Advogado Especialista',
          deadline: '3 dias',
          priority: 'medium'
        },
        isActive: true,
        priority: 'medium'
      }
    ];
    setAutomationRules(mockRules);
  };

  const loadAiInsights = async () => {
    // Análise real dos dados do sistema
    const realInsights = await generateRealInsights();
    setAiInsights(realInsights);
  };

  // Função para gerar insights reais baseados em dados
  const generateRealInsights = async () => {
    const insights = [];
    
    // 1. Análise de Performance por Etapa
    const stageAnalysis = analyzeStagePerformance();
    if (stageAnalysis.bottleneck) {
      insights.push({
        id: 1,
        type: 'performance',
        title: 'Gargalo Identificado',
        description: `A etapa "${stageAnalysis.bottleneck.stage}" está demorando ${stageAnalysis.bottleneck.avgDays} dias em média (${stageAnalysis.bottleneck.percentage}% acima do esperado)`,
        recommendation: `Otimizar processo de "${stageAnalysis.bottleneck.stage}" - considere automação ou redistribuição de tarefas`,
        priority: 'high',
        confidence: stageAnalysis.bottleneck.confidence,
        impact: stageAnalysis.bottleneck.impact
      });
    }

    // 2. Análise de Conversão entre Etapas
    const conversionAnalysis = analyzeConversionRates();
    if (conversionAnalysis.lowConversion) {
      insights.push({
        id: 2,
        type: 'conversion',
        title: 'Taxa de Conversão Baixa',
        description: `Taxa de conversão de "${conversionAnalysis.lowConversion.from}" para "${conversionAnalysis.lowConversion.to}" está em ${conversionAnalysis.lowConversion.rate}%`,
        recommendation: `Implementar checklist de qualidade para "${conversionAnalysis.lowConversion.from}" e treinamento específico`,
        priority: 'medium',
        confidence: conversionAnalysis.lowConversion.confidence,
        impact: conversionAnalysis.lowConversion.impact
      });
    }

    // 3. Análise de Prazos
    const deadlineAnalysis = analyzeDeadlines();
    if (deadlineAnalysis.risk) {
      insights.push({
        id: 3,
        type: 'deadline',
        title: 'Risco de Prazo',
        description: `${deadlineAnalysis.risk.count} processos estão em risco de vencimento nos próximos ${deadlineAnalysis.risk.days} dias`,
        recommendation: `Priorizar processos: ${deadlineAnalysis.risk.processes.join(', ')}`,
        priority: 'urgent',
        confidence: deadlineAnalysis.risk.confidence,
        impact: deadlineAnalysis.risk.impact
      });
    }

    // 4. Análise de Performance da Equipe
    const teamAnalysis = analyzeTeamPerformance();
    if (teamAnalysis.underperformer) {
      insights.push({
        id: 4,
        type: 'team',
        title: 'Performance da Equipe',
        description: `${teamAnalysis.underperformer.name} está com eficiência ${teamAnalysis.underperformer.efficiency}% (média da equipe: ${teamAnalysis.underperformer.teamAverage}%)`,
        recommendation: `Oferecer treinamento específico ou redistribuir carga de trabalho para ${teamAnalysis.underperformer.name}`,
        priority: 'medium',
        confidence: teamAnalysis.underperformer.confidence,
        impact: teamAnalysis.underperformer.impact
      });
    }

    // 5. Análise de Tendências
    const trendAnalysis = analyzeTrends();
    if (trendAnalysis.trend) {
      insights.push({
        id: 5,
        type: 'trend',
        title: 'Tendência Identificada',
        description: `${trendAnalysis.trend.description} (${trendAnalysis.trend.change}% vs mês anterior)`,
        recommendation: trendAnalysis.trend.recommendation,
        priority: trendAnalysis.trend.priority,
        confidence: trendAnalysis.trend.confidence,
        impact: trendAnalysis.trend.impact
      });
    }

    return insights;
  };

  // Funções de análise real
  const analyzeStagePerformance = () => {
    // Análise baseada nos dados reais dos processos
    const stageData = processes.reduce((acc, process) => {
      const stage = process.current_stage?.name || 'Análise Inicial';
      if (!acc[stage]) {
        acc[stage] = { count: 0, totalDays: 0, processes: [] };
      }
      acc[stage].count++;
      acc[stage].totalDays += process.days_in_stage || 0;
      acc[stage].processes.push(process);
      return acc;
    }, {});

    // Calcular médias e identificar gargalos
    const stageAverages = Object.entries(stageData).map(([stage, data]) => ({
      stage,
      avgDays: data.totalDays / data.count,
      count: data.count,
      processes: data.processes
    }));

    // Identificar gargalo (etapa com maior tempo médio)
    const bottleneck = stageAverages.reduce((max, current) => 
      current.avgDays > max.avgDays ? current : max
    );

    // Calcular se é significativamente maior que outras etapas
    const otherAverages = stageAverages.filter(s => s.stage !== bottleneck.stage);
    const overallAverage = otherAverages.reduce((sum, s) => sum + s.avgDays, 0) / otherAverages.length;
    const percentage = ((bottleneck.avgDays - overallAverage) / overallAverage) * 100;

    return {
      bottleneck: percentage > 30 ? {
        stage: bottleneck.stage,
        avgDays: Math.round(bottleneck.avgDays),
        percentage: Math.round(percentage),
        confidence: Math.min(95, 70 + percentage),
        impact: bottleneck.count > 5 ? 'high' : 'medium'
      } : null
    };
  };

  const analyzeConversionRates = () => {
    // Análise de conversão entre etapas
    const conversions = {};
    
    processes.forEach(process => {
      if (process.previous_stage && process.current_stage?.name) {
        const key = `${process.previous_stage}->${process.current_stage.name}`;
        if (!conversions[key]) {
          conversions[key] = { total: 0, successful: 0 };
        }
        conversions[key].total++;
        if (process.status === 'completed' || process.current_stage.name !== process.previous_stage) {
          conversions[key].successful++;
        }
      }
    });

    const conversionRates = Object.entries(conversions).map(([key, data]) => ({
      from: key.split('->')[0],
      to: key.split('->')[1],
      rate: Math.round((data.successful / data.total) * 100),
      total: data.total
    }));

    const lowConversion = conversionRates.find(cr => cr.rate < 80 && cr.total > 3);

    return {
      lowConversion: lowConversion ? {
        from: lowConversion.from,
        to: lowConversion.to,
        rate: lowConversion.rate,
        confidence: Math.min(90, 60 + (10 - (100 - lowConversion.rate))),
        impact: lowConversion.total > 10 ? 'high' : 'medium'
      } : null
    };
  };

  const analyzeDeadlines = () => {
    const now = new Date();
    const riskProcesses = processes.filter(process => {
      if (!process.due_date) return false;
      const dueDate = new Date(process.due_date);
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue > 0;
    });

    return {
      risk: riskProcesses.length > 0 ? {
        count: riskProcesses.length,
        days: 7,
        processes: riskProcesses.map(p => p.process_number || p.id.toString()),
        confidence: 85,
        impact: riskProcesses.length > 5 ? 'high' : 'medium'
      } : null
    };
  };

  const analyzeTeamPerformance = () => {
    if (teamPerformance.length === 0) return {};

    const teamAverage = teamPerformance.reduce((sum, member) => sum + member.efficiency, 0) / teamPerformance.length;
    const underperformer = teamPerformance.find(member => 
      member.efficiency < teamAverage - 15 && member.processes > 0
    );

    return {
      underperformer: underperformer ? {
        name: underperformer.user,
        efficiency: underperformer.efficiency,
        teamAverage: Math.round(teamAverage),
        confidence: 80,
        impact: 'medium'
      } : null
    };
  };

  const analyzeTrends = () => {
    // Análise de tendências baseada em dados históricos
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    // Simular análise de tendências (em produção, viria de dados históricos)
    const trendData = {
      processesCompleted: { current: 45, previous: 38, change: 18.4 },
      averageTime: { current: 15.2, previous: 18.5, change: -17.8 },
      teamEfficiency: { current: 87, previous: 82, change: 6.1 }
    };

    // Identificar tendência mais significativa
    const significantTrend = Object.entries(trendData).find(([key, data]) => 
      Math.abs(data.change) > 15
    );

    if (significantTrend) {
      const [metric, data] = significantTrend;
      const metricNames = {
        processesCompleted: 'Processos Concluídos',
        averageTime: 'Tempo Médio',
        teamEfficiency: 'Eficiência da Equipe'
      };

      return {
        trend: {
          description: `${metricNames[metric]}: ${data.current}${metric === 'averageTime' ? ' dias' : metric === 'teamEfficiency' ? '%' : ''}`,
          change: data.change,
          recommendation: data.change > 0 
            ? `Manter estratégia atual - ${metricNames[metric]} em alta`
            : `Investigar causas da queda em ${metricNames[metric]}`,
          priority: Math.abs(data.change) > 20 ? 'high' : 'medium',
          confidence: Math.min(95, 70 + Math.abs(data.change)),
          impact: Math.abs(data.change) > 20 ? 'high' : 'medium'
        }
      };
    }

    return {};
  };

  const loadRealTimeMetrics = async () => {
    const mockMetrics = {
      totalProcesses: 156,
      activeProcesses: 89,
      completedToday: 12,
      averageTime: 18.5,
      conversionRate: 78.5,
      revenue: 1250000
    };
    setRealTimeMetrics(mockMetrics);
  };

  // Funções para relatórios jurídicos com IA
  const loadReportsData = async (reportType: string = 'overview') => {
    setReportLoading(true);
    try {
      const reportsData = await generateLegalReports(reportType);
      setReportsData(reportsData);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      message.error('Erro ao carregar relatórios');
    } finally {
      setReportLoading(false);
    }
  };

  const generateLegalReports = async (reportType: string) => {
    // Análise baseada nos dados reais do sistema
    const analysis = analyzeLegalData();
    
    switch (reportType) {
      case 'overview':
        return generateOverviewReport(analysis);
      case 'performance':
        return generatePerformanceReport(analysis);
      case 'financial':
        return generateFinancialReport(analysis);
      case 'team':
        return generateTeamReport(analysis);
      case 'deadlines':
        return generateDeadlinesReport(analysis);
      default:
        return generateOverviewReport(analysis);
    }
  };

  const analyzeLegalData = () => {
    // Análise completa dos dados jurídicos
    const totalProcesses = processes.length;
    const activeProcesses = processes.filter(p => p.status === 'active').length;
    const completedProcesses = processes.filter(p => p.status === 'completed').length;
    
    // Análise por área jurídica
    const areaAnalysis = processes.reduce((acc, process) => {
      const area = getLegalArea(process.title);
      if (!acc[area]) {
        acc[area] = { total: 0, active: 0, completed: 0, value: 0 };
      }
      acc[area].total++;
      if (process.status === 'active') acc[area].active++;
      if (process.status === 'completed') acc[area].completed++;
      acc[area].value += process.value || 0;
      return acc;
    }, {});

    // Análise de performance por advogado
    const lawyerAnalysis = processes.reduce((acc, process) => {
      const lawyer = process.assigned_to || 'Não atribuído';
      if (!acc[lawyer]) {
        acc[lawyer] = { total: 0, completed: 0, value: 0, avgTime: 0 };
      }
      acc[lawyer].total++;
      if (process.status === 'completed') acc[lawyer].completed++;
      acc[lawyer].value += process.value || 0;
      acc[lawyer].avgTime += process.days_in_stage || 0;
      return acc;
    }, {});

    // Calcular métricas de performance
    Object.keys(lawyerAnalysis).forEach(lawyer => {
      const data = lawyerAnalysis[lawyer];
      data.completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
      data.avgTime = data.total > 0 ? data.avgTime / data.total : 0;
    });

    // Análise de prazos
    const now = new Date();
    const deadlineAnalysis = processes.filter(p => p.due_date).map(process => {
      const dueDate = new Date(process.due_date);
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return {
        ...process,
        daysUntilDue,
        isOverdue: daysUntilDue < 0,
        isUrgent: daysUntilDue <= 7 && daysUntilDue > 0
      };
    });

    return {
      totalProcesses,
      activeProcesses,
      completedProcesses,
      areaAnalysis,
      lawyerAnalysis,
      deadlineAnalysis,
      teamPerformance
    };
  };

  const getLegalArea = (title: string) => {
    if (title.includes('Divórcio') || title.includes('Família')) return 'Direito de Família';
    if (title.includes('Trabalhista') || title.includes('Funcionário')) return 'Direito Trabalhista';
    if (title.includes('Cobrança') || title.includes('Contrato')) return 'Direito Civil';
    if (title.includes('Criminal') || title.includes('Crime')) return 'Direito Criminal';
    if (title.includes('Inventário') || title.includes('Herança')) return 'Direito Sucessório';
    return 'Outros';
  };

  const generateOverviewReport = (analysis: any) => {
    const { totalProcesses, activeProcesses, completedProcesses, areaAnalysis, deadlineAnalysis } = analysis;
    
    return {
      title: 'Relatório Geral do Escritório',
      period: 'Últimos 30 dias',
      summary: {
        totalProcesses,
        activeProcesses,
        completedProcesses,
        completionRate: totalProcesses > 0 ? (completedProcesses / totalProcesses) * 100 : 0,
        urgentProcesses: deadlineAnalysis.filter(p => p.isUrgent).length,
        overdueProcesses: deadlineAnalysis.filter(p => p.isOverdue).length
      },
      insights: [
        {
          type: 'success',
          title: 'Taxa de Conclusão',
          value: `${Math.round((completedProcesses / totalProcesses) * 100)}%`,
          description: `${completedProcesses} de ${totalProcesses} processos concluídos`
        },
        {
          type: 'warning',
          title: 'Processos Urgentes',
          value: deadlineAnalysis.filter(p => p.isUrgent).length,
          description: 'Processos com prazo vencendo em 7 dias'
        },
        {
          type: 'error',
          title: 'Processos Atrasados',
          value: deadlineAnalysis.filter(p => p.isOverdue).length,
          description: 'Processos com prazo vencido'
        }
      ],
      topAreas: Object.entries(areaAnalysis)
        .sort(([,a], [,b]) => (b as any).total - (a as any).total)
        .slice(0, 5)
        .map(([area, data]) => ({
          area,
          total: (data as any).total,
          active: (data as any).active,
          value: (data as any).value
        }))
    };
  };

  const generatePerformanceReport = (analysis: any) => {
    const { lawyerAnalysis } = analysis;
    
    return {
      title: 'Relatório de Performance da Equipe',
      period: 'Últimos 30 dias',
      lawyers: Object.entries(lawyerAnalysis).map(([lawyer, data]: [string, any]) => ({
        name: lawyer,
        totalProcesses: data.total,
        completedProcesses: data.completed,
        completionRate: Math.round(data.completionRate),
        avgTime: Math.round(data.avgTime),
        totalValue: data.value,
        efficiency: data.completionRate > 80 ? 'Alta' : data.completionRate > 60 ? 'Média' : 'Baixa'
      })),
      insights: [
        {
          type: 'info',
          title: 'Melhor Performance',
          value: Object.entries(lawyerAnalysis)
            .sort(([,a], [,b]) => (b as any).completionRate - (a as any).completionRate)[0]?.[0] || 'N/A',
          description: 'Advogado com maior taxa de conclusão'
        },
        {
          type: 'warning',
          title: 'Necessita Atenção',
          value: Object.entries(lawyerAnalysis)
            .filter(([,data]: [string, any]) => data.completionRate < 60)[0]?.[0] || 'Nenhum',
          description: 'Advogado com menor taxa de conclusão'
        }
      ]
    };
  };

  const generateFinancialReport = (analysis: any) => {
    const { areaAnalysis } = analysis;
    const totalValue = Object.values(areaAnalysis).reduce((sum: number, data: any) => sum + data.value, 0);
    
    return {
      title: 'Relatório Financeiro',
      period: 'Últimos 30 dias',
      summary: {
        totalValue,
        averageValue: processes.length > 0 ? totalValue / processes.length : 0,
        topArea: Object.entries(areaAnalysis)
          .sort(([,a], [,b]) => (b as any).value - (a as any).value)[0]?.[0] || 'N/A'
      },
      areas: Object.entries(areaAnalysis).map(([area, data]: [string, any]) => ({
        area,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        processes: data.total
      })),
      insights: [
        {
          type: 'success',
          title: 'Receita Total',
          value: `R$ ${totalValue.toLocaleString()}`,
          description: 'Valor total dos processos'
        },
        {
          type: 'info',
          title: 'Ticket Médio',
          value: `R$ ${Math.round(totalValue / processes.length).toLocaleString()}`,
          description: 'Valor médio por processo'
        }
      ]
    };
  };

  const generateTeamReport = (analysis: any) => {
    const { teamPerformance } = analysis;
    
    return {
      title: 'Relatório de Equipe',
      period: 'Últimos 30 dias',
      team: teamPerformance.map((member: any) => ({
        name: member.user,
        role: member.role,
        processes: member.processes,
        efficiency: member.efficiency,
        value: member.value,
        specialization: member.specialization
      })),
      insights: [
        {
          type: 'info',
          title: 'Média da Equipe',
          value: `${Math.round(teamPerformance.reduce((sum: number, m: any) => sum + m.efficiency, 0) / teamPerformance.length)}%`,
          description: 'Eficiência média da equipe'
        },
        {
          type: 'success',
          title: 'Melhor Performance',
          value: teamPerformance.sort((a: any, b: any) => b.efficiency - a.efficiency)[0]?.user || 'N/A',
          description: 'Membro com maior eficiência'
        }
      ]
    };
  };

  const generateDeadlinesReport = (analysis: any) => {
    const { deadlineAnalysis } = analysis;
    
    return {
      title: 'Relatório de Prazos',
      period: 'Próximos 30 dias',
      summary: {
        total: deadlineAnalysis.length,
        urgent: deadlineAnalysis.filter(p => p.isUrgent).length,
        overdue: deadlineAnalysis.filter(p => p.isOverdue).length,
        upcoming: deadlineAnalysis.filter(p => !p.isUrgent && !p.isOverdue).length
      },
      deadlines: deadlineAnalysis.map(process => ({
        id: process.id,
        title: process.title,
        client: process.client_name,
        dueDate: process.due_date,
        daysUntilDue: process.daysUntilDue,
        status: process.isOverdue ? 'overdue' : process.isUrgent ? 'urgent' : 'normal',
        assignedTo: process.assigned_to
      })),
      insights: [
        {
          type: 'error',
          title: 'Processos Atrasados',
          value: deadlineAnalysis.filter(p => p.isOverdue).length,
          description: 'Requerem atenção imediata'
        },
        {
          type: 'warning',
          title: 'Processos Urgentes',
          value: deadlineAnalysis.filter(p => p.isUrgent).length,
          description: 'Vencem nos próximos 7 dias'
        }
      ]
    };
  };

  // Funções para priorização inteligente com IA
  const loadPrioritizedProcesses = async () => {
    setPriorityLoading(true);
    try {
      const prioritized = await generateIntelligentPriority();
      setPrioritizedProcesses(prioritized);
    } catch (error) {
      console.error('Erro ao carregar priorização:', error);
      message.error('Erro ao carregar priorização');
    } finally {
      setPriorityLoading(false);
    }
  };

  const generateIntelligentPriority = async () => {
    // Algoritmo de priorização inteligente baseado em múltiplos critérios
    const scoredProcesses = processes.map(process => {
      const score = calculatePriorityScore(process);
      return {
        ...process,
        priorityScore: score.total,
        scoreBreakdown: score.breakdown,
        priorityLevel: getPriorityLevel(score.total),
        recommendations: generateRecommendations(process, score)
      };
    });

    // Ordenar por score de prioridade (maior primeiro)
    return scoredProcesses.sort((a, b) => b.priorityScore - a.priorityScore);
  };

  const calculatePriorityScore = (process: any) => {
    const now = new Date();
    const dueDate = process.due_date ? new Date(process.due_date) : null;
    const daysUntilDue = dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : 999;
    
    let totalScore = 0;
    const breakdown = {};

    // 1. Critério de Prazo (peso: 40%)
    if (priorityCriteria.deadline) {
      let deadlineScore = 0;
      if (daysUntilDue < 0) {
        deadlineScore = 100; // Atrasado - máxima prioridade
      } else if (daysUntilDue <= 3) {
        deadlineScore = 90; // Crítico
      } else if (daysUntilDue <= 7) {
        deadlineScore = 80; // Urgente
      } else if (daysUntilDue <= 15) {
        deadlineScore = 60; // Próximo
      } else if (daysUntilDue <= 30) {
        deadlineScore = 40; // Médio prazo
      } else {
        deadlineScore = 20; // Longo prazo
      }
      totalScore += deadlineScore * 0.4;
      breakdown.deadline = deadlineScore;
    }

    // 2. Critério de Valor (peso: 25%)
    if (priorityCriteria.value) {
      const value = process.value || 0;
      let valueScore = 0;
      if (value >= 50000) {
        valueScore = 100; // Alto valor
      } else if (value >= 20000) {
        valueScore = 80; // Médio-alto
      } else if (value >= 10000) {
        valueScore = 60; // Médio
      } else if (value >= 5000) {
        valueScore = 40; // Baixo-médio
      } else {
        valueScore = 20; // Baixo valor
      }
      totalScore += valueScore * 0.25;
      breakdown.value = valueScore;
    }

    // 3. Critério de Complexidade (peso: 20%)
    if (priorityCriteria.complexity) {
      const complexity = getProcessComplexity(process);
      let complexityScore = 0;
      if (complexity === 'high') {
        complexityScore = 100; // Alta complexidade
      } else if (complexity === 'medium') {
        complexityScore = 60; // Média complexidade
      } else {
        complexityScore = 30; // Baixa complexidade
      }
      totalScore += complexityScore * 0.2;
      breakdown.complexity = complexityScore;
    }

    // 4. Critério de Cliente (peso: 10%)
    if (priorityCriteria.client) {
      const clientScore = getClientPriority(process.client_name);
      totalScore += clientScore * 0.1;
      breakdown.client = clientScore;
    }

    // 5. Critério de Etapa (peso: 5%)
    if (priorityCriteria.stage) {
      const stageScore = getStagePriority(process.current_stage?.name);
      totalScore += stageScore * 0.05;
      breakdown.stage = stageScore;
    }

    return {
      total: Math.round(totalScore),
      breakdown
    };
  };

  const getProcessComplexity = (process: any) => {
    const title = process.title?.toLowerCase() || '';
    
    // Alta complexidade
    if (title.includes('inventário') || title.includes('herança') || 
        title.includes('paternidade') || title.includes('danos morais')) {
      return 'high';
    }
    
    // Média complexidade
    if (title.includes('divórcio') || title.includes('trabalhista') || 
        title.includes('cobrança') || title.includes('contrato')) {
      return 'medium';
    }
    
    // Baixa complexidade
    return 'low';
  };

  const getClientPriority = (clientName: string) => {
    // Clientes VIP ou corporativos têm prioridade maior
    if (clientName?.includes('Ltda') || clientName?.includes('S.A.') || 
        clientName?.includes('Corp') || clientName?.includes('Group')) {
      return 100;
    }
    
    // Clientes individuais
    return 50;
  };

  const getStagePriority = (stageName: string) => {
    const stagePriorities = {
      'Análise Inicial': 100,
      'Documentação': 80,
      'Petição': 90,
      'Audiência': 70,
      'Concluído': 0
    };
    
    return stagePriorities[stageName as keyof typeof stagePriorities] || 50;
  };

  const getPriorityLevel = (score: number) => {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const generateRecommendations = (process: any, score: any) => {
    const recommendations = [];
    
    // Recomendações baseadas no score
    if (score.breakdown.deadline >= 90) {
      recommendations.push('🚨 Ação imediata necessária - prazo crítico');
    }
    
    if (score.breakdown.value >= 80) {
      recommendations.push('💰 Alto valor - priorizar recursos');
    }
    
    if (score.breakdown.complexity >= 80) {
      recommendations.push('🧠 Alta complexidade - alocar especialista');
    }
    
    if (process.status === 'active' && process.days_in_stage > 20) {
      recommendations.push('⏰ Processo parado há muito tempo - revisar');
    }
    
    if (process.priority === 'urgent') {
      recommendations.push('⚡ Processo marcado como urgente');
    }
    
    return recommendations;
  };

  // Funções para WhatsApp
  const loadWhatsappTemplates = async () => {
    const templates = [
      {
        id: 1,
        name: 'Atualização de Processo',
        content: 'Olá {cliente}! Seu processo {numero} está na etapa "{etapa}". Em breve entraremos em contato com mais novidades. Obrigado pela confiança!',
        category: 'Atualização'
      },
      {
        id: 2,
        name: 'Prazo Vencendo',
        content: 'Olá {cliente}! Seu processo {numero} tem prazo vencendo em {dias} dias. Por favor, entre em contato conosco urgentemente.',
        category: 'Urgente'
      },
      {
        id: 3,
        name: 'Documentos Necessários',
        content: 'Olá {cliente}! Para dar continuidade ao seu processo {numero}, precisamos dos seguintes documentos: {documentos}. Aguardamos seu retorno.',
        category: 'Documentação'
      },
      {
        id: 4,
        name: 'Audiência Marcada',
        content: 'Olá {cliente}! Sua audiência foi marcada para {data} às {hora} no {local}. Chegue com 30min de antecedência.',
        category: 'Audiência'
      },
      {
        id: 5,
        name: 'Processo Concluído',
        content: 'Parabéns {cliente}! Seu processo {numero} foi concluído com sucesso. Em breve você receberá a documentação final.',
        category: 'Conclusão'
      },
      {
        id: 6,
        name: 'Cobrança de Honorários',
        content: 'Olá {cliente}! Os honorários do seu processo {numero} estão vencidos. Por favor, entre em contato para regularização.',
        category: 'Financeiro'
      }
    ];
    setWhatsappTemplates(templates);
  };

  const openWhatsappModal = (client: any) => {
    setSelectedClient(client);
    setWhatsappModalVisible(true);
    loadWhatsappTemplates();
    loadClientMessages(client);
  };

  const loadClientMessages = async (client: any) => {
    // Simular histórico de mensagens
    const mockMessages = [
      {
        id: 1,
        type: 'sent',
        content: 'Olá! Seu processo está na etapa de análise inicial.',
        timestamp: '2024-01-20 10:30',
        status: 'delivered'
      },
      {
        id: 2,
        type: 'received',
        content: 'Obrigado! Quando teremos novidades?',
        timestamp: '2024-01-20 10:35',
        status: 'read'
      },
      {
        id: 3,
        type: 'sent',
        content: 'Em breve! Estamos analisando a documentação.',
        timestamp: '2024-01-20 10:40',
        status: 'delivered'
      }
    ];
    setWhatsappMessages(mockMessages);
  };

  const sendWhatsappMessage = async () => {
    if (!newMessage.trim()) {
      message.warning('Digite uma mensagem!');
      return;
    }

    const messageObj = {
      id: Date.now(),
      type: 'sent',
      content: newMessage,
      timestamp: new Date().toLocaleString(),
      status: 'sending'
    };

    setWhatsappMessages(prev => [...prev, messageObj]);
    setNewMessage('');

    // Simular envio
    setTimeout(() => {
      setWhatsappMessages(prev => 
        prev.map(msg => 
          msg.id === messageObj.id ? { ...msg, status: 'delivered' } : msg
        )
      );
      message.success('Mensagem enviada com sucesso!');
    }, 1000);
  };

  const useTemplate = (template: any) => {
    let content = template.content;
    
    // Substituir variáveis
    if (selectedClient) {
      content = content
        .replace('{cliente}', selectedClient.name)
        .replace('{numero}', selectedClient.process_number || 'N/A')
        .replace('{etapa}', selectedClient.current_stage?.name || 'N/A')
        .replace('{dias}', '7')
        .replace('{documentos}', 'RG, CPF, Comprovante de Residência')
        .replace('{data}', '15/02/2024')
        .replace('{hora}', '14:00')
        .replace('{local}', 'Fórum Central');
    }
    
    setNewMessage(content);
    setSelectedTemplate(template.id);
  };

  const getClientPhone = (client: any) => {
    if (!client || !client.client_name) {
      return '(11) 99999-0000';
    }
    
    // Simular números de telefone baseados no nome
    const phoneMap: { [key: string]: string } = {
      'João Silva': '(11) 99999-1111',
      'Maria Santos': '(11) 99999-2222',
      'Carlos Lima': '(11) 99999-3333',
      'Ana Costa': '(11) 99999-4444',
      'Roberto Alves': '(11) 99999-5555',
      'Fernanda Rocha': '(11) 99999-6666',
      'Paulo Mendes': '(11) 99999-7777',
      'Sandra Oliveira': '(11) 99999-8888',
      'Marcos Silva': '(11) 99999-9999',
      'Patricia Costa': '(11) 99999-0000',
      'Empresa ABC Ltda': '(11) 99999-1111',
      'Lucia Ferreira': '(11) 99999-2222'
    };
    
    return phoneMap[client.client_name] || '(11) 99999-0000';
  };

  // Funções para Playbook de Processos Jurídicos
  const loadPlaybooks = async () => {
    setPlaybookLoading(true);
    try {
      const mockPlaybooks = [
        {
          id: 1,
          name: 'Processo de Divórcio',
          category: 'Direito de Família',
          description: 'Playbook completo para processos de divórcio consensual e litigioso',
          steps: [
            {
              id: 1,
              title: 'Análise Inicial',
              description: 'Verificar documentação e requisitos legais',
              tasks: [
                'Verificar certidão de casamento',
                'Analisar regime de bens',
                'Verificar presença de filhos menores',
                'Coletar documentos pessoais'
              ],
              estimatedTime: '2-3 dias',
              responsible: 'Advogado',
              documents: ['Certidão de Casamento', 'RG', 'CPF', 'Comprovante de Residência']
            },
            {
              id: 2,
              title: 'Documentação',
              description: 'Preparar toda documentação necessária',
              tasks: [
                'Organizar documentos pessoais',
                'Preparar declaração de bens',
                'Verificar documentação dos filhos',
                'Preparar acordo de divórcio'
              ],
              estimatedTime: '3-5 dias',
              responsible: 'Advogado',
              documents: ['Declaração de Bens', 'Documentos dos Filhos', 'Acordo de Divórcio']
            },
            {
              id: 3,
              title: 'Petição Inicial',
              description: 'Elaborar e protocolizar petição inicial',
              tasks: [
                'Elaborar petição inicial',
                'Anexar documentos necessários',
                'Protocolizar no cartório',
                'Pagar custas processuais'
              ],
              estimatedTime: '1-2 dias',
              responsible: 'Advogado',
              documents: ['Petição Inicial', 'Comprovante de Pagamento']
            },
            {
              id: 4,
              title: 'Audiência de Conciliação',
              description: 'Participar da audiência de conciliação',
              tasks: [
                'Preparar cliente para audiência',
                'Comparecer na audiência',
                'Tentar acordo amigável',
                'Documentar resultado'
              ],
              estimatedTime: '1 dia',
              responsible: 'Advogado + Cliente',
              documents: ['Termo de Audiência']
            }
          ],
          totalSteps: 4,
          estimatedDuration: '15-30 dias',
          successRate: 85
        },
        {
          id: 2,
          name: 'Ação de Cobrança',
          category: 'Direito Civil',
          description: 'Playbook para ações de cobrança de valores em atraso',
          steps: [
            {
              id: 1,
              title: 'Análise do Contrato',
              description: 'Analisar documentação e validade do crédito',
              tasks: [
                'Verificar validade do contrato',
                'Analisar cláusulas de juros',
                'Verificar prescrição',
                'Calcular valores devidos'
              ],
              estimatedTime: '1-2 dias',
              responsible: 'Advogado',
              documents: ['Contrato Original', 'Comprovantes de Pagamento']
            },
            {
              id: 2,
              title: 'Notificação Extrajudicial',
              description: 'Enviar notificação antes da ação',
              tasks: [
                'Elaborar notificação',
                'Enviar por correio',
                'Aguardar prazo de resposta',
                'Documentar tentativa'
              ],
              estimatedTime: '5-10 dias',
              responsible: 'Advogado',
              documents: ['Notificação Extrajudicial', 'AR']
            },
            {
              id: 3,
              title: 'Petição de Cobrança',
              description: 'Elaborar e protocolizar ação de cobrança',
              tasks: [
                'Elaborar petição inicial',
                'Calcular juros e multas',
                'Protocolizar ação',
                'Pagar custas'
              ],
              estimatedTime: '1-2 dias',
              responsible: 'Advogado',
              documents: ['Petição Inicial', 'Cálculos']
            }
          ],
          totalSteps: 3,
          estimatedDuration: '30-60 dias',
          successRate: 90
        },
        {
          id: 3,
          name: 'Ação Trabalhista',
          category: 'Direito Trabalhista',
          description: 'Playbook para ações trabalhistas por demissão sem justa causa',
          steps: [
            {
              id: 1,
              title: 'Análise do Vínculo',
              description: 'Analisar relação de trabalho e direitos',
              tasks: [
                'Verificar vínculo empregatício',
                'Analisar salários e benefícios',
                'Calcular verbas rescisórias',
                'Verificar FGTS'
              ],
              estimatedTime: '2-3 dias',
              responsible: 'Advogado',
              documents: ['Carteira de Trabalho', 'Contracheques', 'CTPS']
            },
            {
              id: 2,
              title: 'Reclamação Trabalhista',
              description: 'Elaborar reclamação trabalhista',
              tasks: [
                'Elaborar reclamação',
                'Calcular verbas devidas',
                'Protocolizar na Vara do Trabalho',
                'Pagar custas'
              ],
              estimatedTime: '1-2 dias',
              responsible: 'Advogado',
              documents: ['Reclamação Trabalhista', 'Cálculos']
            },
            {
              id: 3,
              title: 'Audiência Trabalhista',
              description: 'Participar da audiência trabalhista',
              tasks: [
                'Preparar cliente',
                'Comparecer na audiência',
                'Tentar acordo',
                'Documentar resultado'
              ],
              estimatedTime: '1 dia',
              responsible: 'Advogado + Cliente',
              documents: ['Termo de Audiência']
            }
          ],
          totalSteps: 3,
          estimatedDuration: '60-90 dias',
          successRate: 80
        },
        {
          id: 4,
          name: 'Processo de Inventário',
          category: 'Direito Sucessório',
          description: 'Playbook para inventário de bens e herança',
          steps: [
            {
              id: 1,
              title: 'Análise do Espólio',
              description: 'Identificar e avaliar bens do falecido',
              tasks: [
                'Identificar herdeiros',
                'Mapear bens e direitos',
                'Avaliar patrimônio',
                'Verificar dívidas'
              ],
              estimatedTime: '5-10 dias',
              responsible: 'Advogado',
              documents: ['Certidão de Óbito', 'Documentos dos Herdeiros']
            },
            {
              id: 2,
              title: 'Alvará Judicial',
              description: 'Solicitar alvará para administração',
              tasks: [
                'Elaborar pedido de alvará',
                'Protocolizar no cartório',
                'Aguardar decisão',
                'Receber alvará'
              ],
              estimatedTime: '15-30 dias',
              responsible: 'Advogado',
              documents: ['Pedido de Alvará']
            },
            {
              id: 3,
              title: 'Partilha de Bens',
              description: 'Realizar partilha entre herdeiros',
              tasks: [
                'Elaborar acordo de partilha',
                'Registrar bens imóveis',
                'Transferir veículos',
                'Finalizar inventário'
              ],
              estimatedTime: '30-60 dias',
              responsible: 'Advogado',
              documents: ['Acordo de Partilha', 'Registros']
            }
          ],
          totalSteps: 3,
          estimatedDuration: '6-12 meses',
          successRate: 75
        }
      ];
      setPlaybooks(mockPlaybooks);
    } catch (error) {
      console.error('Erro ao carregar playbooks:', error);
      message.error('Erro ao carregar playbooks');
    } finally {
      setPlaybookLoading(false);
    }
  };

  const openPlaybookModal = (playbook: any) => {
    setSelectedPlaybook(playbook);
    setPlaybookModalVisible(true);
  };

  const getPlaybookByCategory = (category: string) => {
    return playbooks.filter(playbook => playbook.category === category);
  };

  const getPlaybookStats = () => {
    const totalPlaybooks = playbooks.length;
    const categories = [...new Set(playbooks.map(p => p.category))];
    const avgSuccessRate = playbooks.reduce((sum, p) => sum + p.successRate, 0) / totalPlaybooks;
    
    return {
      total: totalPlaybooks,
      categories: categories.length,
      avgSuccessRate: Math.round(avgSuccessRate)
    };
  };

  // Funções para gerenciar automação
  const handleCreateAutomationRule = () => {
    setEditingRule(null);
    automationForm.resetFields();
    setAutomationModalVisible(true);
  };

  const handleEditAutomationRule = (rule: any) => {
    setEditingRule(rule);
    automationForm.setFieldsValue(rule);
    setAutomationModalVisible(true);
  };

  const handleAutomationModalOk = async () => {
    try {
      const values = await automationForm.validateFields();
      
      if (editingRule) {
        // Atualizar regra existente
        const updatedRules = automationRules.map(rule => 
          rule.id === editingRule.id ? { ...rule, ...values } : rule
        );
        setAutomationRules(updatedRules);
        message.success('Regra de automação atualizada com sucesso!');
      } else {
        // Criar nova regra
        const newRule = {
          id: Date.now(),
          ...values,
          isActive: true,
          priority: 'medium'
        };
        setAutomationRules([...automationRules, newRule]);
        message.success('Regra de automação criada com sucesso!');
      }
      
      setAutomationModalVisible(false);
      automationForm.resetFields();
      setEditingRule(null);
    } catch (error) {
      console.error('Erro ao salvar regra de automação:', error);
      message.error('Erro ao salvar regra de automação');
    }
  };

  const handleDeleteAutomationRule = (id: number) => {
    Modal.confirm({
      title: 'Confirmar Exclusão',
      content: 'Tem certeza que deseja excluir esta regra de automação?',
      onOk: () => {
        setAutomationRules(automationRules.filter(rule => rule.id !== id));
        message.success('Regra de automação excluída com sucesso!');
      }
    });
  };

  const handleToggleAutomationRule = (id: number) => {
    const updatedRules = automationRules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    );
    setAutomationRules(updatedRules);
    message.success(`Regra ${updatedRules.find(r => r.id === id)?.isActive ? 'ativada' : 'desativada'} com sucesso!`);
  };

  // Função para renderizar conteúdo específico de cada relatório
  const renderReportContent = (data: any) => {
    switch (selectedReportType) {
      case 'overview':
        return renderOverviewReport(data);
      case 'performance':
        return renderPerformanceReport(data);
      case 'financial':
        return renderFinancialReport(data);
      case 'team':
        return renderTeamReport(data);
      case 'deadlines':
        return renderDeadlinesReport(data);
      default:
        return null;
    }
  };

  const renderOverviewReport = (data: any) => (
    <div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Card title="Resumo Geral">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Total de Processos" value={data.summary.totalProcesses} />
              </Col>
              <Col span={12}>
                <Statistic title="Processos Ativos" value={data.summary.activeProcesses} />
              </Col>
              <Col span={12}>
                <Statistic title="Processos Concluídos" value={data.summary.completedProcesses} />
              </Col>
              <Col span={12}>
                <Statistic title="Taxa de Conclusão" value={`${Math.round(data.summary.completionRate)}%`} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Principais Áreas Jurídicas">
            {data.topAreas.map((area: any, index: number) => (
              <div key={index} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{area.area}</span>
                  <span>{area.total} processos</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  R$ {area.value.toLocaleString()}
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderPerformanceReport = (data: any) => (
    <div>
      <Card title="Performance por Advogado">
        <Table
          dataSource={data.lawyers}
          columns={[
            { title: 'Advogado', dataIndex: 'name', key: 'name' },
            { title: 'Total Processos', dataIndex: 'totalProcesses', key: 'totalProcesses' },
            { title: 'Concluídos', dataIndex: 'completedProcesses', key: 'completedProcesses' },
            { 
              title: 'Taxa de Conclusão', 
              dataIndex: 'completionRate', 
              key: 'completionRate',
              render: (value: number) => `${value}%`
            },
            { 
              title: 'Tempo Médio', 
              dataIndex: 'avgTime', 
              key: 'avgTime',
              render: (value: number) => `${value} dias`
            },
            { 
              title: 'Valor Total', 
              dataIndex: 'totalValue', 
              key: 'totalValue',
              render: (value: number) => `R$ ${value.toLocaleString()}`
            },
            { 
              title: 'Eficiência', 
              dataIndex: 'efficiency', 
              key: 'efficiency',
              render: (value: string) => (
                <Tag color={value === 'Alta' ? 'green' : value === 'Média' ? 'orange' : 'red'}>
                  {value}
                </Tag>
              )
            }
          ]}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );

  const renderFinancialReport = (data: any) => (
    <div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Card title="Resumo Financeiro">
            <Statistic 
              title="Receita Total" 
              value={data.summary.totalValue} 
              prefix="R$"
              valueStyle={{ color: '#52c41a' }}
            />
            <Statistic 
              title="Ticket Médio" 
              value={Math.round(data.summary.averageValue)} 
              prefix="R$"
              style={{ marginTop: 16 }}
            />
            <div style={{ marginTop: 16 }}>
              <Text strong>Área com Maior Receita:</Text>
              <div>{data.summary.topArea}</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Receita por Área">
            {data.areas.map((area: any, index: number) => (
              <div key={index} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{area.area}</span>
                  <span>{area.percentage.toFixed(1)}%</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  R$ {area.value.toLocaleString()} ({area.processes} processos)
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderTeamReport = (data: any) => (
    <div>
      <Card title="Performance da Equipe">
        <Row gutter={16}>
          {data.team.map((member: any, index: number) => (
            <Col xs={24} sm={8} key={index}>
              <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={48} icon={<UserOutlined />} style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{member.name}</div>
                  <div style={{ color: '#666', fontSize: '12px', marginBottom: 8 }}>
                    {member.role}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Eficiência</div>
                      <div style={{ fontWeight: 'bold', color: '#52c41a' }}>{member.efficiency}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Processos</div>
                      <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{member.processes}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#52c41a', fontWeight: 'bold' }}>
                    R$ {member.value.toLocaleString()}
                  </div>
                  {member.specialization && (
                    <div style={{ fontSize: '10px', color: '#666', marginTop: 4 }}>
                      {member.specialization.join(', ')}
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );

  const renderDeadlinesReport = (data: any) => (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Total" value={data.summary.total} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Urgentes" value={data.summary.urgent} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Atrasados" value={data.summary.overdue} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Próximos" value={data.summary.upcoming} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Card title="Processos por Prazo">
        <Table
          dataSource={data.deadlines}
          columns={[
            { title: 'Processo', dataIndex: 'title', key: 'title' },
            { title: 'Cliente', dataIndex: 'client', key: 'client' },
            { title: 'Vencimento', dataIndex: 'dueDate', key: 'dueDate' },
            { 
              title: 'Dias Restantes', 
              dataIndex: 'daysUntilDue', 
              key: 'daysUntilDue',
              render: (value: number) => (
                <Tag color={value < 0 ? 'red' : value <= 7 ? 'orange' : 'green'}>
                  {value} dias
                </Tag>
              )
            },
            { 
              title: 'Status', 
              dataIndex: 'status', 
              key: 'status',
              render: (status: string) => (
                <Tag color={status === 'overdue' ? 'red' : status === 'urgent' ? 'orange' : 'green'}>
                  {status === 'overdue' ? 'Atrasado' : status === 'urgent' ? 'Urgente' : 'Normal'}
                </Tag>
              )
            },
            { title: 'Responsável', dataIndex: 'assignedTo', key: 'assignedTo' }
          ]}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );

  // Funções para gerenciar equipe
  const handleAddTeamMember = () => {
    setEditingMember(null);
    teamForm.resetFields();
    setTeamModalVisible(true);
  };

  const handleEditTeamMember = (member: any) => {
    setEditingMember(member);
    teamForm.setFieldsValue(member);
    setTeamModalVisible(true);
  };

  const handleTeamModalOk = async () => {
    try {
      const values = await teamForm.validateFields();
      
      if (editingMember) {
        // Atualizar membro existente
        const updatedMembers = teamPerformance.map(member => 
          member.user === editingMember.user ? { ...member, ...values } : member
        );
        setTeamPerformance(updatedMembers);
        message.success('Membro da equipe atualizado com sucesso!');
      } else {
        // Adicionar novo membro
        const newMember = {
          user: values.name,
          processes: 0,
          completion: 0,
          value: 0,
          efficiency: 0,
          avgTime: 0,
          role: values.role,
          email: values.email,
          phone: values.phone,
          specialization: values.specialization
        };
        setTeamPerformance([...teamPerformance, newMember]);
        message.success('Membro da equipe adicionado com sucesso!');
      }
      
      setTeamModalVisible(false);
      teamForm.resetFields();
      setEditingMember(null);
    } catch (error) {
      console.error('Erro ao salvar membro da equipe:', error);
      message.error('Erro ao salvar membro da equipe');
    }
  };

  const handleDeleteTeamMember = (memberName: string) => {
    Modal.confirm({
      title: 'Confirmar Exclusão',
      content: `Tem certeza que deseja remover ${memberName} da equipe?`,
      onOk: () => {
        setTeamPerformance(teamPerformance.filter(member => member.user !== memberName));
        message.success('Membro da equipe removido com sucesso!');
      }
    });
  };

  // Carregar processos
  const loadProcesses = async () => {
    try {
      // Dados mockados mais realistas para testar insights
      const mockProcesses = [
        // Processos em Análise Inicial (gargalo)
        {
          id: 1,
          title: "Processo de Divórcio - Silva vs Silva",
          process_number: "0001234-56.2024.8.26.0001",
          client_name: "João Silva",
          status: "active",
          priority: "high",
          current_stage: {
            id: 1,
            name: "Análise Inicial",
            color: "#1890ff"
          },
          previous_stage: null,
          created_at: '2024-01-15',
          due_date: '2024-02-15',
          value: 5000,
          days_in_stage: 25, // Muito tempo na etapa
          assigned_to: 'João Advogado'
        },
        {
          id: 2,
          title: "Ação de Cobrança - Empresa ABC",
          process_number: "0001235-67.2024.8.26.0001",
          client_name: "Empresa ABC Ltda",
          status: "active",
          priority: "medium",
          current_stage: {
            id: 1,
            name: "Análise Inicial",
            color: "#1890ff"
          },
          previous_stage: null,
          created_at: '2024-01-20',
          due_date: '2024-03-01',
          value: 8000,
          days_in_stage: 20, // Muito tempo na etapa
          assigned_to: 'Maria Calculista'
        },
        {
          id: 3,
          title: "Ação Trabalhista - Funcionário XYZ",
          process_number: "0001236-78.2024.8.26.0001",
          client_name: "Maria Santos",
          status: "active",
          priority: "urgent",
          current_stage: {
            id: 1,
            name: "Análise Inicial",
            color: "#1890ff"
          },
          previous_stage: null,
          created_at: '2024-01-10',
          due_date: '2024-01-25', // Próximo do vencimento
          value: 12000,
          days_in_stage: 15,
          assigned_to: 'Carlos Cliente'
        },
        // Processos em Documentação
        {
          id: 4,
          title: "Processo de Inventário - Família Costa",
          process_number: "0001237-89.2024.8.26.0001",
          client_name: "Ana Costa",
          status: "active",
          priority: "medium",
          current_stage: {
            id: 2,
            name: "Documentação",
            color: "#52c41a"
          },
          previous_stage: "Análise Inicial",
          created_at: '2024-01-05',
          due_date: '2024-02-20',
          value: 6000,
          days_in_stage: 8,
          assigned_to: 'João Advogado'
        },
        {
          id: 5,
          title: "Ação de Alimentos - Menor de Idade",
          process_number: "0001238-90.2024.8.26.0001",
          client_name: "Carlos Lima",
          status: "active",
          priority: "high",
          current_stage: {
            id: 2,
            name: "Documentação",
            color: "#52c41a"
          },
          previous_stage: "Análise Inicial",
          created_at: '2024-01-08',
          due_date: '2024-02-10',
          value: 9000,
          days_in_stage: 12,
          assigned_to: 'Maria Calculista'
        },
        // Processos em Petição
        {
          id: 6,
          title: "Ação de Cobrança - Contrato de Prestação",
          process_number: "0001239-01.2024.8.26.0001",
          client_name: "Lucia Ferreira",
          status: "active",
          priority: "medium",
          current_stage: {
            id: 3,
            name: "Petição",
            color: "#faad14"
          },
          previous_stage: "Documentação",
          created_at: '2024-01-01',
          due_date: '2024-02-05',
          value: 7000,
          days_in_stage: 5,
          assigned_to: 'João Advogado'
        },
        {
          id: 7,
          title: "Ação de Danos Morais - Acidente de Trânsito",
          process_number: "0001240-12.2024.8.26.0001",
          client_name: "Roberto Alves",
          status: "active",
          priority: "high",
          current_stage: {
            id: 3,
            name: "Petição",
            color: "#faad14"
          },
          previous_stage: "Documentação",
          created_at: '2024-01-03',
          due_date: '2024-01-30', // Próximo do vencimento
          value: 11000,
          days_in_stage: 3,
          assigned_to: 'Carlos Cliente'
        },
        // Processos em Audiência
        {
          id: 8,
          title: "Ação de Reconhecimento de Paternidade",
          process_number: "0001241-23.2024.8.26.0001",
          client_name: "Fernanda Rocha",
          status: "active",
          priority: "medium",
          current_stage: {
            id: 4,
            name: "Audiência",
            color: "#722ed1"
          },
          previous_stage: "Petição",
          created_at: '2023-12-15',
          due_date: '2024-02-15',
          value: 15000,
          days_in_stage: 10,
          assigned_to: 'Maria Calculista'
        },
        // Processos Concluídos (para análise de conversão)
        {
          id: 9,
          title: "Ação de Cobrança - Contrato de Locação",
          process_number: "0001242-34.2024.8.26.0001",
          client_name: "Paulo Mendes",
          status: "completed",
          priority: "medium",
          current_stage: {
            id: 5,
            name: "Concluído",
            color: "#52c41a"
          },
          previous_stage: "Audiência",
          created_at: '2023-11-20',
          due_date: '2024-01-20',
          value: 13000,
          days_in_stage: 0,
          assigned_to: 'João Advogado'
        },
        {
          id: 10,
          title: "Ação de Divórcio Consensual",
          process_number: "0001243-45.2024.8.26.0001",
          client_name: "Sandra Oliveira",
          status: "completed",
          priority: "high",
          current_stage: {
            id: 5,
            name: "Concluído",
            color: "#52c41a"
          },
          previous_stage: "Audiência",
          created_at: '2023-12-01',
          due_date: '2024-01-15',
          value: 18000,
          days_in_stage: 0,
          assigned_to: 'Carlos Cliente'
        },
        // Processos com risco de prazo
        {
          id: 11,
          title: "Ação de Alimentos - Urgente",
          process_number: "0001244-56.2024.8.26.0001",
          client_name: "Marcos Silva",
          status: "active",
          priority: "urgent",
          current_stage: {
            id: 1,
            name: "Análise Inicial",
            color: "#1890ff"
          },
          previous_stage: null,
          created_at: '2024-01-18',
          due_date: '2024-01-25', // Vence em 3 dias
          value: 14000,
          days_in_stage: 7,
          assigned_to: 'João Advogado'
        },
        {
          id: 12,
          title: "Ação de Cobrança - Prazo Vencendo",
          process_number: "0001245-67.2024.8.26.0001",
          client_name: "Patricia Costa",
          status: "active",
          priority: "urgent",
          current_stage: {
            id: 2,
            name: "Documentação",
            color: "#52c41a"
          },
          previous_stage: "Análise Inicial",
          created_at: '2024-01-19',
          due_date: '2024-01-26', // Vence em 4 dias
          value: 16000,
          days_in_stage: 3,
          assigned_to: 'Maria Calculista'
        }
      ];
      setProcesses(mockProcesses);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    }
  };

  useEffect(() => {
    loadFunnels();
    loadProcesses();
    loadTeamPerformance();
    loadAutomationRules();
    loadAiInsights();
    loadRealTimeMetrics();
  }, []);

  useEffect(() => {
    if (selectedFunnel) {
      loadAnalytics(selectedFunnel.id);
    }
  }, [selectedFunnel]);

  // Criar novo funil
  const createFunnel = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/funnel/funnels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });
      
      if (response.ok) {
        message.success('Funil criado com sucesso!');
        setModalVisible(false);
        form.resetFields();
        loadFunnels();
      } else {
        message.error('Erro ao criar funil');
      }
    } catch (error) {
      console.error('Erro ao criar funil:', error);
      message.error('Erro ao criar funil');
    }
  };

  // Mover processo para nova etapa
  const moveProcessToStage = async (processId: number, stageId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/funnel/processes/${processId}/move-stage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to_stage_id: stageId,
          notes: 'Movido via interface do funil'
        })
      });
      
      if (response.ok) {
        message.success('Processo movido com sucesso!');
        loadProcesses();
        if (selectedFunnel) {
          loadAnalytics(selectedFunnel.id);
        }
      } else {
        message.error('Erro ao mover processo');
      }
    } catch (error) {
      console.error('Erro ao mover processo:', error);
      message.error('Erro ao mover processo');
    }
  };

  // Renderizar funil visual
  const renderFunnelVisual = () => {
    if (!selectedFunnel || !analytics) return null;

    const stages = selectedFunnel.stages.sort((a, b) => a.order_position - b.order_position);

    return (
      <Card title="Visualização do Funil" className="mb-4">
        <Row gutter={[16, 16]}>
          {stages.map((stage, index) => {
            const stageData = analytics.processes_by_stage[stage.name];
            const processCount = stageData?.total_processes || 0;
            const conversionRate = analytics.conversion_rate[stage.name] || 0;
            
            return (
              <Col key={stage.id} xs={24} sm={12} md={8} lg={4}>
                <Card
                  size="small"
                  style={{
                    border: `2px solid ${stage.color}`,
                    backgroundColor: `${stage.color}15`
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <Tag color={stage.color} style={{ marginBottom: 8 }}>
                      {stage.name}
                    </Tag>
                    <div>
                      <Badge count={processCount} showZero color={stage.color} />
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {stage.description}
                    </Text>
                    {conversionRate > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          Taxa: {conversionRate.toFixed(1)}%
                        </Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>
    );
  };

  // Renderizar estatísticas
  const renderStatistics = () => {
    if (!analytics) return null;

    return (
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total de Processos"
              value={analytics.total_processes}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Etapas Ativas"
              value={selectedFunnel?.stages.length || 0}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Taxa de Conversão"
              value={Object.values(analytics.conversion_rate).reduce((a, b) => a + b, 0) / Object.keys(analytics.conversion_rate).length || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Renderizar tabela de processos
  const renderProcessesTable = () => {
    const columns = [
      {
        title: 'Processo',
        dataIndex: 'title',
        key: 'title',
        render: (text: string, record: Process) => (
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.process_number}
            </Text>
          </div>
        )
      },
      {
        title: 'Cliente',
        dataIndex: 'client_name',
        key: 'client_name',
        render: (clientName: string, record: Process) => (
          <div>
            <div>{clientName}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              📱 {getClientPhone(record)}
            </div>
          </div>
        )
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'active' ? 'green' : 'orange'}>
            {status === 'active' ? 'Ativo' : 'Pausado'}
          </Tag>
        )
      },
      {
        title: 'Prioridade',
        dataIndex: 'priority',
        key: 'priority',
        render: (priority: string) => {
          const colors = {
            low: 'blue',
            medium: 'orange',
            high: 'red',
            urgent: 'purple'
          };
          return <Tag color={colors[priority as keyof typeof colors]}>
            {priority.toUpperCase()}
          </Tag>;
        }
      },
      {
        title: 'Etapa Atual',
        dataIndex: 'current_stage',
        key: 'current_stage',
        render: (stage: FunnelStage) => {
          if (!stage) return <Tag>Não definida</Tag>;
          return <Tag color={stage.color}>{stage.name}</Tag>;
        }
      },
      {
        title: 'Ações',
        key: 'actions',
        render: (text: any, record: Process) => (
          <Space>
            <Tooltip title="Enviar WhatsApp">
              <Button 
                type="text" 
                icon={<MessageOutlined />}
                onClick={() => openWhatsappModal(record)}
                style={{ color: '#25D366' }}
              />
            </Tooltip>
            <Tooltip title="Ver detalhes">
              <Button type="text" icon={<EyeOutlined />} />
            </Tooltip>
            <Tooltip title="Mover etapa">
              <Button 
                type="text" 
                icon={<ArrowRightOutlined />}
                onClick={() => {
                  // Implementar modal para mover processo
                  message.info('Funcionalidade em desenvolvimento');
                }}
              />
            </Tooltip>
          </Space>
        )
      }
    ];

    return (
      <Card title="Processos no Funil">
        <Table
          columns={columns}
          dataSource={processes}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Funil de Processos</Title>
        <Text type="secondary">
          Gerencie e acompanhe o progresso dos seus processos jurídicos
        </Text>
        
        {/* Métricas em Tempo Real (RD Station) */}
        {realTimeMetrics && (
          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col xs={24} sm={6}>
              <Card size="small">
                <Statistic
                  title="Total de Processos"
                  value={realTimeMetrics.totalProcesses}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small">
                <Statistic
                  title="Processos Ativos"
                  value={realTimeMetrics.activeProcesses}
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small">
                <Statistic
                  title="Concluídos Hoje"
                  value={realTimeMetrics.completedToday}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small">
                <Statistic
                  title="Taxa de Conversão"
                  value={realTimeMetrics.conversionRate}
                  suffix="%"
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        )}
      </div>

      {/* Seleção de Funil */}
      <Card className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Select
              value={selectedFunnel?.id}
              onChange={(value) => {
                const funnel = funnels.find(f => f.id === value);
                setSelectedFunnel(funnel || null);
              }}
              style={{ width: 300 }}
              placeholder="Selecionar funil"
            >
              {funnels.map(funnel => (
                <Option key={funnel.id} value={funnel.id}>
                  {funnel.name} {funnel.is_default && '(Padrão)'}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Novo Funil
              </Button>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setStageModalVisible(true)}
              >
                Gerenciar Etapas
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Estatísticas */}
      {renderStatistics()}

      {/* Visualização do Funil */}
      {renderFunnelVisual()}

      {/* Tabela de Processos */}
      {renderProcessesTable()}

      {/* Modal para criar funil */}
      <Modal
        title="Criar Novo Funil"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createFunnel}
        >
          <Form.Item
            name="name"
            label="Nome do Funil"
            rules={[{ required: true, message: 'Nome é obrigatório' }]}
          >
            <Input placeholder="Ex: Funil Jurídico Padrão" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Descrição"
          >
            <Input.TextArea rows={3} placeholder="Descrição do funil" />
          </Form.Item>
          
          <Form.Item
            name="is_default"
            label="Funil Padrão"
            valuePropName="checked"
          >
            <input type="checkbox" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Criar Funil
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para gerenciar etapas */}
      <Modal
        title="Gerenciar Etapas"
        open={stageModalVisible}
        onCancel={() => setStageModalVisible(false)}
        footer={null}
        width={800}
      >
        <Tabs 
          defaultActiveKey="stages"
          items={[
            {
              key: 'stages',
              label: 'Etapas',
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Button type="primary" icon={<PlusOutlined />}>
                      Nova Etapa
                    </Button>
                  </div>
                  
                  <Table
              columns={[
                {
                  title: 'Nome',
                  dataIndex: 'name',
                  key: 'name'
                },
                {
                  title: 'Tipo',
                  dataIndex: 'stage_type',
                  key: 'stage_type'
                },
                {
                  title: 'Ordem',
                  dataIndex: 'order_position',
                  key: 'order_position'
                },
                {
                  title: 'Cor',
                  dataIndex: 'color',
                  key: 'color',
                  render: (color: string) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div 
                        style={{ 
                          width: 20, 
                          height: 20, 
                          backgroundColor: color, 
                          borderRadius: 4,
                          marginRight: 8,
                          border: '1px solid #d9d9d9'
                        }} 
                      />
                      <span>{color}</span>
                    </div>
                  )
                },
                {
                  title: 'Ações',
                  key: 'actions',
                  render: (text: any, record: FunnelStage) => (
                    <Space>
                      <Button type="text" icon={<EditOutlined />} />
                      <Button type="text" icon={<DeleteOutlined />} danger />
                    </Space>
                  )
                }
              ]}
              dataSource={selectedFunnel?.stages || []}
              rowKey="id"
              pagination={false}
            />
                </>
              )
            },
            {
              key: 'transitions',
              label: 'Transições',
              children: (
                <Text type="secondary">
                  Configure as transições permitidas entre etapas
                </Text>
              )
            },
            {
              key: 'team',
              label: (
                <span>
                  <UserOutlined />
                  Equipe
                </span>
              ),
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={24}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4}>Performance da Equipe</Title>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={handleAddTeamMember}
                        >
                          Adicionar Membro
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    {teamPerformance.map((member, index) => (
                      <Col xs={24} sm={12} md={8} key={index}>
                        <Card 
                          size="small" 
                          style={{ marginBottom: 16 }}
                          actions={[
                            <Button 
                              type="text" 
                              icon={<EditOutlined />}
                              onClick={() => handleEditTeamMember(member)}
                            />,
                            <Button 
                              type="text" 
                              icon={<DeleteOutlined />}
                              danger
                              onClick={() => handleDeleteTeamMember(member.user)}
                            />
                          ]}
                        >
                          <div style={{ textAlign: 'center' }}>
                            <Avatar size={48} icon={<UserOutlined />} style={{ marginBottom: 8 }} />
                            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{member.user}</div>
                            <div style={{ color: '#666', fontSize: '12px', marginBottom: 8 }}>
                              {member.role || 'Advogado'} • {member.processes} processos
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Eficiência</div>
                                <div style={{ fontWeight: 'bold', color: '#52c41a' }}>{member.efficiency}%</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Tempo Médio</div>
                                <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{member.avgTime}d</div>
                              </div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#52c41a', fontWeight: 'bold' }}>
                              R$ {member.value.toLocaleString()}
                            </div>
                            {member.specialization && (
                              <div style={{ fontSize: '10px', color: '#666', marginTop: 4 }}>
                                {member.specialization}
                              </div>
                            )}
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )
            },
                {
                  key: 'automation',
                  label: (
                    <span>
                      <PlayCircleOutlined />
                      Automação
                    </span>
                  ),
                  children: (
                    <div>
                      <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={24}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={4}>Regras de Automação</Title>
                            <Button 
                              type="primary" 
                              icon={<PlusOutlined />}
                              onClick={handleCreateAutomationRule}
                            >
                              Nova Regra
                            </Button>
                          </div>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        {automationRules.map((rule) => (
                          <Col xs={24} sm={12} key={rule.id}>
                            <Card 
                              size="small" 
                              style={{ marginBottom: 16 }}
                              actions={[
                                <Button 
                                  type="text" 
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditAutomationRule(rule)}
                                />,
                                <Button 
                                  type="text" 
                                  icon={<DeleteOutlined />}
                                  danger
                                  onClick={() => handleDeleteAutomationRule(rule.id)}
                                />,
                                <Button 
                                  type="text" 
                                  onClick={() => handleToggleAutomationRule(rule.id)}
                                >
                                  {rule.isActive ? 'Desativar' : 'Ativar'}
                                </Button>
                              ]}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ fontWeight: 'bold', marginRight: 8 }}>{rule.name}</div>
                                    <Tag color={rule.priority === 'urgent' ? 'red' : rule.priority === 'high' ? 'orange' : 'blue'}>
                                      {rule.priority === 'urgent' ? 'Urgente' : rule.priority === 'high' ? 'Alta' : 'Média'}
                                    </Tag>
                                    <Tag color={rule.isActive ? 'green' : 'red'}>
                                      {rule.isActive ? 'Ativo' : 'Inativo'}
                                    </Tag>
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                    {rule.description}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#1890ff', marginBottom: 4 }}>
                                    <strong>Gatilho:</strong> {rule.trigger}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#52c41a' }}>
                                    <strong>Ação:</strong> {rule.action}
                                  </div>
                                  {rule.actionDetails && (
                                    <div style={{ fontSize: '10px', color: '#666', marginTop: 4 }}>
                                      {Object.entries(rule.actionDetails).map(([key, value]) => (
                                        <div key={key}>
                                          <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )
                },
            {
              key: 'insights',
              label: (
                <span>
                  <SettingOutlined />
                  Insights IA
                </span>
              ),
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={24}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4}>Insights de Inteligência Artificial</Title>
                        <Button 
                          type="primary" 
                          icon={<SettingOutlined />}
                          onClick={loadAiInsights}
                          loading={loading}
                        >
                          Atualizar Insights
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    {aiInsights.map((insight) => (
                      <Col xs={24} key={insight.id}>
                        <Card size="small" style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                <SettingOutlined style={{ marginRight: 8, color: '#faad14' }} />
                                <div style={{ fontWeight: 'bold' }}>{insight.title}</div>
                                <Tag 
                                  color={insight.priority === 'urgent' ? 'red' : insight.priority === 'high' ? 'orange' : insight.priority === 'medium' ? 'blue' : 'green'}
                                  style={{ marginLeft: 8 }}
                                >
                                  {insight.priority === 'urgent' ? 'Urgente' : insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                                </Tag>
                                {insight.confidence && (
                                  <Tag color="blue" style={{ marginLeft: 4 }}>
                                    {insight.confidence}% confiança
                                  </Tag>
                                )}
                                {insight.impact && (
                                  <Tag 
                                    color={insight.impact === 'high' ? 'red' : insight.impact === 'medium' ? 'orange' : 'green'}
                                    style={{ marginLeft: 4 }}
                                  >
                                    Impacto: {insight.impact === 'high' ? 'Alto' : insight.impact === 'medium' ? 'Médio' : 'Baixo'}
                                  </Tag>
                                )}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                {insight.description}
                              </div>
                              <div style={{ fontSize: '11px', color: '#52c41a', fontWeight: 'bold' }}>
                                🤖 {insight.recommendation}
                              </div>
                              {insight.type && (
                                <div style={{ fontSize: '10px', color: '#999', marginTop: 4 }}>
                                  Tipo: {insight.type === 'performance' ? 'Performance' : 
                                         insight.type === 'conversion' ? 'Conversão' :
                                         insight.type === 'deadline' ? 'Prazo' :
                                         insight.type === 'team' ? 'Equipe' :
                                         insight.type === 'trend' ? 'Tendência' : 'Análise'}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )
            },
            {
              key: 'reports',
              label: (
                <span>
                  <BarChartOutlined />
                  Relatórios
                </span>
              ),
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={24}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4}>Relatórios Jurídicos com IA</Title>
                        <Select
                          value={selectedReportType}
                          onChange={(value) => {
                            setSelectedReportType(value);
                            loadReportsData(value);
                          }}
                          style={{ width: 200 }}
                          placeholder="Selecionar relatório"
                        >
                          <Option value="overview">Visão Geral</Option>
                          <Option value="performance">Performance</Option>
                          <Option value="financial">Financeiro</Option>
                          <Option value="team">Equipe</Option>
                          <Option value="deadlines">Prazos</Option>
                        </Select>
                      </div>
                    </Col>
                  </Row>

                  {reportLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <LoadingSpinner />
                      <div style={{ marginTop: 16 }}>Gerando relatório...</div>
                    </div>
                  ) : reportsData ? (
                    <div>
                      {/* Cabeçalho do Relatório */}
                      <Card style={{ marginBottom: 24 }}>
                        <div style={{ textAlign: 'center' }}>
                          <Title level={3}>{reportsData.title}</Title>
                          <Text type="secondary">{reportsData.period}</Text>
                        </div>
                      </Card>

                      {/* Insights do Relatório */}
                      {reportsData.insights && (
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                          {reportsData.insights.map((insight: any, index: number) => (
                            <Col xs={24} sm={8} key={index}>
                              <Card size="small">
                                <Statistic
                                  title={insight.title}
                                  value={insight.value}
                                  valueStyle={{ 
                                    color: insight.type === 'success' ? '#52c41a' : 
                                           insight.type === 'warning' ? '#faad14' : 
                                           insight.type === 'error' ? '#ff4d4f' : '#1890ff'
                                  }}
                                />
                                <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
                                  {insight.description}
                                </div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}

                      {/* Conteúdo específico do relatório */}
                      {renderReportContent(reportsData)}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <BarChartOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                      <div>Selecione um tipo de relatório para gerar</div>
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'priority',
              label: (
                <span>
                  <RiseOutlined />
                  Priorização IA
                </span>
              ),
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={24}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4}>Priorização Inteligente com IA</Title>
                        <Button 
                          type="primary" 
                          icon={<RiseOutlined />}
                          onClick={loadPrioritizedProcesses}
                          loading={priorityLoading}
                        >
                          Calcular Prioridades
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {/* Configuração de Critérios */}
                  <Card title="Critérios de Priorização" style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                      <Col xs={24} sm={12} md={8}>
                        <Checkbox 
                          checked={priorityCriteria.deadline}
                          onChange={(e) => setPriorityCriteria({...priorityCriteria, deadline: e.target.checked})}
                        >
                          <strong>Prazo</strong> (40% peso)
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Processos próximos do vencimento
                          </div>
                        </Checkbox>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Checkbox 
                          checked={priorityCriteria.value}
                          onChange={(e) => setPriorityCriteria({...priorityCriteria, value: e.target.checked})}
                        >
                          <strong>Valor</strong> (25% peso)
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Processos de alto valor financeiro
                          </div>
                        </Checkbox>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Checkbox 
                          checked={priorityCriteria.complexity}
                          onChange={(e) => setPriorityCriteria({...priorityCriteria, complexity: e.target.checked})}
                        >
                          <strong>Complexidade</strong> (20% peso)
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Processos que requerem especialização
                          </div>
                        </Checkbox>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Checkbox 
                          checked={priorityCriteria.client}
                          onChange={(e) => setPriorityCriteria({...priorityCriteria, client: e.target.checked})}
                        >
                          <strong>Cliente</strong> (10% peso)
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Clientes corporativos ou VIP
                          </div>
                        </Checkbox>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Checkbox 
                          checked={priorityCriteria.stage}
                          onChange={(e) => setPriorityCriteria({...priorityCriteria, stage: e.target.checked})}
                        >
                          <strong>Etapa</strong> (5% peso)
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Etapa atual do processo
                          </div>
                        </Checkbox>
                      </Col>
                    </Row>
                  </Card>

                  {priorityLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <LoadingSpinner />
                      <div style={{ marginTop: 16 }}>Calculando prioridades com IA...</div>
                    </div>
                  ) : prioritizedProcesses.length > 0 ? (
                    <div>
                      {/* Resumo da Priorização */}
                      <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={6}>
                          <Card size="small">
                            <Statistic 
                              title="Críticos" 
                              value={prioritizedProcesses.filter(p => p.priorityLevel === 'critical').length}
                              valueStyle={{ color: '#ff4d4f' }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={6}>
                          <Card size="small">
                            <Statistic 
                              title="Alta Prioridade" 
                              value={prioritizedProcesses.filter(p => p.priorityLevel === 'high').length}
                              valueStyle={{ color: '#faad14' }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={6}>
                          <Card size="small">
                            <Statistic 
                              title="Média Prioridade" 
                              value={prioritizedProcesses.filter(p => p.priorityLevel === 'medium').length}
                              valueStyle={{ color: '#1890ff' }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={6}>
                          <Card size="small">
                            <Statistic 
                              title="Baixa Prioridade" 
                              value={prioritizedProcesses.filter(p => p.priorityLevel === 'low').length}
                              valueStyle={{ color: '#52c41a' }}
                            />
                          </Card>
                        </Col>
                      </Row>

                      {/* Lista de Processos Priorizados */}
                      <Card title="Processos Ordenados por Prioridade">
                        {prioritizedProcesses.map((process, index) => (
                          <Card 
                            key={process.id} 
                            size="small" 
                            style={{ 
                              marginBottom: 16,
                              borderLeft: `4px solid ${
                                process.priorityLevel === 'critical' ? '#ff4d4f' :
                                process.priorityLevel === 'high' ? '#faad14' :
                                process.priorityLevel === 'medium' ? '#1890ff' : '#52c41a'
                              }`
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                  <Badge 
                                    count={index + 1} 
                                    style={{ 
                                      backgroundColor: process.priorityLevel === 'critical' ? '#ff4d4f' :
                                                     process.priorityLevel === 'high' ? '#faad14' :
                                                     process.priorityLevel === 'medium' ? '#1890ff' : '#52c41a'
                                    }}
                                  />
                                  <div style={{ fontWeight: 'bold', marginLeft: 8 }}>{process.title}</div>
                                  <Tag 
                                    color={process.priorityLevel === 'critical' ? 'red' :
                                           process.priorityLevel === 'high' ? 'orange' :
                                           process.priorityLevel === 'medium' ? 'blue' : 'green'}
                                    style={{ marginLeft: 8 }}
                                  >
                                    {process.priorityLevel === 'critical' ? 'Crítico' :
                                     process.priorityLevel === 'high' ? 'Alta' :
                                     process.priorityLevel === 'medium' ? 'Média' : 'Baixa'}
                                  </Tag>
                                  <Tag color="blue" style={{ marginLeft: 4 }}>
                                    Score: {process.priorityScore}
                                  </Tag>
                                </div>
                                
                                <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                  <strong>Cliente:</strong> {process.client_name} | 
                                  <strong> Etapa:</strong> {process.current_stage?.name} | 
                                  <strong> Valor:</strong> R$ {process.value?.toLocaleString()}
                                </div>

                                {/* Breakdown do Score */}
                                <div style={{ fontSize: '11px', color: '#999', marginBottom: 8 }}>
                                  <strong>Análise:</strong> 
                                  {process.scoreBreakdown.deadline && ` Prazo: ${process.scoreBreakdown.deadline} |`}
                                  {process.scoreBreakdown.value && ` Valor: ${process.scoreBreakdown.value} |`}
                                  {process.scoreBreakdown.complexity && ` Complexidade: ${process.scoreBreakdown.complexity} |`}
                                  {process.scoreBreakdown.client && ` Cliente: ${process.scoreBreakdown.client} |`}
                                  {process.scoreBreakdown.stage && ` Etapa: ${process.scoreBreakdown.stage}`}
                                </div>

                                {/* Recomendações */}
                                {process.recommendations && process.recommendations.length > 0 && (
                                  <div style={{ fontSize: '11px', color: '#52c41a', fontWeight: 'bold' }}>
                                    <strong>🤖 Recomendações IA:</strong>
                                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                      {process.recommendations.map((rec: string, idx: number) => (
                                        <li key={idx}>{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </Card>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <RiseOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                      <div>Clique em "Calcular Prioridades" para gerar a análise inteligente</div>
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'playbook',
              label: (
                <span>
                  <PlayCircleOutlined />
                  Playbook
                </span>
              ),
              children: (
                <div>
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={24}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={4}>Playbook de Processos Jurídicos</Title>
                        <Button 
                          type="primary" 
                          icon={<PlayCircleOutlined />}
                          onClick={loadPlaybooks}
                          loading={playbookLoading}
                        >
                          Carregar Playbooks
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {playbookLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <LoadingSpinner />
                      <div style={{ marginTop: 16 }}>Carregando playbooks...</div>
                    </div>
                  ) : playbooks.length > 0 ? (
                    <div>
                      {/* Estatísticas dos Playbooks */}
                      <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={8}>
                          <Card size="small">
                            <Statistic 
                              title="Total de Playbooks" 
                              value={getPlaybookStats().total}
                              valueStyle={{ color: '#1890ff' }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Card size="small">
                            <Statistic 
                              title="Categorias" 
                              value={getPlaybookStats().categories}
                              valueStyle={{ color: '#52c41a' }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Card size="small">
                            <Statistic 
                              title="Taxa de Sucesso Média" 
                              value={`${getPlaybookStats().avgSuccessRate}%`}
                              valueStyle={{ color: '#faad14' }}
                            />
                          </Card>
                        </Col>
                      </Row>

                      {/* Playbooks por Categoria */}
                      {['Direito de Família', 'Direito Civil', 'Direito Trabalhista', 'Direito Sucessório'].map(category => {
                        const categoryPlaybooks = getPlaybookByCategory(category);
                        if (categoryPlaybooks.length === 0) return null;
                        
                        return (
                          <Card key={category} title={category} style={{ marginBottom: 24 }}>
                            <Row gutter={16}>
                              {categoryPlaybooks.map(playbook => (
                                <Col xs={24} sm={12} md={8} key={playbook.id}>
                                  <Card 
                                    size="small" 
                                    hoverable
                                    style={{ marginBottom: 16, cursor: 'pointer' }}
                                    onClick={() => openPlaybookModal(playbook)}
                                  >
                                    <div style={{ textAlign: 'center' }}>
                                      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                                        {playbook.name}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 12 }}>
                                        {playbook.description}
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div>
                                          <div style={{ fontSize: '11px', color: '#666' }}>Etapas</div>
                                          <div style={{ fontWeight: 'bold' }}>{playbook.totalSteps}</div>
                                        </div>
                                        <div>
                                          <div style={{ fontSize: '11px', color: '#666' }}>Duração</div>
                                          <div style={{ fontWeight: 'bold' }}>{playbook.estimatedDuration}</div>
                                        </div>
                                        <div>
                                          <div style={{ fontSize: '11px', color: '#666' }}>Sucesso</div>
                                          <div style={{ fontWeight: 'bold', color: '#52c41a' }}>{playbook.successRate}%</div>
                                        </div>
                                      </div>
                                      <Button 
                                        type="primary" 
                                        size="small"
                                        icon={<PlayCircleOutlined />}
                                        style={{ width: '100%' }}
                                      >
                                        Ver Playbook
                                      </Button>
                                    </div>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <PlayCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                      <div>Clique em "Carregar Playbooks" para ver os processos disponíveis</div>
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </Modal>

          {/* Modal de Regras de Automação */}
          <Modal
            title={editingRule ? 'Editar Regra de Automação' : 'Nova Regra de Automação'}
            open={automationModalVisible}
            onOk={handleAutomationModalOk}
            onCancel={() => setAutomationModalVisible(false)}
            confirmLoading={loading}
            width={600}
          >
            <Form form={automationForm} layout="vertical">
              <Form.Item name="name" label="Nome da Regra" rules={[{ required: true, message: 'Por favor, insira o nome da regra!' }]}>
                <Input placeholder="Ex: Tarefa Concluída → Próximo Colaborador" />
              </Form.Item>
              
              <Form.Item name="description" label="Descrição" rules={[{ required: true, message: 'Por favor, insira a descrição!' }]}>
                <Input.TextArea rows={3} placeholder="Descreva o que esta regra faz..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="trigger" label="Gatilho" rules={[{ required: true, message: 'Selecione o gatilho!' }]}>
                    <Select placeholder="Quando acontece...">
                      <Option value="Tarefa Concluída">Tarefa Concluída</Option>
                      <Option value="Petição Finalizada">Petição Finalizada</Option>
                      <Option value="Prazo Vencendo">Prazo Vencendo</Option>
                      <Option value="Documentos Recebidos">Documentos Recebidos</Option>
                      <Option value="Status Alterado">Status Alterado</Option>
                      <Option value="Nova Tarefa Criada">Nova Tarefa Criada</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="action" label="Ação" rules={[{ required: true, message: 'Selecione a ação!' }]}>
                    <Select placeholder="O que fazer...">
                      <Option value="Mover para Próximo">Mover para Próximo</Option>
                      <Option value="Agendar Audiência">Agendar Audiência</Option>
                      <Option value="Notificação Urgente">Notificação Urgente</Option>
                      <Option value="Criar Tarefa de Análise">Criar Tarefa de Análise</Option>
                      <Option value="Enviar E-mail">Enviar E-mail</Option>
                      <Option value="Atualizar Status">Atualizar Status</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="triggerCondition" label="Condição do Gatilho">
                <Input placeholder="Ex: status = completed AND task_type = petition" />
              </Form.Item>

              <Form.Item name="priority" label="Prioridade">
                <Select defaultValue="medium">
                  <Option value="low">Baixa</Option>
                  <Option value="medium">Média</Option>
                  <Option value="high">Alta</Option>
                  <Option value="urgent">Urgente</Option>
                </Select>
              </Form.Item>

              <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
                <Checkbox>Regra Ativa</Checkbox>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal de Gerenciamento de Equipe */}
          <Modal
            title={editingMember ? 'Editar Membro da Equipe' : 'Adicionar Membro da Equipe'}
            open={teamModalVisible}
            onOk={handleTeamModalOk}
            onCancel={() => setTeamModalVisible(false)}
            confirmLoading={loading}
            width={500}
          >
            <Form form={teamForm} layout="vertical">
              <Form.Item name="name" label="Nome Completo" rules={[{ required: true, message: 'Por favor, insira o nome!' }]}>
                <Input placeholder="Ex: João Advogado" />
              </Form.Item>
              
              <Form.Item name="role" label="Cargo" rules={[{ required: true, message: 'Por favor, selecione o cargo!' }]}>
                <Select placeholder="Selecione o cargo">
                  <Option value="Sócio">Sócio</Option>
                  <Option value="Advogado">Advogado</Option>
                  <Option value="Estagiário">Estagiário</Option>
                  <Option value="Secretário">Secretário</Option>
                  <Option value="Assistente">Assistente</Option>
                </Select>
              </Form.Item>

              <Form.Item name="email" label="E-mail" rules={[{ required: true, message: 'Por favor, insira o e-mail!' }]}>
                <Input placeholder="joao@escritorio.com" />
              </Form.Item>

              <Form.Item name="phone" label="Telefone">
                <Input placeholder="(11) 99999-9999" />
              </Form.Item>

              <Form.Item name="specialization" label="Especialização">
                <Select placeholder="Selecione a especialização" mode="multiple">
                  <Option value="Direito Civil">Direito Civil</Option>
                  <Option value="Direito Criminal">Direito Criminal</Option>
                  <Option value="Direito Trabalhista">Direito Trabalhista</Option>
                  <Option value="Direito Tributário">Direito Tributário</Option>
                  <Option value="Direito Empresarial">Direito Empresarial</Option>
                  <Option value="Direito de Família">Direito de Família</Option>
                  <Option value="Direito Previdenciário">Direito Previdenciário</Option>
                </Select>
              </Form.Item>
            </Form>
        </Modal>

        {/* Modal do WhatsApp */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <MessageOutlined style={{ color: '#25D366', marginRight: 8 }} />
              WhatsApp - {selectedClient?.client_name}
            </div>
          }
          open={whatsappModalVisible}
          onCancel={() => setWhatsappModalVisible(false)}
          footer={null}
          width={800}
          style={{ top: 20 }}
        >
          <div style={{ display: 'flex', height: '500px' }}>
            {/* Sidebar com templates */}
            <div style={{ width: '300px', borderRight: '1px solid #f0f0f0', paddingRight: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>Templates de Mensagem</Title>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {whatsappTemplates.map(template => (
                    <Card 
                      key={template.id} 
                      size="small" 
                      style={{ 
                        marginBottom: 8, 
                        cursor: 'pointer',
                        border: selectedTemplate === template.id ? '2px solid #25D366' : '1px solid #d9d9d9'
                      }}
                      onClick={() => useTemplate(template)}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                        {template.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: 4 }}>
                        {template.category}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Área de conversa */}
            <div style={{ flex: 1, paddingLeft: 16 }}>
              {/* Cabeçalho do cliente */}
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px', 
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{selectedClient?.client_name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    📱 {getClientPhone(selectedClient)}
                  </div>
                </div>
                <Button 
                  type="primary" 
                  size="small"
                  style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                  onClick={() => window.open(`https://wa.me/55${getClientPhone(selectedClient).replace(/\D/g, '')}`, '_blank')}
                >
                  Abrir WhatsApp
                </Button>
              </div>

              {/* Histórico de mensagens */}
              <div style={{ 
                height: '300px', 
                overflowY: 'auto', 
                border: '1px solid #f0f0f0', 
                borderRadius: '8px',
                padding: '12px',
                marginBottom: 16,
                backgroundColor: '#fafafa'
              }}>
                {whatsappMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    style={{ 
                      marginBottom: 12,
                      display: 'flex',
                      justifyContent: msg.type === 'sent' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      backgroundColor: msg.type === 'sent' ? '#25D366' : '#e5e5ea',
                      color: msg.type === 'sent' ? 'white' : 'black',
                      fontSize: '14px'
                    }}>
                      <div>{msg.content}</div>
                      <div style={{ 
                        fontSize: '11px', 
                        opacity: 0.7, 
                        marginTop: 4,
                        textAlign: 'right'
                      }}>
                        {msg.timestamp}
                        {msg.type === 'sent' && (
                          <span style={{ marginLeft: 4 }}>
                            {msg.status === 'sending' ? '⏳' : 
                             msg.status === 'delivered' ? '✓' : 
                             msg.status === 'read' ? '✓✓' : '⏳'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Área de envio */}
              <div style={{ display: 'flex', gap: 8 }}>
                <Input.TextArea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ flex: 1 }}
                  onPressEnter={(e) => {
                    if (e.shiftKey) return;
                    e.preventDefault();
                    sendWhatsappMessage();
                  }}
                />
                <Button 
                  type="primary"
                  icon={<MessageOutlined />}
                  onClick={sendWhatsappMessage}
                  disabled={!newMessage.trim()}
                  style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Modal do Playbook */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PlayCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              {selectedPlaybook?.name} - {selectedPlaybook?.category}
            </div>
          }
          open={playbookModalVisible}
          onCancel={() => setPlaybookModalVisible(false)}
          footer={null}
          width={900}
          style={{ top: 20 }}
        >
          {selectedPlaybook && (
            <div>
              {/* Cabeçalho do Playbook */}
              <Card style={{ marginBottom: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={3}>{selectedPlaybook.name}</Title>
                  <Text type="secondary">{selectedPlaybook.description}</Text>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 24 }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Etapas</div>
                      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{selectedPlaybook.totalSteps}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Duração Estimada</div>
                      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{selectedPlaybook.estimatedDuration}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Taxa de Sucesso</div>
                      <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#52c41a' }}>{selectedPlaybook.successRate}%</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Etapas do Playbook */}
              <div>
                <Title level={4}>Etapas do Processo</Title>
                {selectedPlaybook.steps.map((step: any, index: number) => (
                  <Card 
                    key={step.id} 
                    size="small" 
                    style={{ 
                      marginBottom: 16,
                      borderLeft: `4px solid #1890ff`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <Badge 
                            count={index + 1} 
                            style={{ backgroundColor: '#1890ff' }}
                          />
                          <div style={{ fontWeight: 'bold', marginLeft: 8 }}>{step.title}</div>
                        </div>
                        
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: 12 }}>
                          {step.description}
                        </div>

                        {/* Tarefas */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: 4 }}>Tarefas:</div>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: '11px' }}>
                            {step.tasks.map((task: string, idx: number) => (
                              <li key={idx}>{task}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Informações da Etapa */}
                        <div style={{ display: 'flex', gap: 16, fontSize: '11px', color: '#666' }}>
                          <div>
                            <strong>Tempo:</strong> {step.estimatedTime}
                          </div>
                          <div>
                            <strong>Responsável:</strong> {step.responsible}
                          </div>
                        </div>

                        {/* Documentos */}
                        {step.documents && step.documents.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: 4 }}>Documentos:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {step.documents.map((doc: string, idx: number) => (
                                <Tag key={idx} size="small" color="blue">
                                  {doc}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Ações do Playbook */}
              <div style={{ textAlign: 'center', marginTop: 24, padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <Title level={5}>Ações Disponíveis</Title>
                <Space>
                  <Button type="primary" icon={<PlayCircleOutlined />}>
                    Iniciar Processo
                  </Button>
                  <Button icon={<BarChartOutlined />}>
                    Ver Estatísticas
                  </Button>
                  <Button icon={<SettingOutlined />}>
                    Personalizar
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Modal>
        </div>
      );
    };
