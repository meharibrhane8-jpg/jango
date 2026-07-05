/**
 * Tigrinya Autocorrect Dictionary
 * Maps common typos/variations to their standard Ethiopic forms.
 */

export const TIGRINYA_DICTIONARY: Record<string, string[]> = {
  // Common typos or phonetic variations
  "ሰላ": ["ሰላም"],
  "ሰላም": ["ሰላምታ", "ሰላምክ", "ከመይ ኣለኺ", "ሰላማዊ", "ሰላም", "ሰላምታ", "ሰላማዊ", "ሰላምታው"],
  "ከመ": ["ከመይ", "ከመይ ኢኻ", "ከመይ ኢኺ", "ከመይ", "ከመይከ", "ከመይነት", "ከመይኩም"],
  "የቐ": ["የቐንየለይ"],
  "የቐንየለ": ["የቐንየለይ", "የቐንየለይ", "የቐንየልካ", "የቐንየልኪ"],
  "ኤርት": ["ኤርትራ", "ኤርትራ", "ኤርትራዊ", "ኤርትራውያን", "ኤርትራዊት"],
  "ኢትዮ": ["ኢትዮጵያ"],
  "ኣስመ": ["ኣስመራ"],
  "ትግር": ["ትግርኛ"],
  "ደሓ": ["ደሓን", "ደሓን", "ደሓንኩም", "ደሓንዶ", "ደሓንኪ"],
  "ጽቡ": ["ጽቡቕ"],
  "ብጣ": ["ብጣዕሚ"],
  "እወ": ["እወ", "እወ ሓቂ እዩ"],
  "ኣይ": ["ኣይፋልን", "ኣይፋል"],
  "በጃ": ["በጃኻ", "በጃኺ"],
  "ይቕ": ["ይቕረታ"],
  "እንቋ": ["እንቋዕ", "እንቋዕ ኣብጽሓና"],
  "ሓጎ": ["ሓጎስ"],
  "ዓወ": ["ዓወት"],
  "ሓደ": ["ሓደ", "ሓንቲ"],
  "ክልተ": ["ክልተ"],
  "ሰለስተ": ["ሰለስተ"],
  "ሓዘን": ["ጸገም", "ሓዘን"],
  "ጓሂ": ["ጓሂ"],
  "ሃገ": ["ሃገረ", "ሃገረይ", "ሃገረ", "ሃገራዊ", "ሃገር", "ሃገራ"],
  "ኩሉ": ["ኩሉ", "ኩሎም", "ኩለን", "ኩሉኹም"],
  "ንእሽ": ["ንእሽተይ", "ንእስነት", "ንእሳታ"],
  "አበይ": ["አበይ", "አበይቲ", "አበይቲ ፍረታት", "አበይቲ ዓድታት"],
  "ተዘከ": ["ተዘከር", "ተዘከረ", "ተዘክሮ"],
};

export const AUTOCORRECT_MAP: Record<string, string> = {
  'ሰላምቱ': 'ሰላምታ',
  'ኤርትር': 'ኤርትራ',
  'ሃገሬ': 'ሃገረ',
  'ሰላምዉ': 'ሰላማዊ'
};

export const ENGLISH_DICTIONARY: Record<string, string[]> = {
  "hell": ["hello"],
  "hel": ["hello", "help"],
  "the": ["they", "them", "then"],
  "tha": ["thank", "thanks", "that"],
  "how": ["how", "however"],
  "you": ["you", "your", "you're"],
};

export const AMHARIC_DICTIONARY: Record<string, string[]> = {
  "ሰላ": ["ሰላም"],
  "ሰላም": ["ሰላምታ", "ሰላማዊ", "ሰላም"],
  "እንዴ": ["እንዴት", "እንዴት ነህ", "እንዴት ነሽ", "እንዴት ናችሁ"],
  "በጥ": ["በጣም"],
  "አመ": ["አመሰግናለሁ"],
  "አመሰ": ["አመሰግናለሁ"],
  "ምሳ": ["ምሳሌ", "ምሳ"],
  "እሺ": ["እሺ", "እሺ እሺ"],
  "አዎ": ["አዎ", "አዎ ነው"],
  "አይ": ["አይደለም", "አይደለም"],
  "እንጃ": ["እንጃ"],
  "እግዚ": ["እግዚአብሔር"],
  "ኢትዮ": ["ኢትዮጵያ", "ኢትዮጵያዊ"],
  "አዲስ": ["አዲስ አበባ", "አዲስ"],
  "ጤና": ["ጤና ይስጥልኝ"],
};

/**
 * Finds suggestions for the given input word based on the active dictionaries.
 */
export function getSuggestions(input: string, langOrIsLatin: string | boolean, userDictionary: Record<string, string[]> = {}): string[] {
  if (!input || input.length < 2) return [];

  let baseDictionary = TIGRINYA_DICTIONARY;
  if (langOrIsLatin === 'en' || langOrIsLatin === true) {
    baseDictionary = ENGLISH_DICTIONARY;
  } else if (langOrIsLatin === 'am') {
    baseDictionary = AMHARIC_DICTIONARY;
  } else if (langOrIsLatin === 'ti' || langOrIsLatin === false) {
    baseDictionary = TIGRINYA_DICTIONARY;
  }
  
  // Merge base and user dictionaries
  const dictionary: Record<string, string[]> = { ...baseDictionary, ...userDictionary };
  
  // Direct prefix match
  const matches = Object.keys(dictionary).filter(key => 
    key.startsWith(input) || input.startsWith(key)
  );

  const results: string[] = [];
  matches.forEach(match => {
    dictionary[match].forEach(suggestion => {
      if (!results.includes(suggestion) && suggestion !== input) {
        results.push(suggestion);
      }
    });
  });

  return results.slice(0, 3);
}
