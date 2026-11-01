import { MATERIAL_TYPES } from '../models/types.js';

type Schema = Record<string, unknown>;

function successResponse(
  description: string,
  data: Schema,
  additionalProperties: Record<string, Schema> = {}
) {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data,
            ...additionalProperties,
          },
        },
      },
    },
  };
}

function errorResponse(description: string) {
  return {
    description,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
      },
    },
  };
}

function jsonRequest(description: string, schema: Schema) {
  return {
    required: true,
    description,
    content: { 'application/json': { schema } },
  };
}

function pathParameter(name: string, description: string) {
  return {
    name,
    in: 'path',
    required: true,
    description,
    schema: { type: 'string' },
  };
}

const bearerSecurity = [{ bearerAuth: [] }];
const userSchema = { $ref: '#/components/schemas/User' };
const collectionSchema = { $ref: '#/components/schemas/Collection' };
const transactionSchema = { $ref: '#/components/schemas/TokenTransaction' };
const materialSchema = { $ref: '#/components/schemas/MaterialInfo' };
const pointSchema = { $ref: '#/components/schemas/CollectionPoint' };

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Ciclo — API de Rastreio de Reciclagem',
    version: '1.0.0',
    description: 'API REST para autenticação, coletas, carteira de tokens e impacto ambiental.',
  },
  servers: [{ url: '/api', description: 'API do Ciclo' }],
  tags: [
    { name: 'Autenticação', description: 'Sessão e perfil do depositador.' },
    { name: 'Coletas', description: 'Registro de depósitos verificados e histórico.' },
    { name: 'Carteira', description: 'Saldo, movimentações e extrato em PDF.' },
    { name: 'Impacto', description: 'Indicadores de impacto ambiental.' },
    { name: 'Materiais', description: 'Guia de descarte e preparação.' },
    { name: 'Pontos', description: 'Pontos de coleta disponíveis.' },
    { name: 'Notificações', description: 'Avisos e estado de leitura.' },
    { name: 'Rastreio público', description: 'Consulta de entregas por etiqueta.' },
    { name: 'Sistema', description: 'Estado do serviço.' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Verifica a disponibilidade da API',
        servers: [{ url: '/' }],
        responses: {
          '200': {
            description: 'Serviço disponível.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    timestamp: { type: 'string', format: 'date-time' },
                    service: { type: 'string' },
                    version: { type: 'string' },
                    uptime: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/google': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autentica uma conta Google',
        description: 'Valida a credencial OpenID Connect emitida pelo Google e cria uma sessão JWT do Ciclo.',
        requestBody: jsonRequest('Envie o ID token retornado pelo Google Identity Services.', {
          type: 'object',
          required: ['credential'],
          properties: { credential: { type: 'string', description: 'Google ID token.' } },
        }),
        responses: {
          '200': successResponse('Sessão criada.', {
            type: 'object',
            properties: {
              token: { type: 'string', description: 'JWT para usar como Bearer token.' },
              user: userSchema,
            },
          }),
          '400': errorResponse('Dados inválidos.'),
          '401': errorResponse('Credencial Google inválida, expirada ou sem e-mail verificado.'),
          '500': errorResponse('Autenticação Google não configurada no servidor.'),
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Autenticação'],
        summary: 'Consulta o perfil autenticado',
        security: bearerSecurity,
        responses: {
          '200': successResponse('Perfil do usuário.', userSchema),
          '401': errorResponse('Token ausente ou inválido.'),
        },
      },
      put: {
        tags: ['Autenticação'],
        summary: 'Atualiza nome e e-mail do perfil',
        security: bearerSecurity,
        requestBody: jsonRequest('Campos que devem ser atualizados.', {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, example: 'Marina Costa' },
            email: { type: 'string', format: 'email', example: 'marina.costa@email.com' },
          },
        }),
        responses: {
          '200': successResponse('Perfil atualizado.', userSchema),
          '400': errorResponse('Dados inválidos.'),
          '401': errorResponse('Token ausente ou inválido.'),
        },
      },
    },
    '/collections': {
      get: {
        tags: ['Coletas'],
        summary: 'Lista as coletas do usuário',
        security: bearerSecurity,
        responses: {
          '200': successResponse('Histórico de coletas.', { type: 'array', items: collectionSchema }, {
            count: { type: 'integer', example: 4 },
          }),
          '401': errorResponse('Token ausente ou inválido.'),
        },
      },
      post: {
        tags: ['Coletas'],
        summary: 'Registra um depósito após a verificação',
        security: bearerSecurity,
        requestBody: jsonRequest('Só registre o depósito depois de conferir o material e aferir o peso.', {
          type: 'object',
          required: ['material', 'weightKg'],
          properties: {
            material: { type: 'string', enum: MATERIAL_TYPES },
            weightKg: { type: 'number', exclusiveMinimum: 0, example: 2.5, description: 'Peso verificado em quilogramas.' },
            pointId: { type: 'string', example: 'pt_01' },
          },
        }),
        responses: {
          '201': successResponse('Entrega registrada.', collectionSchema),
          '400': errorResponse('Dados inválidos.'),
          '401': errorResponse('Token ausente ou inválido.'),
        },
      },
    },
    '/collections/{id}': {
      get: {
        tags: ['Coletas'],
        summary: 'Consulta uma coleta pelo identificador',
        security: bearerSecurity,
        parameters: [pathParameter('id', 'Identificador da coleta.')],
        responses: {
          '200': successResponse('Coleta encontrada.', collectionSchema),
          '401': errorResponse('Token ausente ou inválido.'),
          '404': errorResponse('Coleta não encontrada.'),
        },
      },
    },
    '/wallet': {
      get: {
        tags: ['Carteira'],
        summary: 'Consulta o resumo da carteira',
        security: bearerSecurity,
        responses: {
          '200': successResponse('Saldo e resumo.', { $ref: '#/components/schemas/WalletSummary' }),
          '401': errorResponse('Token ausente ou inválido.'),
        },
      },
    },
    '/wallet/transactions': {
      get: {
        tags: ['Carteira'],
        summary: 'Lista as movimentações de tokens',
        security: bearerSecurity,
        parameters: [{ name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } }],
        responses: {
          '200': successResponse('Movimentações da carteira.', { type: 'array', items: transactionSchema }, {
            count: { type: 'integer' },
            total: { type: 'integer' },
          }),
          '401': errorResponse('Token ausente ou inválido.'),
        },
      },
    },
    '/wallet/statement/pdf': {
      get: {
        tags: ['Carteira'],
        summary: 'Baixa o extrato em PDF',
        security: bearerSecurity,
        responses: {
          '200': {
            description: 'Arquivo PDF do extrato.',
            content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
          },
          '401': errorResponse('Token ausente ou inválido.'),
        },
      },
    },
    '/impact': {
      get: {
        tags: ['Impacto'],
        summary: 'Consulta o impacto ambiental do usuário',
        security: bearerSecurity,
        responses: {
          '200': successResponse('Indicadores ambientais.', { $ref: '#/components/schemas/ImpactStats' }),
          '401': errorResponse('Token ausente ou inválido.'),
        },
      },
    },
    '/materials': {
      get: {
        tags: ['Materiais'],
        summary: 'Lista materiais e orientações de descarte',
        responses: {
          '200': successResponse('Materiais disponíveis.', { type: 'array', items: materialSchema }, {
            count: { type: 'integer' },
          }),
        },
      },
    },
    '/materials/{label}': {
      get: {
        tags: ['Materiais'],
        summary: 'Consulta um material pelo código',
        parameters: [{ ...pathParameter('label', 'Código do material.'), schema: { type: 'string', enum: MATERIAL_TYPES } }],
        responses: {
          '200': successResponse('Material encontrado.', materialSchema),
          '404': errorResponse('Material não encontrado.'),
        },
      },
    },
    '/points': {
      get: {
        tags: ['Pontos'],
        summary: 'Lista os pontos de coleta',
        responses: {
          '200': successResponse('Pontos disponíveis.', { type: 'array', items: pointSchema }, {
            count: { type: 'integer' },
          }),
        },
      },
    },
    '/points/{id}': {
      get: {
        tags: ['Pontos'],
        summary: 'Consulta um ponto de coleta pelo identificador',
        parameters: [pathParameter('id', 'Identificador do ponto.')],
        responses: {
          '200': successResponse('Ponto encontrado.', pointSchema),
          '404': errorResponse('Ponto de coleta não encontrado.'),
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notificações'],
        summary: 'Lista notificações e quantidade de não lidas',
        security: bearerSecurity,
        responses: {
          '200': successResponse('Notificações do usuário.', { type: 'array', items: { $ref: '#/components/schemas/NotificationItem' } }, {
            unreadCount: { type: 'integer' },
          }),
          '401': errorResponse('Token ausente ou inválido.'),
        },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notificações'],
        summary: 'Marca uma notificação como lida',
        security: bearerSecurity,
        parameters: [pathParameter('id', 'Identificador da notificação.')],
        responses: {
          '200': successResponse('Notificação marcada como lida.', { $ref: '#/components/schemas/NotificationItem' }),
          '401': errorResponse('Token ausente ou inválido.'),
          '404': errorResponse('Notificação não encontrada.'),
        },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notificações'],
        summary: 'Marca todas as notificações como lidas',
        security: bearerSecurity,
        responses: {
          '200': {
            description: 'Todas as notificações foram marcadas como lidas.',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } },
          },
          '401': errorResponse('Token ausente ou inválido.'),
        },
      },
    },
    '/track/{tag}': {
      get: {
        tags: ['Rastreio público'],
        summary: 'Rastreia entregas por etiqueta',
        description: 'Endpoint público que lista somente depósitos verificados. Aceita a etiqueta com ou sem #.',
        parameters: [pathParameter('tag', 'Etiqueta do usuário, por exemplo 48237.')],
        responses: {
          '200': {
            description: 'Entregas encontradas.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    tag: { type: 'string', example: '#48237' },
                    totalDeliveries: { type: 'integer' },
                    deliveries: { type: 'array', items: collectionSchema },
                  },
                },
              },
            },
          },
          '404': errorResponse('Nenhuma entrega encontrada para a etiqueta.'),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          avatarUrl: { type: 'string', format: 'uri', nullable: true },
          identifierTag: { type: 'string', example: '#48237' },
          status: { type: 'string', enum: ['Ativo', 'Inativo'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CollectionStatus: {
        type: 'string',
        enum: ['Verificado'],
      },
      Collection: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          identifierTag: { type: 'string' },
          date: { type: 'string', example: '06 set 2026' },
          createdAt: { type: 'string', format: 'date-time' },
          material: { type: 'string', enum: MATERIAL_TYPES },
          materialName: { type: 'string' },
          weightKg: { type: 'number' },
          weightFormatted: { type: 'string', example: '3,80 kg' },
          status: { $ref: '#/components/schemas/CollectionStatus' },
          detail: { type: 'string' },
          pointId: { type: 'string', nullable: true },
          pointName: { type: 'string', nullable: true },
          verifiedAt: { type: 'string', format: 'date-time', nullable: true },
          tokensCredited: { type: 'integer', nullable: true },
        },
      },
      TokenTransaction: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          collectionId: { type: 'string', nullable: true },
          date: { type: 'string' },
          time: { type: 'string' },
          title: { type: 'string' },
          amount: { type: 'number' },
          amountFormatted: { type: 'string' },
          positive: { type: 'boolean' },
          detail: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      WalletSummary: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          balanceTokens: { type: 'number' },
          tokensThisMonth: { type: 'number' },
          totalDeliveredKg: { type: 'number' },
          totalTokensGenerated: { type: 'number' },
          tokenRatioText: { type: 'string' },
        },
      },
      MaterialInfo: {
        type: 'object',
        properties: {
          label: { type: 'string', enum: MATERIAL_TYPES },
          name: { type: 'string' },
          totalKg: { type: 'number' },
          percentage: { type: 'number' },
          className: { type: 'string' },
          color: { type: 'string' },
          whatToDiscard: { type: 'string' },
          howToPrepare: { type: 'string' },
          tokensPerKg: { type: 'number' },
        },
      },
      CollectionPoint: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code: { type: 'string' },
          name: { type: 'string' },
          address: { type: 'string' },
          hours: { type: 'string' },
          status: { type: 'string', enum: ['Aberto', 'Fechado'] },
          specialNotes: { type: 'string', nullable: true },
          coordinates: {
            type: 'object',
            nullable: true,
            properties: { lat: { type: 'number' }, lng: { type: 'number' } },
          },
        },
      },
      NotificationItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          title: { type: 'string' },
          subtitle: { type: 'string' },
          message: { type: 'string' },
          read: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          type: { type: 'string', enum: ['info', 'success', 'alert'] },
        },
      },
      ImpactStats: {
        type: 'object',
        properties: {
          totalWeightKg: { type: 'number' },
          totalWeightFormatted: { type: 'string' },
          co2AvoidedKg: { type: 'number' },
          treesEquivalent: { type: 'number' },
          waterSavedLiters: { type: 'integer' },
          materials: { type: 'array', items: materialSchema },
        },
      },
    },
  },
};