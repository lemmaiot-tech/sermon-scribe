import React, { useState, useCallback, useEffect, useRef } from 'react';
import { organizeSermonNotes, searchBibleByKeyword, transformBiblePassageWithAI, getVerseContextAndRelatedVerses, generateSocialMediaPost, VerseDetails, AiBibleSearchResponse } from './services/geminiService';
import { fetchVerse, BibleApiResponse, BibleVerse, searchLocalBibleByKeyword, searchLocalBibleByReference } from './services/bibleService';
// Fix: Import DOWNLOADABLE_BIBLES to access the full data for downloading.
import { DownloadableBible, BIBLE_VERSION_META, DOWNLOADABLE_BIBLES } from './services/bibleData';
import * as dbService from './services/dbService';


// --- Icons ---
const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
    </svg>
);

const RedoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.707-10.293a1 1 0 011.414 0L12 10.586V8a1 1 0 112 0v4a1 1 0 01-1 1h-4a1 1 0 110-2h2.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M7.5 2.75C7.5 2.33579 7.83579 2 8.25 2H14.25C14.6642 2 15 2.33579 15 2.75V6.17157C15 6.37868 15.0879 6.57726 15.244 6.73327L17.756 9.24527C17.912 9.40128 18 9.59986 18 9.807V17.25C18 17.6642 17.6642 18 17.25 18H5.75C5.33579 18 5 17.6642 5 17.25V5.75C5 5.33579 5.33579 5 5.75 5H7.5V2.75ZM8.5 3.00002V5H6V17H17V10.293L14.267 7.56027C14.111 7.40426 14 7.20568 14 7V3.00002H8.5ZM10 11C11.3807 11 12.5 12.1193 12.5 13.5C12.5 14.8807 11.3807 16 10 16C8.61929 16 7.5 14.8807 7.5 13.5C7.5 12.1193 8.61929 11 10 11ZM10 12C9.17157 12 8.5 12.6716 8.5 13.5C8.5 14.3284 9.17157 15 10 15C10.8284 15 11.5 14.3284 11.5 13.5C11.5 12.6716 10.8284 12 10 12Z"/>
    </svg>
);

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM1 10a9 9 0 1118 0 9 9 0 01-18 0zm9-4a1 1 0 011 1v3.586l2.293 2.293a1 1 0 01-1.414 1.414L9 11.414V7a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const IosShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block align-text-bottom mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const WifiOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M17.293 2.707a1 1 0 010 1.414l-14 14a1 1 0 01-1.414-1.414l14-14a1 1 0 011.414 0z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M3.586 9.414a.5.5 0 01.707 0 5.494 5.494 0 017.414 0 .5.5 0 01.707-.707 6.494 6.494 0 00-8.828 0 .5.5 0 010 .707zm1.414 1.414a.5.5 0 01.707 0 3.493 3.493 0 014.243 0 .5.5 0 01.707-.707 4.493 4.493 0 00-5.657 0 .5.5 0 010 .707zM10 14a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const CloudDownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
);

// --- Types ---
interface Note {
    id: number;
    title: string;
    date: string;
    content: string;
}

interface VerseDetailData {
    passage: BibleApiResponse;
    context: VerseDetails;
}

interface DownloadedVersion {
    key: string;
    size: number;
}


