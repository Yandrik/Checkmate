from dataclasses import dataclass
from enum import Enum
from typing import Optional
from pydantic import HttpUrl

@dataclass
class SearchRequest:
  title: str
  url: str
  content: str
  html: str

class Verdict(Enum):
  VALID = "valid"
  INVALID = "invalid"
  PARTIALLY_VALID = "partially valid"
  UNSURE = "unsure"

@dataclass
class FactCheckSource:
  name: str
  link: str | HttpUrl  # Using HttpUrl to ensure valid URLs

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
