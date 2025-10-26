import { GoogleGenAI, Type } from "@google/genai";
import { BibleApiResponse, BibleVerse, searchLocalKJVByKeyword } from './bibleService';

// --- New Types for Verse Details ---
export interface RelatedVerse {
    reference: string;
    explanation: string;
}

export interface VerseDetails {
    contextSummary: string;
    relatedVerses: RelatedVerse[];
}

export type AiBibleSearchResponse = BibleApiResponse & { correctedQuery?: string };

const organizeNotesPrompt = (rawNotes: string) => `
You are an expert assistant for organizing sermon notes. Your task is to take the user's raw notes and restructure them into a clear, organized format.

**Instructions:**
1.  **Correct Mistakes:** Fix any spelling and grammatical errors.
2.  **Maintain Voice:** Preserve the user's original wording and phrasing as much as possible. Do not rephrase sentences unless it's for grammatical correctness.
3.  **Identify Topics:** Group related notes under clear, concise topic headings.
4.  **Highlight Scripture:** Identify any Bible verses or passages mentioned. When you find one, you MUST wrap it in a special tag like this: <bible>John 3:16</bible>. This is critical for the application's functionality. Do not just make the scripture bold or italic, use the <bible> tag.
5.  **Structure:** Organize the final output logically. Use headings, bullet points, and paragraphs to create a readable summary of the sermon.

**Output Format:**
Use Markdown for formatting.
- For main topic headings, use all uppercase letters and surround them with double asterisks (e.g., **INTRODUCTION**). Do NOT use headline tags like '#'.
- Use '*' for bullet points.
- Use '>' for block quotes, such as for quoting scripture text.
- **Crucially, wrap all detected Bible references in <bible> tags.** For example, if the notes mention "read John 3:16", format it as "read <bible>John 3:16</bible>". Another example: "In <bible>1 Corinthians 13</bible> we learn about love."

**Here are the raw notes:**
---
${rawNotes}
---
`;

export const organizeSermonNotes = async (rawNotes: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found.");
  }
  if (!navigator.onLine) {
      throw new Error("You are offline. AI organization is not available.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: organizeNotesPrompt(rawNotes),
    });
    return response.text;
  } catch (error) {
    console.error("Error organizing notes:", error);
    throw new Error("Failed to process notes with AI. Please try again.");
  }
};

const bibleVersionMap: { [key: string]: string } = {
    'kjv': 'King James Version',
    'web': 'World English Bible',
    'bbe': 'Bible in Basic English'
};

const bibleLanguageMap: { [key: string]: string } = {
    'yor': 'Yoruba',
    'ibo': 'Igbo',
    'pcm': 'Nigerian Pidgin'
};

const bibleStyleMap: { [key: string]: string } = {
    'amp': 'Amplified Bible',
    'cev': 'Contemporary English Version',
    'gnt': 'Good News Translation',
    'gw': 'GOD\'S WORD Translation',
    'msg': 'The Message',
    'niv': 'New International Version',
    'nlt': 'New Living Translation',
    'nog': 'Names of God Bible',
    'tlb': 'The Living Bible',
    'tpt': 'The Passion Translation',
    'rsv': 'Revised Standard Version'
};

const allVersionNames: { [key: string]: string } = {
    ...bibleVersionMap,
    ...bibleStyleMap,
    ...bibleLanguageMap,
};

const searchBibleAiPrompt = (keyword: string, targetName: string) => `
You are a Bible study assistant. A user wants to search for a keyword in the Bible.

**Instructions:**
1.  Analyze the user's query: "${keyword}". If it appears to be a misspelled or ambiguous Bible reference (e.g., "Jhon 3 16", "psalm of david"), provide a corrected, specific query in a 'correctedQuery' field (e.g., "John 3:16", "Psalm 23"). If the query is a clear keyword or a correct reference, this field should be omitted.
2.  Search for the keyword "${keyword}" in the Bible.
3.  Return a list of up to 10 of the most relevant verses, presented in the style of the "${targetName}".
4.  If no verses are found, the "verses" property in your JSON output must be an empty array.
5.  For the 'reference' field, provide a summary like 'Search results for "${keyword}"'.
6.  For the 'translation_name' field, use "${targetName}".

Your response MUST be a valid JSON object. Do not include any text or markdown formatting outside of the JSON object.
`;

