import { combineReducers } from 'redux';
import authReducer from './authReducer';
import languageReducer from './languageReducer';


const rootReducers =  combineReducers({
  auth: authReducer,
  language:languageReducer
});

export default rootReducers;