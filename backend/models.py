from dataclasses import dataclass
from enum import Enum
from typing import Optional
from pydantic import Field, HttpUrl, Secret,PostgresDsn,BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List, Union


class PostgresSettings(BaseSettings):
  """Settings for a Postgres database connection"""
  postgres_db: Optional[PostgresDsn] = Field(default =None)
  model_config = SettingsConfigDict(env_prefix='POSTGRES_')

class AiSettings(BaseSettings):
  """Settings for the AI agent"""
  api_key: Secret[str]
  model: str
  model_server: HttpUrl
  model_type: str
  litellm_model: str
  litellm_api_key: Secret[str]
  model_config = SettingsConfigDict(env_prefix='AI_')

class FactCheckDetailsRequest(BaseModel):
  title: str
  url: str
  content: str
  html: Optional[str]

@dataclass
class ImageMediaRequest:
  type: str
  url: str
  alt: str
  position: Optional[int] = None

@dataclass
class VideoMediaRequest:
  """Model for video media attached to a social media post"""
  type: str
  poster: Optional[str] = None
  duration: Optional[str] = None
  hasVideo: bool = False
  note: str = ""

@dataclass
class AllMediaRequest:
  """Moddel for information about media attached to a social media post"""
  images: Optional[list[ImageMediaRequest]] = None
  videos: Optional[list[VideoMediaRequest]] = None
  hasMedia: bool = False

@dataclass
class SocialMediaDetailsRequest:
  """Request model for general social media"""
  username: Optional[str] = None
  displayName: Optional[str] = None
  content: Optional[str] = None
  allMedia: Optional[AllMediaRequest] = None
  isAd: bool = False
  quoted: Optional['SocialMediaDetailsRequest'] = None # Recursive type
  platform: Optional[str] = None

@dataclass
class MediaDetailsRequest:
  """Request model for yt video"""
  title: str
  channel: str
  channelUrl: str
  transcription_close_to_timestamp: Optional[str] = None
  transcription_with_more_context: Optional[str] = None

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

