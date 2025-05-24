from dataclasses import dataclass
from enum import Enum
from typing import Optional
from pydantic import Field, HttpUrl, Secret,PostgresDsn,BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict

class PostgresSettings(BaseSettings):
  postgres_db: Optional[PostgresDsn] = Field(default =None)
  model_config = SettingsConfigDict(env_prefix='POSTGRES_')

class AiSettings(BaseSettings):
  api_key: Secret[str]
  model: str
  model_server: HttpUrl
  model_type: str
  model_config = SettingsConfigDict(env_prefix='AI_')

class SearchRequest(BaseModel):
  title: str
  url: str
  content: str
  html: str

@dataclass
class TwitterSearchRequest(SearchRequest):
  user: str
  thread: str

class Verdict(Enum):
  VALID = "valid"
  INVALID = "invalid"
  PARTIALLY_VALID = "partially valid"
  UNSURE = "unsure"

@dataclass
class FactCheckSource:
  name: str
  link: str | HttpUrl

@dataclass
class Factoid:
  start: int
  end: int
  text: str
  verdict: bool  # True if valid, False if invalid
  check_result: str
  sources: list[FactCheckSource]  # List of sources with name and link

@dataclass
class FactCheckResult:
  score: float  # Between 0 and 1
  check_result: str
  verdict: Verdict  # valid | invalid | partially valid | unsure
  sources: list[FactCheckSource]  # List of sources with name and link
  factoids: Optional[list[Factoid]] = None  # Optional list of factoids with detailed information
