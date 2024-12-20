from pydantic.v1 import BaseSettings


class Settings(BaseSettings):
    DB: str
    DB_PORT: str
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DEBUG: bool = False

    @property
    def DB_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB}"
        )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
