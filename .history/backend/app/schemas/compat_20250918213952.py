# ===========================================
# COMPATIBILIDADE PYDANTIC V1
# Para funcionar com versões antigas
# ===========================================

try:
    # Pydantic v2
    from pydantic import Field, ConfigDict
    PYDANTIC_V2 = True
except ImportError:
    # Pydantic v1
    from pydantic import Field
    PYDANTIC_V2 = False
    ConfigDict = None

# Compatibilidade para Config
if PYDANTIC_V2:
    def get_config(**kwargs):
        return ConfigDict(**kwargs)
else:
    class Config:
        def __init__(self, **kwargs):
            for key, value in kwargs.items():
                setattr(self, key, value)
    
    def get_config(**kwargs):
        config = Config()
        for key, value in kwargs.items():
            setattr(config, key, value)
        return config
