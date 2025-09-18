# ===========================================
# CONFIGURAÇÃO DO REDIS
# ===========================================

import redis.asyncio as redis
import logging
from typing import Optional

from app.core.config import settings, get_redis_url

logger = logging.getLogger(__name__)

# ===========================================
# CLIENTE REDIS GLOBAL
# ===========================================

redis_client: Optional[redis.Redis] = None

# ===========================================
# FUNÇÕES DE CONFIGURAÇÃO
# ===========================================

async def create_redis_client() -> redis.Redis:
    """Criar cliente Redis com configurações adequadas."""
    try:
        client = redis.from_url(
            get_redis_url(),
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30
        )
        
        # Testar conexão
        await client.ping()
        logger.info("✅ Cliente Redis criado com sucesso")
        return client
        
    except Exception as e:
        logger.error(f"❌ Erro ao criar cliente Redis: {e}")
        raise

async def get_redis() -> redis.Redis:
    """Obter cliente Redis (singleton)."""
    global redis_client
    
    if redis_client is None:
        redis_client = await create_redis_client()
    
    return redis_client

async def close_redis():
    """Fechar conexão com Redis."""
    global redis_client
    
    if redis_client:
        await redis_client.close()
        redis_client = None
        logger.info("✅ Conexão Redis fechada")

# ===========================================
# FUNÇÕES ÚTEIS PARA CACHE
# ===========================================

async def set_cache(key: str, value: str, expire: int = 3600):
    """Armazenar valor no cache."""
    try:
        client = await get_redis()
        await client.setex(key, expire, value)
        logger.debug(f"Cache set: {key}")
    except Exception as e:
        logger.error(f"Erro ao definir cache {key}: {e}")

async def get_cache(key: str) -> Optional[str]:
    """Recuperar valor do cache."""
    try:
        client = await get_redis()
        value = await client.get(key)
        if value:
            logger.debug(f"Cache hit: {key}")
        else:
            logger.debug(f"Cache miss: {key}")
        return value
    except Exception as e:
        logger.error(f"Erro ao recuperar cache {key}: {e}")
        return None

async def delete_cache(key: str):
    """Remover valor do cache."""
    try:
        client = await get_redis()
        await client.delete(key)
        logger.debug(f"Cache deleted: {key}")
    except Exception as e:
        logger.error(f"Erro ao deletar cache {key}: {e}")

async def clear_cache_pattern(pattern: str):
    """Limpar cache por padrão."""
    try:
        client = await get_redis()
        keys = await client.keys(pattern)
        if keys:
            await client.delete(*keys)
            logger.debug(f"Cache cleared pattern: {pattern}")
    except Exception as e:
        logger.error(f"Erro ao limpar cache pattern {pattern}: {e}")

# ===========================================
# FUNÇÕES ESPECÍFICAS DO SISTEMA
# ===========================================

async def cache_user_session(user_id: int, session_data: dict, expire: int = 1800):
    """Cache de sessão do usuário."""
    import json
    key = f"user_session:{user_id}"
    await set_cache(key, json.dumps(session_data), expire)

async def get_user_session(user_id: int) -> Optional[dict]:
    """Recuperar sessão do usuário."""
    import json
    key = f"user_session:{user_id}"
    data = await get_cache(key)
    if data:
        return json.loads(data)
    return None

async def invalidate_user_session(user_id: int):
    """Invalidar sessão do usuário."""
    key = f"user_session:{user_id}"
    await delete_cache(key)

async def cache_process_data(cnj_number: str, process_data: dict, expire: int = 3600):
    """Cache de dados de processo da API DataJud."""
    import json
    key = f"process_data:{cnj_number}"
    await set_cache(key, json.dumps(process_data), expire)

async def get_cached_process_data(cnj_number: str) -> Optional[dict]:
    """Recuperar dados de processo do cache."""
    import json
    key = f"process_data:{cnj_number}"
    data = await get_cache(key)
    if data:
        return json.loads(data)
    return None

async def cache_api_response(endpoint: str, params: dict, response_data: dict, expire: int = 1800):
    """Cache genérico para respostas de API."""
    import json
    import hashlib
    
    # Criar hash dos parâmetros para a chave
    params_str = json.dumps(params, sort_keys=True)
    params_hash = hashlib.md5(params_str.encode()).hexdigest()
    key = f"api_cache:{endpoint}:{params_hash}"
    
    await set_cache(key, json.dumps(response_data), expire)

async def get_cached_api_response(endpoint: str, params: dict) -> Optional[dict]:
    """Recuperar resposta de API do cache."""
    import json
    import hashlib
    
    params_str = json.dumps(params, sort_keys=True)
    params_hash = hashlib.md5(params_str.encode()).hexdigest()
    key = f"api_cache:{endpoint}:{params_hash}"
    
    data = await get_cache(key)
    if data:
        return json.loads(data)
    return None

# ===========================================
# VERIFICAÇÃO DE SAÚDE
# ===========================================

async def check_redis_health() -> bool:
    """Verificar saúde do Redis."""
    try:
        client = await get_redis()
        await client.ping()
        return True
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return False

