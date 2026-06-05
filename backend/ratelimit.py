from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared limiter instance — imported by main.py (wiring) and routers (decorators).
limiter = Limiter(key_func=get_remote_address)
