from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    llm_api_key: str
    llm_model: str = "gemini/gemini-2.0-flash-lite"
    # Vision-capable model for reading JD screenshots. Swap per provider.
    vision_model: str = "groq/meta-llama/llama-4-scout-17b-16e-instruct"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 3600
    daily_edit_limit: int = 5
    # Comma-separated allowed CORS origins (frontend URLs).
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
