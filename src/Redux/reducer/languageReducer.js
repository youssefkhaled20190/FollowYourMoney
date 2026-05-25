import { SET_LANGUAGE } from "../actions/languageActions";

// Load initial language from localStorage or default to 'en'
const getInitialLanguage = () => {
  try {
    const savedLang = localStorage.getItem('language');
    return savedLang || 'en';
  } catch (err) {
    console.error('Error loading language from localStorage:', err);
    return 'en';
  }
};

const initialState = {
  lang: getInitialLanguage(), // Load from localStorage on initialization
};

const languageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LANGUAGE:
      // Save to localStorage whenever language changes
      try {
        localStorage.setItem('language', action.payload);
      } catch (err) {
        console.error('Error saving language to localStorage:', err);
      }
      return { ...state, lang: action.payload };
    default:
      return state;
  }
};

export default languageReducer;