// --- Data ---
const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', 
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 
  'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', 
  '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', 
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const infoIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>`;

const bibleVersions = [
    {
        label: 'Standard',
        options: [
            { value: 'kjv', name: 'KJV' },
            { value: 'web', name: 'WEB' },
            { value: 'bbe', name: 'BBE' },
            { value: 'amp', name: 'AMP' },
            { value: 'gnt', name: 'GNT' },
            { value: 'niv', name: 'NIV' },
            { value: 'nlt', name: 'NLT' },
            { value: 'tpt', name: 'TPT' },
        ]
    },
    {
        label: 'English (AI)',
        options: [
            { value: 'cev', name: 'CEV (AI)' },
            { value: 'gw', name: 'GW (AI)' },
            { value: 'msg', name: 'MSG (AI)' },
            { value: 'nog', name: 'NOG (AI)' },
            { value: 'tlb', name: 'TLB (AI)' },
            { value: 'rsv', name: 'RSV (AI)' },
        ]
    },
    {
        label: 'Other Languages (AI)',
        options: [
            { value: 'yor', name: 'Yoruba (AI)' },
            { value: 'ibo', name: 'Igbo (AI)' },
            { value: 'pcm', name: 'Pidgin (AI)' },
        ]
    }
];

const allBibleVersions = bibleVersions.flatMap(group => group.options);

// --- Custom Hooks ---
const useHistoryState = (initialState: string) => {
    const [history, setHistory] = useState([initialState]);
    const [index, setIndex] = useState(0);

    const setState = useCallback((newState: string) => {
        const newHistory = history.slice(0, index + 1);
        if (newHistory[newHistory.length -1] === newState) return;
        newHistory.push(newState);
        setHistory(newHistory);
        setIndex(newHistory.length - 1);
    }, [history, index]);

    const undo = useCallback(() => {
        if (index > 0) {
            setIndex(index - 1);
        }
    }, [index]);

    const redo = useCallback(() => {
        if (index < history.length - 1) {
            setIndex(index + 1);
        }
    }, [index, history.length]);

    const canUndo = index > 0;
    const canRedo = index < history.length - 1;

    return [history[index], setState, undo, redo, canUndo, canRedo] as const;
};

// --- Main App Component ---
function App() {
    const AUTO_SAVE_KEY = 'sermonScribe_autoSave';

    // State for notes
    const [rawNotes, setRawNotes, undo, redo, canUndo, canRedo] = useHistoryState('');
    const [organizedNotes, setOrganizedNotes] = useState('');
    const [isOrganizing, setIsOrganizing] = useState(false);
    const [notesError, setNotesError] = useState('');
    const [savedNotes, setSavedNotes] = useState<Note[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // State for Bible search
    const [searchQuery, setSearchQuery] = useState('John 3:16');
    const [searchVersion, setSearchVersion] = useState('kjv');
    const [searchType, setSearchType] = useState('verse'); // 'verse' or 'keyword'
    const [searchResult, setSearchResult] = useState<BibleApiResponse | AiBibleSearchResponse | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isSearchHistoryModalVisible, setIsSearchHistoryModalVisible] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isVersionMenuOpen, setIsVersionMenuOpen] = useState(false);
    const versionMenuRef = useRef<HTMLDivElement>(null);

    // State for Verse Detail Modal
    const [isVerseDetailModalVisible, setIsVerseDetailModalVisible] = useState(false);
    const [selectedVerseDetails, setSelectedVerseDetails] = useState<VerseDetailData | null>(null);
    const [isVerseDetailLoading, setIsVerseDetailLoading] = useState(false);
    const [verseDetailError, setVerseDetailError] = useState('');

    // State for PWA install prompt
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isInstallModalVisible, setIsInstallModalVisible] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'desktop'>('desktop');
    const [isStandalone, setIsStandalone] = useState(false);
    
    // State for Settings
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const [downloadedVersions, setDownloadedVersions] = useState<DownloadedVersion[]>([]);
    const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});

    // State for offline status
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // State for toast notifications
    const [toastMessage, setToastMessage] = useState('');
    const toastTimerRef = useRef<number | null>(null);
    
    // State for Sharing
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);
    const [noteToShare, setNoteToShare] = useState<Note | null>(null);
    const [socialPostContent, setSocialPostContent] = useState('');
    const [isGeneratingSocialPost, setIsGeneratingSocialPost] = useState(false);
    const [shareError, setShareError] = useState('');
    const [activeShareTab, setActiveShareTab] = useState<'full' | 'social'>('full');

    // Refs to manage effects
    const isInitialMount = useRef(true);
    const isProgrammaticChangeRef = useRef(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const rawNotesRef = useRef(rawNotes);

    // Update rawNotesRef whenever rawNotes changes so the auto-save interval has the latest value
    useEffect(() => {
        rawNotesRef.current = rawNotes;
    });
    
    // Effect to handle online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Effect to apply system theme
    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applySystemTheme = () => {
            if (mediaQuery.matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        applySystemTheme();
        
        mediaQuery.addEventListener('change', applySystemTheme);
        return () => mediaQuery.removeEventListener('change', applySystemTheme);
    }, []);
    
    // Effect to handle PWA installation
    useEffect(() => {
        const checkStandalone = () => {
             const isApp = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true || 
                           document.referrer.includes('android-app://');
             setIsStandalone(isApp);
        };
        checkStandalone();

        const beforeInstallPromptHandler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);

        const ua = navigator.userAgent;
        if (/iPad|iPhone|iPod/.test(ua)) {
            setPlatform('ios');
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
        };
    }, []);

    // Effect to track unsaved changes
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (isProgrammaticChangeRef.current) {
            isProgrammaticChangeRef.current = false; // Reset flag after a programmatic change
            return;
        }
        setHasUnsavedChanges(true);
    }, [rawNotes]);
    
    // Effect for closing menus on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (versionMenuRef.current && !versionMenuRef.current.contains(event.target as Node)) {
                setIsVersionMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [versionMenuRef]);

    // Effect to load data from localStorage on mount
    useEffect(() => {
        try {
            // Load auto-saved notes if available
            const autoSavedNotes = localStorage.getItem(AUTO_SAVE_KEY);
            if (autoSavedNotes) {
                isProgrammaticChangeRef.current = true;
                setRawNotes(autoSavedNotes);
            }

            const notesFromStorage = localStorage.getItem('sermonScribeNotes');
            if (notesFromStorage) {
                setSavedNotes(JSON.parse(notesFromStorage));
            }
            const historyFromStorage = localStorage.getItem('sermonScribeSearchHistory');
            if (historyFromStorage) {
                setSearchHistory(JSON.parse(historyFromStorage));
            }
            
            // Load downloaded versions
            updateDownloadedVersions();
        } catch (error) {
            console.error("Failed to load data from storage", error);
        }
    }, []);

    const showToast = (message: string) => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        setToastMessage(message);
        toastTimerRef.current = window.setTimeout(() => {
            setToastMessage('');
            toastTimerRef.current = null;
        }, 3000); // Duration matches animation
    };

    // Effect for auto-saving notes every 3 minutes
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (rawNotesRef.current.trim()) {
                localStorage.setItem(AUTO_SAVE_KEY, rawNotesRef.current);
                showToast("Notes auto-saved.");
            } else {
                localStorage.removeItem(AUTO_SAVE_KEY);
            }
        }, 3 * 60 * 1000); // 3 minutes

        return () => {
            clearInterval(autoSaveInterval);
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const trimmedQuery = searchQuery.trim();
        if (searchType === 'verse' && trimmedQuery.length > 0 && !/\d/.test(trimmedQuery)) {
            const query = trimmedQuery.toLowerCase();
            const filtered = BIBLE_BOOKS.filter(book =>
                book.toLowerCase().startsWith(query)
            );
            setSuggestions(filtered.slice(0, 7));
        } else {
            setSuggestions([]);
        }
    }, [searchQuery, searchType]);

    const handleInstallRequest = async () => {
        if (installPrompt) {
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
                setIsStandalone(true); // Assume installation is successful
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            setInstallPrompt(null);
        } else {
            setIsInstallModalVisible(true);
        }
    };

    const handleVersionChange = (newVersion: string) => {
        setSearchVersion(newVersion);
        setIsVersionMenuOpen(false);
    };

    const handleOrganizeNotes = async () => {
        if (!rawNotes.trim()) {
            setNotesError("Please enter some notes to organize.");
            return;
        }
        setIsOrganizing(true);
        setNotesError('');
        setOrganizedNotes('');
        try {
            const result = await organizeSermonNotes(rawNotes);
            setOrganizedNotes(result);
            setHasUnsavedChanges(true); // Organizing is an unsaved change
        } catch (error: any) {
            setNotesError(error.message || "An unknown error occurred.");
        } finally {
            setIsOrganizing(false);
        }
    };

    const triggerSearch = async (query: string, type: string, version: string) => {
        if (!query.trim()) {
            setSearchError("Please enter a verse or keyword.");
            return;
        }
        setIsSearching(true);
        setIsTransforming(false);
        setSearchError('');
        setSearchResult(null);

        const aiVersions = ['yor', 'ibo', 'pcm', 'cev', 'gw', 'msg', 'nog', 'tlb', 'rsv'];
        const isAiTransformation = aiVersions.includes(version);

        try {
            let result;
            if (type === 'verse') {
                // If we need an AI transformation, we must fetch a base version first.
                // Check if a downloaded version is available, otherwise use KJV.
                const baseVersionForAi = downloadedVersions.some(v => v.key === version) ? version : 'kjv';
                const fetchVersion = isAiTransformation ? baseVersionForAi : version;
                
                result = await fetchVerse(query, fetchVersion);
                
                if (isAiTransformation && result && isOnline) {
                    setIsTransforming(true);
                    result = await transformBiblePassageWithAI(result, version);
                }
            } else { // Keyword search
                const isDownloaded = downloadedVersions.some(v => v.key === version);
                // For keyword search, if offline and version is downloaded, use local search.
                if (!isOnline && isDownloaded) {
                     const bibleData = await dbService.getBibleVersion(version);
                     if (bibleData) {
                         result = searchLocalBibleByKeyword(query, bibleData);
                     } else {
                         // Fallback to KJV if something goes wrong
                         result = await searchBibleByKeyword(query, 'kjv');
                     }
                } else {
                    // Otherwise, use the standard AI or KJV offline search
                    result = await searchBibleByKeyword(query, version);
                }
            }
            setSearchResult(result);
        } catch (error: any) {
            setSearchError(error.message || "An unknown error occurred.");
        } finally {
            setIsSearching(false);
            setIsTransforming(false);
        }
    };

    const addSearchToHistory = (query: string) => {
        const cleanedQuery = query.trim();
        if (!cleanedQuery) return;

        const newHistory = [
            cleanedQuery,
            ...searchHistory.filter(item => item.toLowerCase() !== cleanedQuery.toLowerCase())
        ].slice(0, 15); // Limit to 15 recent searches

        setSearchHistory(newHistory);
        localStorage.setItem('sermonScribeSearchHistory', JSON.stringify(newHistory));
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        addSearchToHistory(searchQuery);
        await triggerSearch(searchQuery, searchType, searchVersion);
        setSuggestions([]);
        searchInputRef.current?.blur();
    };

    const handleSuggestionSearch = (correctedQuery: string) => {
        setSearchQuery(correctedQuery);
        addSearchToHistory(correctedQuery);
        // Use the AI-powered keyword search for the corrected query, as it's more robust.
        triggerSearch(correctedQuery, 'keyword', searchVersion);
    };

    const handleCopyVerse = (verse: BibleVerse) => {
        const verseText = `${verse.book_name} ${verse.chapter}:${verse.verse}\n"${verse.text}"`;
        navigator.clipboard.writeText(verseText)
            .then(() => {
                showToast("Verse copied to clipboard!");
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                showToast("Failed to copy verse.");
            });
    };
    
    const handleHistoryItemClick = (query: string) => {
        setSearchQuery(query);
        const type = /\d/.test(query) ? 'verse' : 'keyword';
        setSearchType(type);
        triggerSearch(query, type, searchVersion);
        setIsSearchHistoryModalVisible(false);
    };

    const handleDeleteSearchHistoryItem = (itemToDelete: string) => {
        const newHistory = searchHistory.filter(item => item !== itemToDelete);
        setSearchHistory(newHistory);
        localStorage.setItem('sermonScribeSearchHistory', JSON.stringify(newHistory));
    };
    
    const handleClearSearchHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('sermonScribeSearchHistory');
        setIsSearchHistoryModalVisible(false);
    };

    const handleSuggestionClick = (book: string) => {
        setSearchQuery(book + ' ');
        setSuggestions([]);
        searchInputRef.current?.focus();
    };

    const showVerseDetails = async (verseReference: string) => {
        setIsVerseDetailModalVisible(true);
        setIsVerseDetailLoading(true);
        setVerseDetailError('');
        setSelectedVerseDetails(null);
        
        try {
            // Step 1: Fetch the verse text itself. Use local KJV first.
            const passage = await fetchVerse(verseReference, 'kjv');
            
            // Step 2: Fetch context and related verses from Gemini AI
            const context = await getVerseContextAndRelatedVerses(passage.reference, passage.text);
            
            // Step 3: Combine and set the state
            setSelectedVerseDetails({ passage, context });

        } catch (error: any) {
            setVerseDetailError(error.message || `An unknown error occurred while fetching details for ${verseReference}.`);
        } finally {
            setIsVerseDetailLoading(false);
        }
    };

    const handleOrganizedNotesClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const verseTarget = target.closest('[data-verse]') as HTMLElement;

        if (verseTarget) {
            e.preventDefault();
            const verse = verseTarget.dataset.verse;
            if (verse) {
                showVerseDetails(verse);
            }
        }
    };

    const handleSaveNote = () => {
        const contentToSave = organizedNotes.trim() || rawNotes.trim();
        if (!contentToSave) return;

        const title = window.prompt("Enter a title for your note:");
        if (title && title.trim()) {
            const newNote: Note = {
                id: Date.now(),
                title: title.trim(),
                date: new Date().toLocaleString(),
                content: contentToSave,
            };
            const updatedNotes = [...savedNotes, newNote];
            setSavedNotes(updatedNotes);
            localStorage.setItem('sermonScribeNotes', JSON.stringify(updatedNotes));
            localStorage.removeItem(AUTO_SAVE_KEY); // Clear auto-save on explicit save
            
            isProgrammaticChangeRef.current = true;
            
            setRawNotes('');
            setOrganizedNotes('');
            setHasUnsavedChanges(false);
        }
    };

    const handleLoadNote = (noteId: number) => {
        const noteToLoad = savedNotes.find(note => note.id === noteId);
        if (noteToLoad) {
            if (hasUnsavedChanges && !window.confirm("You have unsaved changes that will be lost. Are you sure you want to load this note?")) {
                return;
            }
            isProgrammaticChangeRef.current = true;
            
            setRawNotes(noteToLoad.content);
            setOrganizedNotes(noteToLoad.content); // Pre-fill organized notes if it was saved that way
            setIsHistoryVisible(false);
            setHasUnsavedChanges(false);
        }
    };

    const handleDeleteNote = (noteId: number) => {
        if(window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
            const updatedNotes = savedNotes.filter(note => note.id !== noteId);
            setSavedNotes(updatedNotes);
            localStorage.setItem('sermonScribeNotes', JSON.stringify(updatedNotes));
        }
    };
    
    const handleOpenShareModal = (note: Note) => {
        setNoteToShare(note);
        setActiveShareTab('full');
        setSocialPostContent('');
        setShareError('');
        setIsShareModalVisible(true);
    };

    const handleGenerateSocialPost = async () => {
        if (!noteToShare || !isOnline) return;
        setActiveShareTab('social');
        if (socialPostContent) return; // Don't re-generate if we already have it

        setIsGeneratingSocialPost(true);
        setShareError('');
        try {
            const post = await generateSocialMediaPost(noteToShare.content);
            setSocialPostContent(post);
        } catch (error: any) {
            setShareError(error.message || 'Failed to generate post.');
        } finally {
            setIsGeneratingSocialPost(false);
        }
    };

    const handleShare = async (content: string, title: string) => {
        const cleanContent = content.replace(/<[^>]*>?/gm, ''); // Strip HTML tags for plain text sharing
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Sermon Notes: ${title}`,
                    text: cleanContent,
                });
                showToast("Shared successfully!");
            } catch (error) {
                console.error('Error sharing:', error);
                if ((error as DOMException).name !== 'AbortError') {
                    showToast("Sharing failed.");
                }
            }
        } else {
            // Fallback to copy
            navigator.clipboard.writeText(cleanContent).then(() => {
                showToast("Content copied to clipboard!");
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                showToast("Failed to copy content.");
            });
        }
    };

    // --- Settings / Bible Download Functions ---
    const updateDownloadedVersions = async () => {
        const versions = await dbService.getDownloadedVersions();
        setDownloadedVersions(versions);
    };

    const handleDownloadVersion = async (version: DownloadableBible) => {
        setDownloadProgress(prev => ({ ...prev, [version.key]: 0 }));

        // Simulate download progress
        const interval = setInterval(() => {
            setDownloadProgress(prev => {
                const current = prev[version.key] || 0;
                const next = Math.min(current + 10, 99);
                return { ...prev, [version.key]: next };
            });
        }, 100);

        try {
            await dbService.saveBibleVersion(version.data);
            setDownloadProgress(prev => ({ ...prev, [version.key]: 100 }));
            showToast(`${version.data.name} downloaded successfully.`);
        } catch (error) {
            console.error(`Failed to download ${version.key}`, error);
            showToast(`Failed to download ${version.data.name}.`);
            setDownloadProgress(prev => {
                const newState = { ...prev };
                delete newState[version.key];
                return newState;
            });
        } finally {
            clearInterval(interval);
            await updateDownloadedVersions();
            // Clear progress after a short delay
            setTimeout(() => {
                 setDownloadProgress(prev => {
                    const newState = { ...prev };
                    delete newState[version.key];
                    return newState;
                });
            }, 1000);
        }
    };

    const handleDeleteVersion = async (key: string) => {
        const versionMeta = BIBLE_VERSION_META.find(v => v.key === key);
        const name = versionMeta ? versionMeta.name : key.toUpperCase();
        if (window.confirm(`Are you sure you want to delete the ${name}?`)) {
            try {
                await dbService.deleteBibleVersion(key);
                await updateDownloadedVersions();
                showToast(`${name} deleted.`);
            } catch (error) {
                console.error(`Failed to delete ${key}`, error);
                showToast(`Failed to delete ${name}.`);
            }
        }
    };

    const renderMarkdown = (text: string) => {
        let processedText = text.trim()
            .replace(/<bible>(.*?)<\/bible>/g, (_, verse) => {
              const sanitizedVerse = verse.replace(/"/g, '&quot;'); // Sanitize for attribute
              let verseHtml = `<span class="inline-flex items-center gap-1.5 whitespace-nowrap">` +
                              `<a href="#" class="text-blue-600 hover:underline dark:text-blue-400 font-semibold" data-verse="${sanitizedVerse}">${sanitizedVerse}</a>`;
              if (isOnline) {
                verseHtml += `<button class="p-0.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" data-verse="${sanitizedVerse}" aria-label="View details for ${sanitizedVerse}">` +
                             infoIconSVG +
                             `</button>`;
              }
              verseHtml += `</span>`;
              return verseHtml;
            })
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 text-red-500 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

        const blocks = processedText.split('\n\n');

        const html = blocks.map(block => {
            if (block.startsWith('**') && block.endsWith('**')) {
                return `<h2 class="text-xl font-bold mt-4 mb-2 uppercase text-slate-800 dark:text-slate-200">${block.substring(2, block.length - 2)}</h2>`;
            }
            if (block.startsWith('> ')) {
                const lines = block.split('\n').map(line => line.substring(line.startsWith('> ') ? 2 : 0)).join('<br/>');
                return `<blockquote class="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic my-2">${lines}</blockquote>`;
            }
            
            if (block.startsWith('* ') || block.startsWith('- ') || block.match(/^\s*(\*|\-)/)) {
                const lines = block.split('\n');
                let listHtml = '';
                let listLevel = -1;
                
                lines.forEach((line) => {
                    const match = line.match(/^(\s*)(\*|\-)\s(.*)/);
                    if (match) {
                        const indent = match[1].length;
                        const level = Math.floor(indent / 2);
                        const content = match[3];

                        if (level > listLevel) {
                            listHtml += '<ul class="list-disc pl-5 mb-1">';
                        } else if (level < listLevel) {
                            listHtml += '</li>' + '</ul></li>'.repeat(listLevel - level);
                        } else {
                            if (listLevel !== -1) {
                                listHtml += '</li>';
                            }
                        }
                        
                        listHtml += `<li>${content}`;
                        listLevel = level;
                    }
                });

                if (listLevel > -1) {
                    listHtml += '</li>' + '</ul>'.repeat(listLevel + 1);
                }
                
                return listHtml;
            }

            return `<p class="mb-2">${block.replace(/\n/g, '<br/>')}</p>`;
        }).join('');
        
        return { __html: html };
    };

    // --- Dynamic Bible Version Logic ---
    const downloadedKeys = new Set(downloadedVersions.map(v => v.key));
    const standardOptionsFromBase = bibleVersions.find(g => g.label === 'Standard')?.options || [];
    const standardOptions: { value: string; name: string }[] = [...standardOptionsFromBase];
    const aiEnglishOptions: {value: string, name: string}[] = [];
    const aiLanguageOptions: {value: string, name: string}[] = [];

    // Process English AI group
    const englishAiFromBase = bibleVersions.find(g => g.label === 'English (AI)')?.options || [];
    for (const version of englishAiFromBase) {
        if (downloadedKeys.has(version.value)) {
            standardOptions.push({ ...version, name: version.name.replace(' (AI)', '') });
        } else {
            aiEnglishOptions.push(version);
        }
    }

    // Process Other Languages AI group
    const languageAiFromBase = bibleVersions.find(g => g.label === 'Other Languages (AI)')?.options || [];
    for (const version of languageAiFromBase) {
        if (downloadedKeys.has(version.value)) {
            const meta = BIBLE_VERSION_META.find(m => m.key === version.value);
            standardOptions.push({ value: version.value, name: meta ? meta.name : version.name.replace(' (AI)', '') });
        } else {
            aiLanguageOptions.push(version);
        }
    }

    // Sort and remove duplicates from standard options
    const uniqueStandardOptions = [...new Map(standardOptions.map(item => [item.value, item])).values()]
      .sort((a, b) => a.name.localeCompare(b.name));

    const dynamicBibleVersions = [
        { label: 'Standard', options: uniqueStandardOptions },
        { label: 'English (AI)', options: aiEnglishOptions },
        { label: 'Other Languages (AI)', options: aiLanguageOptions }
    ].filter(g => g.options.length > 0);

    const loadingText = isSearching && isTransforming ? 'Transforming with AI...' : 'Searching...';

    const selectedVersionName = allBibleVersions.find(v => v.value === searchVersion)?.name || 'KJV';

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
            {!isOnline && (
                <div className="bg-amber-500 text-white text-center py-2 text-sm font-semibold flex items-center justify-center gap-2 sticky top-0 z-50">
                    <WifiOffIcon />
                    You are currently offline. Some AI features are limited.
                </div>
            )}
            <header className="relative text-center py-6 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 text-white bg-gray-800">
                <div 
                    className="absolute inset-0 bg-cover bg-center z-0"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506880018603-12d96c800528?q=80&w=1887&auto=format&fit=crop')", opacity: 0.2 }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent z-0"></div>
                <div className="relative z-10 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 text-left">
                        <img src="/neka-fav.png" alt="Sermon Scribe Logo" className="h-10 w-10 sm:h-14 sm:w-14 rounded-2xl shadow-lg border-2 border-white/50"/>
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold drop-shadow-lg">Sermon Scribe</h1>
                            <p className="text-sm sm:text-base opacity-90 mt-1 drop-shadow-md">AI-powered sermon note-taking assistant.</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        {!isStandalone && (
                            <button
                                onClick={handleInstallRequest}
                                className="mt-4 sm:mt-0 flex-shrink-0 bg-nigerian-green text-white font-bold py-2 px-4 sm:py-2.5 sm:px-5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg ring-2 ring-white/50 text-sm sm:text-base"
                                aria-label="Install Sermon Scribe App"
                            >
                                <DownloadIcon />
                                <span>Install App</span>
                            </button>
                        )}
                         <button
                            onClick={() => setIsSettingsModalVisible(true)}
                            className="mt-4 sm:mt-0 flex-shrink-0 bg-slate-700/50 text-white font-bold p-2.5 sm:p-3 rounded-lg hover:bg-slate-600/50 transition-all flex items-center justify-center shadow-lg ring-2 ring-white/50"
                            aria-label="Open Settings"
                        >
                            <SettingsIcon />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 sm:p-6 lg:p-8 lg:-mt-10">
                {/* Notes Section */}
                <section className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-2xl flex flex-col z-10">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-slate-200 dark:border-slate-700">My Sermon Notes</h2>
                    <div className="relative">
                        <textarea
                            value={rawNotes}
                            onChange={(e) => setRawNotes(e.target.value)}
                            placeholder="Start typing your sermon notes here... Your work is saved automatically."
                            className="w-full h-48 sm:h-64 p-3 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-nigerian-green dark:focus:ring-nigerian-green/80 focus:border-nigerian-green dark:focus:border-nigerian-green/80 transition-shadow resize-y bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                            aria-label="Sermon notes input"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                            <button onClick={undo} disabled={!canUndo} className="p-1 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-500" aria-label="Undo"><UndoIcon /></button>
                            <button onClick={redo} disabled={!canRedo} className="p-1 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-500" aria-label="Redo"><RedoIcon /></button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handleOrganizeNotes}
                            disabled={isOrganizing || !rawNotes.trim() || !isOnline}
                            className="flex-1 bg-nigerian-green text-white font-bold py-2 px-4 rounded-md hover:opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            title={!isOnline ? "AI Organization is unavailable offline" : ""}
                        >
                            {isOrganizing ? (
                                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Organizing...</>
                            ) : "Organize with AI"}
                        </button>
                         <button
                            onClick={handleSaveNote}
                            disabled={!hasUnsavedChanges}
                            className="flex-1 bg-slate-600 dark:bg-slate-500 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            <SaveIcon /> <span className="ml-2">Save Note</span>
                        </button>
                        <button
                            onClick={() => setIsHistoryVisible(true)}
                            className="flex-1 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center"
                        >
                            <HistoryIcon /> <span className="ml-2">View History</span>
                        </button>
                    </div>

                    {notesError && <p className="text-red-500 dark:text-red-400 mt-2">{notesError}</p>}
                    
                    {organizedNotes && (
                        <div className="mt-6 border-t pt-4 border-slate-200 dark:border-slate-700 flex-grow">
                             <h3 className="text-xl font-semibold mb-2">Organized Notes:</h3>
                             <div 
                                className="prose dark:prose-invert max-w-none p-4 bg-slate-50 dark:bg-slate-900/50 rounded-md h-full overflow-y-auto" 
                                dangerouslySetInnerHTML={renderMarkdown(organizedNotes)}
                                onClick={handleOrganizedNotesClick}
                             ></div>
                        </div>
                    )}
                </section>

                {/* Bible Search Section */}
                <section className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-2xl z-10">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-slate-200 dark:border-slate-700">Bible Reference</h2>
                    <div>
                        <form onSubmit={handleSearch}>
                            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                <div className="flex-grow relative">
                                    <label htmlFor="searchQuery" className="sr-only">Search Query</label>
                                    <input
                                        id="searchQuery"
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                                        placeholder={searchType === 'verse' ? 'e.g., John 3:16-18' : 'e.g., faith hope love'}
                                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                                        autoComplete="off"
                                    />
                                    {suggestions.length > 0 && (
                                        <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {suggestions.map(book => (
                                                <li 
                                                    key={book} 
                                                    onMouseDown={() => handleSuggestionClick(book)}
                                                    className="px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-500"
                                                >
                                                    {book}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div ref={versionMenuRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsVersionMenuOpen(!isVersionMenuOpen)}
                                        className="h-full w-full sm:w-28 text-left p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 flex items-center justify-between"
                                        aria-haspopup="true"
                                        aria-expanded={isVersionMenuOpen}
                                    >
                                        <span className="truncate">{selectedVersionName}</span>
                                        <ChevronDownIcon />
                                    </button>
                                    {isVersionMenuOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30 max-h-80 overflow-y-auto">
                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                {dynamicBibleVersions.map(group => (
                                                    <div key={group.label} className="px-2 py-1">
                                                        <h3 className="px-2 pt-2 pb-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{group.label}</h3>
                                                        {group.options.map(version => (
                                                            <button 
                                                                key={version.value}
                                                                onClick={() => handleVersionChange(version.value)} 
                                                                disabled={group.label.includes('AI') && !isOnline}
                                                                className={`w-full text-left flex items-center gap-2 px-2 py-2 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${searchVersion === version.value ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'} hover:bg-slate-100 dark:hover:bg-slate-700`} 
                                                                role="menuitem"
                                                                title={group.label.includes('AI') && !isOnline ? "Unavailable offline" : ""}
                                                            >
                                                                {version.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="searchType" value="verse" checked={searchType === 'verse'} onChange={() => setSearchType('verse')} className="form-radio text-blue-600 dark:text-blue-500 bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
                                    <span className="ml-2 text-sm">Verse Lookup</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="searchType" value="keyword" checked={searchType === 'keyword'} onChange={() => setSearchType('keyword')} className="form-radio text-blue-600 dark:text-blue-500 bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500 focus:ring-blue-500 dark:focus:ring-blue-400"/>
                                    <span className="ml-2 text-sm">{isOnline ? 'Keyword Search (AI)' : 'Keyword Search (Offline)'}</span>
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {isSearching ? (
                                    <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> {loadingText}</>
                                    ) : (
                                    <><SearchIcon /> <span className="ml-2">Search</span></>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsSearchHistoryModalVisible(true)}
                                    className="p-2.5 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    aria-label="View search history"
                                >
                                    <HistoryIcon />
                                </button>
                            </div>
                        </form>
                    </div>
                    {searchError && <p className="text-red-500 dark:text-red-400 mt-2">{searchError}</p>}
                    
                    {searchResult && 'correctedQuery' in searchResult && searchResult.correctedQuery && (
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/50 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                            Did you mean: <button onClick={() => handleSuggestionSearch(searchResult.correctedQuery as string)} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">{searchResult.correctedQuery}</button>?
                        </div>
                    )}

                    {searchResult && searchResult.verses.length > 0 && (
                        <div className="mt-6 border-t pt-4 border-slate-200 dark:border-slate-700">
                             <h3 className="text-lg font-semibold">{searchResult.reference}</h3>
                             <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{searchResult.translation_name}</p>
                             {searchResult.translation_note && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 p-2 bg-amber-50 dark:bg-amber-900/50 rounded-md">{searchResult.translation_note}</p>
                             )}
                             <div className="space-y-1 max-h-80 sm:max-h-96 overflow-y-auto pr-2">
                                {searchResult.verses.map((verse) => (
                                    <div key={`${verse.book_id}-${verse.chapter}-${verse.verse}`} className="flex justify-between items-start gap-3 group py-2">
                                        <p className="flex-grow">
                                            <strong className="text-blue-700 dark:text-blue-400">{verse.book_name} {verse.chapter}:{verse.verse}</strong>
                                            <span className="ml-2">{verse.text}</span>
                                        </p>
                                        <button
                                          onClick={() => handleCopyVerse(verse)}
                                          className="p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                                          aria-label={`Copy verse ${verse.book_name} ${verse.chapter}:${verse.verse}`}
                                        >
                                            <CopyIcon />
                                        </button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </section>
            </main>

            {isHistoryVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-semibold">Saved Notes History</h3>
                            <button onClick={() => setIsHistoryVisible(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white" aria-label="Close">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {savedNotes.length > 0 ? (
                                <ul className="space-y-4">
                                    {[...savedNotes].reverse().map(note => (
                                        <li key={note.id} className="p-4 border dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-grow min-w-0">
                                                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={note.title}>{note.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{note.date}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 truncate">
                                                    {note.content.substring(0, 100)}{note.content.length > 100 && '...'}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
                                                <button onClick={() => handleLoadNote(note.id)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">Load</button>
                                                <button onClick={() => handleOpenShareModal(note)} className="p-2 text-green-600 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors" aria-label="Share note"><ShareIcon /></button>
                                                <button onClick={() => handleDeleteNote(note.id)} className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label="Delete note"><TrashIcon /></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-8">You have no saved notes yet. Type some notes and click "Save Note" to get started.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {isSearchHistoryModalVisible && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-semibold">Search History</h3>
                            <button onClick={() => setIsSearchHistoryModalVisible(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white" aria-label="Close">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {searchHistory.length > 0 ? (
                                <>
                                    <ul className="space-y-2">
                                        {searchHistory.map(item => (
                                            <li key={item} className="p-3 border dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between gap-3 group">
                                                <button onClick={() => handleHistoryItemClick(item)} className="flex-grow text-left truncate text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
                                                    {item}
                                                </button>
                                                <button onClick={() => handleDeleteSearchHistoryItem(item)} className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100" aria-label="Delete history item">
                                                    <TrashIcon />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-6 text-center">
                                         <button onClick={handleClearSearchHistory} className="text-sm text-red-600 dark:text-red-400 hover:underline">
                                            Clear All History
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-slate-500 dark:text-slate-400 py-8">Your search history is empty.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isVerseDetailModalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-semibold">
                                {selectedVerseDetails ? selectedVerseDetails.passage.reference : 'Verse Details'}
                            </h3>
                            <button onClick={() => setIsVerseDetailModalVisible(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white" aria-label="Close">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {isVerseDetailLoading && (
                                <div className="flex justify-center items-center h-64">
                                    <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span className="ml-4 text-lg">Fetching details...</span>
                                </div>
                            )}
                            {verseDetailError && <p className="text-center text-red-500 dark:text-red-400 py-8">{verseDetailError}</p>}

                            {selectedVerseDetails && !isVerseDetailLoading && (
                                <div className="space-y-6">
                                    {/* Main Verse */}
                                    <div>
                                        <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic text-lg">
                                            {selectedVerseDetails.passage.text}
                                        </blockquote>
                                        <p className="text-right text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            - {selectedVerseDetails.passage.translation_name}
                                        </p>
                                    </div>
                                    
                                    {/* Context Summary */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Context</h4>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            {selectedVerseDetails.context.contextSummary}
                                        </p>
                                    </div>

                                    {/* Related Verses */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Related Verses</h4>
                                        <ul className="space-y-4">
                                            {selectedVerseDetails.context.relatedVerses.map(verse => (
                                                <li key={verse.reference} className="p-3 border-l-2 border-slate-200 dark:border-slate-700">
                                                    <button onClick={() => showVerseDetails(verse.reference)} className="font-semibold text-blue-600 hover:underline dark:text-blue-400 text-left">
                                                        {verse.reference}
                                                    </button>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">
                                                    {verse.explanation}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {isShareModalVisible && noteToShare && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-semibold truncate" title={noteToShare.title}>Share: {noteToShare.title}</h3>
                            <button onClick={() => setIsShareModalVisible(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white" aria-label="Close"><CloseIcon /></button>
                        </div>
                        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex border border-slate-300 dark:border-slate-600 rounded-md p-1 bg-slate-100 dark:bg-slate-900">
                                <button onClick={() => setActiveShareTab('full')} className={`flex-1 py-1.5 px-3 rounded text-sm font-semibold transition-colors ${activeShareTab === 'full' ? 'bg-white dark:bg-slate-700 text-nigerian-green shadow' : 'text-slate-600 dark:text-slate-300'}`}>Full Note</button>
                                <button onClick={handleGenerateSocialPost} disabled={!isOnline} className={`flex-1 py-1.5 px-3 rounded text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeShareTab === 'social' ? 'bg-white dark:bg-slate-700 text-nigerian-green shadow' : 'text-slate-600 dark:text-slate-300'}`} title={!isOnline ? "Unavailable offline" : "Generate a social media post with AI"}>Social Post</button>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
                            {activeShareTab === 'full' ? (
                                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans" dangerouslySetInnerHTML={{ __html: renderMarkdown(noteToShare.content).__html.replace(/<br\s*\/?>/gi, '\n') }}></div>
                            ) : (
                                <>
                                {isGeneratingSocialPost && <div className="text-center p-8">Generating post...</div>}
                                {shareError && <div className="text-center p-8 text-red-500">{shareError}</div>}
                                {socialPostContent && <div className="whitespace-pre-wrap">{socialPostContent}</div>}
                                </>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-right">
                           <button 
                                onClick={() => handleShare(activeShareTab === 'full' ? noteToShare.content : socialPostContent, noteToShare.title)}
                                disabled={(activeShareTab === 'social' && (!socialPostContent || isGeneratingSocialPost))}
                                className="bg-nigerian-green text-white font-bold py-2 px-5 rounded-md hover:opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {navigator.share ? 'Share' : 'Copy Text'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isInstallModalVisible && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-semibold">Install Sermon Scribe</h3>
                            <button onClick={() => setIsInstallModalVisible(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white" aria-label="Close">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto text-center">
                            <img src="/neka-fav.png" alt="Sermon Scribe Logo" className="h-20 w-20 rounded-3xl shadow-lg mx-auto mb-4"/>
                            <p className="mb-4 text-slate-600 dark:text-slate-300">Get a seamless, app-like experience by adding Sermon Scribe to your home screen.</p>
                            {platform === 'ios' ? (
                                <div className="text-left bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                                    <p className="font-semibold">For iPhone & iPad:</p>
                                    <ol className="list-decimal list-inside mt-2 space-y-2 text-sm">
                                        <li>Open this page in the <strong>Safari</strong> browser.</li>
                                        <li>Tap the 'Share' button <IosShareIcon /> in the toolbar.</li>
                                        <li>Scroll down the options and tap <strong>'Add to Home Screen'</strong>.</li>
                                    </ol>
                                </div>
                            ) : (
                                <div className="text-left bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                                    <p className="font-semibold">For Desktop (Chrome, Edge):</p>
                                     <ol className="list-decimal list-inside mt-2 space-y-2 text-sm">
                                        <li>Look for the <DownloadIcon /> icon in your browser's address bar.</li>
                                        <li>Click it and then click <strong>'Install'</strong>.</li>
                                        <li>Alternatively, click the three-dot menu and select 'Install Sermon Scribe'.</li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {isSettingsModalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-xl font-semibold">Settings</h3>
                            <button onClick={() => setIsSettingsModalVisible(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white" aria-label="Close"><CloseIcon /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Offline Bible Versions</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Download Bible versions to use them when you are offline.</p>
                            <ul className="space-y-3">
                                {[...BIBLE_VERSION_META]
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(version => {
                                    const downloaded = downloadedVersions.find(v => v.key === version.key);
                                    const isBundled = version.key === 'kjv';
                                    const progress = downloadProgress[version.key];
                                    const isDownloading = typeof progress === 'number';

                                    return (
                                        <li key={version.key} className="p-3 border dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-grow">
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{version.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                   {isBundled ? "Bundled with app" : downloaded ? `Downloaded (${(downloaded.size / 1024 / 1024).toFixed(2)} MB)` : `~${version.sizeMB} MB`}
                                                </p>
                                                {isDownloading && (
                                                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 mt-2">
                                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
                                                {isBundled ? (
                                                    <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5"><CheckCircleIcon/> Available</span>
                                                ) : downloaded ? (
                                                    <button onClick={() => handleDeleteVersion(version.key)} className="px-3 py-1.5 text-sm bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition-colors flex items-center gap-1.5"><TrashIcon/> Delete</button>
                                                ) : (
                                                    // Fix: Find the full bible data object to pass to handleDownloadVersion.
                                                    <button onClick={() => {
                                                        const bibleToDownload = DOWNLOADABLE_BIBLES.find(b => b.key === version.key);
                                                        if (bibleToDownload) {
                                                            handleDownloadVersion(bibleToDownload);
                                                        }
                                                    }} disabled={isDownloading} className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center gap-1.5"><CloudDownloadIcon/> {isDownloading ? `Downloading... ${progress}%` : 'Download'}</button>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div 
                    key={Date.now()}
                    className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-4 py-3 shadow-lg animate-fade-in-out"
                    role="status"
                    aria-live="polite"
                >
                    <CheckCircleIcon />
                    <p className="text-sm font-medium">{toastMessage}</p>
                </div>
            )}
        </div>
    );
}

export default App;