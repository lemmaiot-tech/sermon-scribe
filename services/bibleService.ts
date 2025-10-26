// A simple, no-key-required API for fetching Bible verses.
// Documentation: https://bible-api.com/

import { KJV_DATA as BUNDLED_KJV_DATA } from './bibleData';
import * as dbService from './dbService';

const API_BASE_URL = 'https://bible-api.com/';

export interface BibleVerse {
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
}

export interface BibleApiResponse {
    reference: string;
    verses: BibleVerse[];
    text: string;
    translation_id: string;
    translation_name: string;
    translation_note: string;
}

export interface BibleData {
    key: string;
    name: string;
    books: { book: string; chapters: string[][] }[];
}

// Use the full KJV data bundled with the application for offline access.
const KJV_DATA: BibleData = BUNDLED_KJV_DATA;


const parseReference = (ref: string): { book: string; chapter: number; startVerse: number; endVerse: number } | null => {
    const pattern = /^((\d\s)?[a-zA-Z\s]+)\s(\d+)(?::(\d+))?(?:-(\d+))?$/;
    const match = ref.trim().match(pattern);

    if (!match) return null;

    const bookName = match[1].trim();
    const chapterNum = parseInt(match[3], 10);
    const startVerseNum = parseInt(match[4] || '1', 10);
    const endVerseNum = parseInt(match[5] || match[4] || '999', 10); // 999 to get rest of chapter

    return { book: bookName, chapter: chapterNum, startVerse: startVerseNum, endVerse: endVerseNum };
};

export const searchLocalBibleByReference = (reference: string, bibleData: BibleData): BibleApiResponse => {
    const parsedRef = parseReference(reference);
    if (!parsedRef) throw new Error(`Invalid reference format for offline search: "${reference}"`);

    const bookData = bibleData.books.find(b => b.book.toLowerCase() === parsedRef.book.toLowerCase());
    if (!bookData) throw new Error(`Book "${parsedRef.book}" not found in offline ${bibleData.name}.`);

    if (parsedRef.chapter <= 0 || parsedRef.chapter > bookData.chapters.length) {
        throw new Error(`Chapter ${parsedRef.chapter} not found in ${parsedRef.book}.`);
    }
    const chapterData = bookData.chapters[parsedRef.chapter - 1];

    const verses: BibleVerse[] = [];
    for (let i = parsedRef.startVerse; i <= parsedRef.endVerse; i++) {
        const verseText = chapterData ? chapterData[i - 1] : undefined;
        if (verseText) {
            verses.push({
                book_id: bookData.book.substring(0, 3).toUpperCase(),
                book_name: bookData.book,
                chapter: parsedRef.chapter,
                verse: i,
                text: verseText
            });
        } else {
            if (i > parsedRef.startVerse) break;
        }
    }

    if (verses.length === 0) {
        throw new Error(`Could not find verse(s) for "${reference}" in offline ${bibleData.name}.`);
    }

    return {
        reference: `${verses[0].book_name} ${verses[0].chapter}:${verses[0].verse}` + (verses.length > 1 ? `-${verses[verses.length - 1].verse}` : ''),
        verses: verses,
        text: verses.map(v => v.text).join(' '),
        translation_id: `${bibleData.key.toUpperCase()}_OFFLINE`,
        translation_name: `${bibleData.name} (Offline)`,
        translation_note: `Served from offline Bible.`
    };
};

export const searchLocalBibleByKeyword = (keyword: string, bibleData: BibleData): BibleApiResponse => {
    const results: BibleVerse[] = [];
    if (!keyword) return {
        reference: `Offline search for ""`,
        verses: [],
        text: '',
        translation_id: `${bibleData.key.toUpperCase()}_OFFLINE_SEARCH`,
        translation_name: `${bibleData.name} (Offline)`,
        translation_note: `Keyword search performed on the offline Bible.`
    };
    
    const lowerKeyword = keyword.toLowerCase();

    for (const book of bibleData.books) {
        if (results.length >= 20) break;
        for (let c = 0; c < book.chapters.length; c++) {
            if (results.length >= 20) break;
            for (let v = 0; v < book.chapters[c].length; v++) {
                const verseText = book.chapters[c][v];
                if (verseText.toLowerCase().includes(lowerKeyword)) {
                    results.push({
                        book_id: book.book.substring(0, 3).toUpperCase(),
                        book_name: book.book,
                        chapter: c + 1,
                        verse: v + 1,
                        text: verseText
                    });
                    if (results.length >= 20) break;
                }
            }
        }
    }

    if (results.length === 0) {
        throw new Error(`Could not find any verses matching "${keyword}" in the offline ${bibleData.name}.`);
    }

    return {
        reference: `Offline search results for "${keyword}"`,
        verses: results,
        text: results.map(v => v.text).join('\n'),
        translation_id: `${bibleData.key.toUpperCase()}_OFFLINE_SEARCH`,
        translation_name: `${bibleData.name} (Offline)`,
        translation_note: `Keyword search performed on the offline Bible.`
    };
};

// Deprecated single-version functions, kept for compatibility with older calls if any.
export const searchLocalKJVByReference = (reference: string): BibleApiResponse => searchLocalBibleByReference(reference, KJV_DATA);
export const searchLocalKJVByKeyword = (keyword: string): BibleApiResponse => searchLocalBibleByKeyword(keyword, KJV_DATA);


/**
 * Fetches a Bible passage from the specified reference and version.
 * @param reference - The Bible reference (e.g., "John 3:16").
 * @param version - The Bible version/translation (e.g., "kjv", "web").
 * @returns The full API response object containing the scripture data.
 */
export const fetchVerse = async (reference: string, version: string): Promise<BibleApiResponse> => {
    if (!reference.trim()) {
        throw new Error("Please enter a Bible reference.");
    }

    if (!navigator.onLine) {
        try {
            // Check if the requested version is downloaded in IndexedDB
            const downloadedBible = await dbService.getBibleVersion(version);
            if (downloadedBible) {
                return searchLocalBibleByReference(reference, downloadedBible);
            }
            // If not downloaded or an error occurs, fall back to the bundled KJV
            return searchLocalBibleByReference(reference, KJV_DATA);
        } catch (e: any) {
            // If the primary search fails (e.g., downloaded version is corrupted or verse not found),
            // still try to fall back to KJV as a last resort.
            try {
                return searchLocalBibleByReference(reference, KJV_DATA);
            } catch (kjvError: any) {
                 throw new Error(kjvError.message + " You are currently offline.");
            }
        }
    }
    
    // The bible-api.com expects spaces to be replaced with '+' instead of URL-encoded as '%20'.
    const encodedReference = reference.trim().replace(/\s+/g, '+');
    const url = `${API_BASE_URL}${encodedReference}?translation=${version}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                 throw new Error(`Could not find the reference "${reference}". Please check the spelling and format (e.g., "John 3:16").`);
            }
            throw new Error(`Failed to fetch scripture. Status: ${response.status}`);
        }

        const data: BibleApiResponse = await response.json();
        
        return data;

    } catch (error) {
        console.error("Error fetching from Bible API:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while fetching scripture. Please check your internet connection.");
    }
};