export const searchBibleByKeyword = async (keyword: string, version: string): Promise<AiBibleSearchResponse> => {
  if (!navigator.onLine) {
      try {
          return searchLocalKJVByKeyword(keyword);
      } catch (e: any) {
          throw new Error(e.message + " You are currently offline.");
      }
  }

  if (!process.env.API_KEY) {
    throw new Error("API key not found.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const targetName = allVersionNames[version] || 'King James Version';
  const finalTargetName = bibleVersionMap[version] ? targetName : `${targetName} (AI)`;
  const prompt = searchBibleAiPrompt(keyword, finalTargetName);
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    reference: { type: Type.STRING },
                    verses: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                book_name: { type: Type.STRING },
                                chapter: { type: Type.NUMBER },
                                verse: { type: Type.NUMBER },
                                text: { type: Type.STRING },
                            },
                            required: ['book_name', 'chapter', 'verse', 'text']
                        }
                    },
                    translation_name: { type: Type.STRING },
                    correctedQuery: { type: Type.STRING, description: "A corrected version of the user's query if it was misspelled or ambiguous." }
                },
                required: ['reference', 'verses', 'translation_name']
            }
        },
    });

    const jsonText = response.text.trim();
    const cleanJsonText = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');
    const parsedData = JSON.parse(cleanJsonText);
    
    // Adapt the AI response to the BibleApiResponse structure
    const adaptedResponse: AiBibleSearchResponse = {
        reference: parsedData.reference,
        verses: parsedData.verses.map((v: any, index: number) => ({
            ...v,
            book_id: `${v.book_name.slice(0, 3).toUpperCase()}${index}`, // Create a semi-unique book_id
        })),
        text: parsedData.verses.map((v: any) => v.text).join('\n'), // Join texts with newlines
        translation_id: version.toUpperCase(),
        translation_name: parsedData.translation_name || finalTargetName,
        translation_note: 'Results from AI-powered keyword search.',
        correctedQuery: parsedData.correctedQuery,
    };
    
    if (adaptedResponse.verses.length === 0 && !adaptedResponse.correctedQuery) {
        throw new Error(`Could not find any verses matching "${keyword}". Try another keyword.`);
    }

    return adaptedResponse;

  } catch (error) {
    console.error("Error searching Bible with AI:", error);
    if (error instanceof Error && error.message.includes('Could not find any verses')) {
        throw error;
    }
    throw new Error(`Failed to process search for "${keyword}" with AI. Please try again.`);
  }
};

export const transformBiblePassageWithAI = async (passage: BibleApiResponse, targetVersionKey: string): Promise<BibleApiResponse> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found.");
    }
    if (!navigator.onLine) {
        throw new Error("You are offline. AI translations are not available.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const targetLanguage = bibleLanguageMap[targetVersionKey];
    const targetStyle = bibleStyleMap[targetVersionKey];
    
    let instruction = '';
    let targetName = '';

    if (targetLanguage) {
        instruction = `translate the provided Bible verse texts into ${targetLanguage}`;
        targetName = `${targetLanguage} (AI)`;
    } else if (targetStyle) {
        instruction = `rephrase the provided Bible verse texts into the style of the "${targetStyle}"`;
        targetName = `${targetStyle} (AI)`;
    } else {
        throw new Error("Invalid target version for AI transformation.");
    }

    const prompt = `
You are an expert Bible translator and scholar. Your task is to ${instruction}.

**Instructions:**
1.  The input is a JSON array of verse objects from the King James Version.
2.  For each verse object in the array, transform the "text" field as instructed.
3.  Keep all other fields ("book_id", "book_name", "chapter", "verse") exactly the same.
4.  Return a JSON object with a single key, "verses", which contains the array of transformed verse objects.
5.  Your response MUST be only the JSON object. Do not include any other text or markdown.

**Input JSON Array of Verses:**
---
${JSON.stringify(passage.verses)}
---
`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        verses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    book_id: { type: Type.STRING },
                                    book_name: { type: Type.STRING },
                                    chapter: { type: Type.NUMBER },
                                    verse: { type: Type.NUMBER },
                                    text: { type: Type.STRING },
                                },
                                required: ['book_id', 'book_name', 'chapter', 'verse', 'text']
                            }
                        }
                    },
                    required: ['verses']
                }
            }
        });

        const jsonText = response.text.trim();
        const cleanJsonText = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');
        const parsedData = JSON.parse(cleanJsonText);
        const transformedVerses: BibleVerse[] = parsedData.verses;

        const transformedResponse: BibleApiResponse = {
            ...passage,
            verses: transformedVerses,
            text: transformedVerses.map(v => v.text).join('\n'),
            translation_id: targetVersionKey.toUpperCase(),
            translation_name: targetName,
            translation_note: `Transformed from ${passage.translation_name} by AI.`
        };

        return transformedResponse;

    } catch (error) {
        console.error("Error transforming passage with AI:", error);
        throw new Error(`Failed to transform passage to ${targetName}. Please try again.`);
    }
};

