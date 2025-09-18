#!/usr/bin/env python3

from passlib.context import CryptContext
from sqlalchemy import create_engine, text

# Gerar hash
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
new_hash = pwd_context.hash('123456')
print(f'Novo hash: {new_hash}')

# Conectar ao banco e atualizar
engine = create_engine('postgresql://postgres:postgres@localhost:5432/gestao_processos')
with engine.connect() as conn:
    result = conn.execute(text('UPDATE users SET hashed_password = :hash WHERE email = :email'), 
                         {'hash': new_hash, 'email': 'admin@teste.com'})
    conn.commit()
    print('Hash atualizado com sucesso!')
    
    # Verificar se foi atualizado
    result = conn.execute(text('SELECT email, length(hashed_password) FROM users WHERE email = :email'), 
                         {'email': 'admin@teste.com'})
    row = result.fetchone()
    if row:
        print(f'Verificação: {row[0]}, tamanho do hash: {row[1]}')
