/**
 * @file AppContext.jsx
 * @description Global application state provider using React Context.
 *              Manages user info, language selection, chat history, and theme.
 */

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { generateId } from '../utils/helpers';
import { SAMPLE_QUERIES } from '../utils/constants';

/** @type {React.Context} */
const AppContext = createContext(null);

/** Initial global state */
const initialState = {
  user: null,
  selectedLanguage: 'auto',
  codeMixedMode: false,
  chatHistory: [],
  analysisData: null,
  theme: typeof window !== 'undefined' ? localStorage.getItem('medilingual_theme') || 'light' : 'light',
  isSidebarOpen: true,
  isLoading: false,
};

/** Action types */
const ACTIONS = {
  SET_USER: 'SET_USER',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_CODE_MIXED: 'SET_CODE_MIXED',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_ANALYSIS: 'SET_ANALYSIS',
  CLEAR_CHAT: 'CLEAR_CHAT',
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_LOADING: 'SET_LOADING',
};

/**
 * State reducer for global actions.
 * @param {Object} state - Current state.
 * @param {{ type: string, payload: any }} action - Dispatched action.
 * @returns {Object} New state.
 */
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    case ACTIONS.SET_LANGUAGE:
      return { ...state, selectedLanguage: action.payload };
    case ACTIONS.SET_CODE_MIXED:
      return { ...state, codeMixedMode: action.payload };
    case ACTIONS.ADD_MESSAGE:
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case ACTIONS.SET_ANALYSIS:
      return { ...state, analysisData: action.payload };
    case ACTIONS.CLEAR_CHAT:
      return { ...state, chatHistory: [], analysisData: null };
    case ACTIONS.SET_THEME:
      return { ...state, theme: action.payload };
    case ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

/**
 * AppProvider wraps the application with global context.
 * @param {{ children: React.ReactNode }} props
 */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setUser = useCallback((user) => {
    dispatch({ type: ACTIONS.SET_USER, payload: user });
  }, []);

  const setLanguage = useCallback((lang) => {
    dispatch({ type: ACTIONS.SET_LANGUAGE, payload: lang });
  }, []);

  const setCodeMixed = useCallback((enabled) => {
    dispatch({ type: ACTIONS.SET_CODE_MIXED, payload: enabled });
  }, []);

  const addMessage = useCallback((message) => {
    dispatch({
      type: ACTIONS.ADD_MESSAGE,
      payload: { id: generateId(), timestamp: new Date().toISOString(), ...message },
    });
  }, []);

  const setAnalysis = useCallback((data) => {
    dispatch({ type: ACTIONS.SET_ANALYSIS, payload: data });
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_CHAT });
  }, []);

  const setTheme = useCallback((newTheme) => {
    dispatch({ type: ACTIONS.SET_THEME, payload: newTheme });
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('medilingual_theme', newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [state.theme, setTheme]);

  // Sync dark class on mount and theme state change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    }
  }, [state.theme]);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: ACTIONS.TOGGLE_SIDEBAR });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  }, []);

  /**
   * Sends a query and simulates a response using sample data.
   * In production, this calls the real API.
   * @param {string} queryText - The user's query.
   */
  const sendChatQuery = useCallback(
    async (queryText) => {
      addMessage({ role: 'user', content: queryText });
      setLoading(true);

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

        // Find a matching sample or pick a random one
        const matchedSample =
          SAMPLE_QUERIES.find(
            (s) =>
              queryText.toLowerCase().includes('headache') ||
              queryText.toLowerCase().includes('fever') ||
              queryText.toLowerCase().includes('sugar') ||
              s.query.toLowerCase() === queryText.toLowerCase()
          ) || SAMPLE_QUERIES[Math.floor(Math.random() * SAMPLE_QUERIES.length)];

        addMessage({ role: 'assistant', content: matchedSample.response });
        setAnalysis(matchedSample.analysis);
      } catch (error) {
        addMessage({
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your query. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    },
    [addMessage, setAnalysis, setLoading]
  );

  const value = {
    ...state,
    setUser,
    setLanguage,
    setCodeMixed,
    addMessage,
    setAnalysis,
    clearChat,
    setTheme,
    toggleTheme,
    toggleSidebar,
    setLoading,
    sendChatQuery,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to access the global AppContext.
 * @returns {Object} Context value.
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