const verseDetailsPrompt = (verseReference: string, verseText: string) => `
You are an expert Bible commentary assistant. A user wants to understand more about a specific Bible verse.

**Verse in question:**
- **Reference:** ${verseReference}
- **Text:** "${verseText}"

**Instructions:**
1.  **Provide Context:** Write a brief, clear summary (2-3 sentences) explaining the context of the chapter where this verse is found. What is happening in the passage leading up to and following this verse?
2.  **Find Related Verses:** Identify 3 to 5 other Bible verses that are thematically related, offer further insight, or provide a parallel teaching.
3.  **Explain the Connection:** For each related verse you find, provide a short, one-sentence explanation of how it connects to the primary verse (${verseReference}).
4.  **Format the Output:** Your response MUST be a valid JSON object. Do not include any text or markdown formatting outside of the JSON object.

**Example output for John 3:16:**
{
  "contextSummary": "This verse is part of a conversation between Jesus and Nicodemus, a Pharisee. Jesus is explaining the necessity of being 'born again' spiritually to enter the Kingdom of God, highlighting God's immense love for humanity.",
  "relatedVerses": [
    {
      "reference": "Romans 5:8",
      "explanation": "This verse also emphasizes that God demonstrated His love for us while we were still sinners."
    },
    {
      "reference": "1 John 4:9-10",
      "explanation": "This passage further explains that God's love was manifested by sending His Son as an atoning sacrifice for our sins."
    },
    {
      "reference": "Ephesians 2:8-9",
      "explanation": "This highlights that salvation is a gift of God received through faith, not by works, which is a core theme in John 3:16."
    }
  ]
}
`;

export const getVerseContextAndRelatedVerses = async (verseReference: string, verseText: string): Promise<VerseDetails> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found.");
    }
    if (!navigator.onLine) {
        throw new Error("You are offline. AI-powered verse details are not available.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: verseDetailsPrompt(verseReference, verseText),
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        contextSummary: { type: Type.STRING },
                        relatedVerses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    reference: { type: Type.STRING },
                                    explanation: { type: Type.STRING }
                                },
                                required: ['reference', 'explanation']
                            }
                        }
                    },
                    required: ['contextSummary', 'relatedVerses']
                }
            }
        });

        const jsonText = response.text.trim();
        const cleanJsonText = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');
        return JSON.parse(cleanJsonText);

    } catch (error) {
        console.error("Error getting verse details from AI:", error);
        throw new Error(`Failed to get context for "${verseReference}". Please try again.`);
    }
};

const socialMediaPostPrompt = (noteContent: string) => `
You are a social media expert for a Christian faith-based community in Nigeria. Your task is to create a shareable social media post from a user's sermon notes.

**Instructions:**
1.  **Analyze the Notes:** Read the sermon notes provided below to understand the core message, key scriptures, and main takeaways.
2.  **Create a Post:** Write a short, engaging, and uplifting post (under 150 words) that summarizes the sermon's main point.
3.  **Tone:** The tone should be inspiring, encouraging, and accessible to a wide audience on platforms like Facebook, Instagram, and WhatsApp.
4.  **Formatting:** Use paragraphs and line breaks to make the post easy to read. You can use emojis sparingly if they fit the tone.
5.  **Hashtags:** Include 3-5 relevant hashtags at the end. Examples: #SermonNotes, #Inspiration, #Faith, #WordOfGod, #NigerianChurch, #SundayService.
6.  **Do Not Include:** Do not include a greeting like "Here's a social media post..." or any meta-commentary. Just provide the post content itself.

**Sermon Notes:**
---
${noteContent}
---
`;

export const generateSocialMediaPost = async (noteContent: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found.");
    }
    if (!navigator.onLine) {
        throw new Error("You are offline. AI post generation is not available.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: socialMediaPostPrompt(noteContent),
        });
        return response.text;
    } catch (error) {
        console.error("Error generating social media post:", error);
        throw new Error("Failed to generate social media post. Please try again.");
    }
};