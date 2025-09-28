# ===========================================
# WEBSOCKET ENDPOINTS
# ===========================================

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict
import json
import asyncio
from datetime import datetime

router = APIRouter()

# ===========================================
# GERENCIADOR DE CONEXÕES WEBSOCKET
# ===========================================

class ConnectionManager:
    def __init__(self):
        # Armazenar conexões ativas por usuário
        self.active_connections: Dict[int, List[WebSocket]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        print(f"Usuário {user_id} conectado. Total de conexões: {len(self.active_connections[user_id])}")
        
    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                
            # Se não há mais conexões para este usuário, remover a entrada
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
        print(f"Usuário {user_id} desconectado")
        
    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            # Enviar para todas as conexões do usuário
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_text(json.dumps(message))
                except:
                    # Remover conexão se falhar
                    if websocket in self.active_connections[user_id]:
                        self.active_connections[user_id].remove(websocket)
                        
    async def broadcast(self, message: dict):
        """Enviar mensagem para todos os usuários conectados"""
        for user_id, connections in self.active_connections.items():
            for websocket in connections:
                try:
                    await websocket.send_text(json.dumps(message))
                except:
                    # Remover conexão se falhar
                    if websocket in connections:
                        connections.remove(websocket)

# Instância global do gerenciador
manager = ConnectionManager()

# ===========================================
# ENDPOINTS WEBSOCKET
# ===========================================

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """Endpoint principal do WebSocket"""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Aguardar mensagens do cliente
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Processar mensagem recebida
            if message.get("type") == "ping":
                await manager.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.now().isoformat()
                }, user_id)
                
            elif message.get("type") == "notification_read":
                # Marcar notificação como lida
                notification_id = message.get("notification_id")
                await manager.send_personal_message({
                    "type": "notification_read_confirmed",
                    "notification_id": notification_id,
                    "timestamp": datetime.now().isoformat()
                }, user_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"Erro no WebSocket: {e}")
        manager.disconnect(websocket, user_id)

# ===========================================
# FUNÇÕES AUXILIARES
# ===========================================

async def send_notification_to_user(user_id: int, notification: dict):
    """Enviar notificação para um usuário específico"""
    await manager.send_personal_message({
        "type": "notification",
        "data": notification,
        "timestamp": datetime.now().isoformat()
    }, user_id)

async def send_task_update_to_user(user_id: int, task: dict):
    """Enviar atualização de tarefa para um usuário específico"""
    await manager.send_personal_message({
        "type": "task_update",
        "data": task,
        "timestamp": datetime.now().isoformat()
    }, user_id)

async def send_process_update_to_user(user_id: int, process: dict):
    """Enviar atualização de processo para um usuário específico"""
    await manager.send_personal_message({
        "type": "process_update",
        "data": process,
        "timestamp": datetime.now().isoformat()
    }, user_id)

async def broadcast_system_message(message: str, message_type: str = "info"):
    """Enviar mensagem do sistema para todos os usuários"""
    await manager.broadcast({
        "type": "system_message",
        "message": message,
        "message_type": message_type,
        "timestamp": datetime.now().isoformat()
    })

# ===========================================
# ENDPOINTS PARA TESTE
# ===========================================

@router.post("/test/notification/{user_id}")
async def test_notification(user_id: int, message: str):
    """Endpoint para testar notificações"""
    await send_notification_to_user(user_id, {
        "title": "Notificação de Teste",
        "message": message,
        "type": "info"
    })
    return {"status": "sent"}

@router.post("/test/broadcast")
async def test_broadcast(message: str):
    """Endpoint para testar broadcast"""
    await broadcast_system_message(message, "info")
    return {"status": "broadcasted"}

@router.get("/connections")
async def get_connections():
    """Obter informações sobre conexões ativas"""
    return {
        "total_users": len(manager.active_connections),
        "total_connections": sum(len(conns) for conns in manager.active_connections.values()),
        "users": list(manager.active_connections.keys())
    }







