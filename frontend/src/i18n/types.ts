export type SupportedLanguage = 'en' | 'hi' | 'as' | 'bn';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
  flag: string;
  speechCode: string;
}

export interface TranslationDictionary {
  [key: string]: string;
}

export type TranslationsMap = {
  [lang in SupportedLanguage]: TranslationDictionary;
};
