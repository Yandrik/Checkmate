from dataclasses import dataclass
from enum import Enum
from typing import Optional
from pydantic import Field, HttpUrl, Secret,PostgresDsn,BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List, Union


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
class ImageMediaRequest:
  type: str
  url: str
  alt: str
  position: Optional[int] = None

@dataclass
class VideoMediaRequest:
  type: str
  poster: Optional[str] = None
  duration: Optional[str] = None
  hasVideo: bool = False
  note: str = ""

@dataclass
class AllMediaRequest:
  images: Optional[list[ImageMediaRequest]] = None #= Field(default_factory=list)
  videos: Optional[list[VideoMediaRequest]] = None #= Field(default_factory=list)
  hasMedia: bool = False

@dataclass
class SocialMediaDetailsRequest:
  username: Optional[str] = None
  displayName: Optional[str] = None
  content: Optional[str] = None
  allMedia: Optional[AllMediaRequest] = None
  isAd: bool = False
  quotedTweet: Optional['SocialMediaDetailsRequest'] = None  # Recursive type

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
