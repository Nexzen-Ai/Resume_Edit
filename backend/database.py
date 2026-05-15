import httpx
from supabase import create_client, Client
from config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)

# Auto-retry on stale pooled connections (WinError 10054 / httpx.ConnectError)
supabase.postgrest.session._transport = httpx.HTTPTransport(retries=1)
