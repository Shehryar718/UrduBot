from .stop_words import remove_stopwords
from .preprocessing import (
    remove_english_alphabets,
    replace_currency_symbols,
    replace_numbers,
    replace_phone_numbers,
    replace_emails,
    replace_urls,
    remove_accents,
    remove_punctuation,
    normalize_whitespace
)

def preprocess(text: str, stopwords: bool = False) -> str:
    """
    Clean
    Args:
        text (str): The input text to be cleaned.
        stopwords (bool, optional): Whether to remove stopwords. Defaults to False.

    Returns:
        str: The cleaned text.
    """
    text = remove_english_alphabets(text)
    text = replace_currency_symbols(text)
    text = replace_numbers(text)
    text = replace_phone_numbers(text)
    text = replace_emails(text)
    text = replace_urls(text)
    text = remove_accents(text)
    text = remove_punctuation(text)
    text = normalize_whitespace(text)

    if stopwords:
        text = remove_stopwords(text)

    return text


__all__ = [
    'remove_stopwords',
    'remove_english_alphabets',
    'replace_currency_symbols',
    'replace_numbers',
    'replace_phone_numbers',
    'replace_emails',
    'replace_urls',
    'remove_accents',
    'remove_punctuation',
    'normalize_whitespace',
    'preprocess'
]