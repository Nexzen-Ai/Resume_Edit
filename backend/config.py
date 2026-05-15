from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    llm_api_key: str
    llm_model: str = "gemini/gemini-2.0-flash-lite"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    daily_edit_limit: int = 5

    class Config:
        env_file = ".env"


settings = Settings()
