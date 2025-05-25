import enum 

TRUSTED_SOURCES_GENERAL = [
  {"name": "Wikipedia", "url": "https://www.wikipedia.com"},
  {"name": "Factcheck", "url": "https://www.factcheck.org/"},
]

TRUSTED_SOURCES_NEWS = [
  {"name": "BBC", "url": "https://www.bbc.com/"},
  {"name": "Tagesschau", "url": "https://www.tagesschau.de/"},
  {"name": "Reuters", "url": "https://www.reuters.com/"},
]

TRUSTED_SOURCES_POLITICS = [
  {"name": "Politifact", "url": "https://www.politifact.com/"},
]

TRUSTED_SOURCES_SCIENCE = [
  {"name": "Research Gate", "url": "https://www.researchgate.net/"},
  {"name": "Pflanzen Lexikon", "url": "https://www.pflanzen-lexikon.com/"},
  {"name": "A-Z Animals", "url": "https://a-z-animals.com/"},
]

TRUSTED_SOURCES_WORDS = [
  {"name": "Duden", "url": "https://www.duden.de/"},
  {"name": "Oxford Dictionary", "url": "https://www.oed.com/"}, # Corrected "Ofxord" to "Oxford"
]

SOMEWHAT_TRUSTWORTHY_SOURCES = [
  {"name": "Reddit", "url": "https://www.reddit.com"},
]

SATIRE_SOURCES = [
  {"name": "The Onion", "url": "https://theonion.com/"}, # Corrected "https://theonion.com/"
  {"name": "Postillon", "url": "https://www.der-postillon.com/"},
  {"name": "Huffpost", "url": "https://www.huffpost.com"},
]

UNTRUSTED_SOURCES = [
  {"name": "X", "url": "https://x.com"},
  {"name": "truthsocial", "url": "https://truthsocial.com/"},
]

ALL_TRUSTED_SOURCES = TRUSTED_SOURCES_GENERAL + TRUSTED_SOURCES_POLITICS + TRUSTED_SOURCES_SCIENCE + TRUSTED_SOURCES_WORDS


class TrustedSourceType(enum.Enum):
    GENERAL = "general"
    NEWS = "news"
    POLITICS = "politics"
    SCIENCE = "science"
    WORDS = "words"
    SOMEWHAT_TRUSTWORTHY = "somewhat_trustworthy"
  
  

def concatenate_trusted_sources(sources: list[dict]) -> str:
    """
    Concatenate the names and URLs of trusted sources into a single string.
    
    :param sources: List of dictionaries containing source names and URLs.
    :return: A string with the names and URLs concatenated.
    """
    return " OR ".join([f'site:{source["url"]}' for source in sources])

def build_url(source_type: TrustedSourceType) -> str:
    """
    Build a URL for the given trusted source type.
    
    :param source_type: The type of trusted source.
    :return: A URL string for the trusted source.
    """
    if source_type == TrustedSourceType.GENERAL:
        return " OR ".join([f'site:{x["url"]}' for x in TRUSTED_SOURCES_GENERAL])
    elif source_type == TrustedSourceType.NEWS:
        return " OR ".join([f'site:{x["url"]}' for x in TRUSTED_SOURCES_NEWS])
    elif source_type == TrustedSourceType.POLITICS:
        return " OR ".join([f'site:{x["url"]}' for x in TRUSTED_SOURCES_POLITICS])
    elif source_type == TrustedSourceType.SCIENCE:
        return " OR ".join([f'site:{x["url"]}' for x in TRUSTED_SOURCES_SCIENCE])
    elif source_type == TrustedSourceType.WORDS:
        return " OR ".join([f'site:{x["url"]}' for x in TRUSTED_SOURCES_WORDS])
    elif source_type == TrustedSourceType.SOMEWHAT_TRUSTWORTHY:
        return " OR ".join([f'site:{x["url"]}' for x in SOMEWHAT_TRUSTWORTHY_SOURCES])
    else:
        raise ValueError("Unknown trusted source type")