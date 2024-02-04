import { createContext, Dispatch, FunctionComponent, ReactNode, useContext, useReducer } from "react";
import { useTranslation } from "react-i18next";

const STORAGE = window.localStorage;
const PREFERENCES_KEY = "spoty-preferences";

const AppContextContext = createContext<AppContextPair | undefined>(undefined);

// A custom-element allowing its descendant to use `useAppContext`.
export const AppContext: FunctionComponent<{children: ReactNode}> = ({children}) => {
  const { i18n } = useTranslation();
  const pair = useReducer(dispatchAppContext, initAppContext(i18n.changeLanguage));

  return <AppContextContext.Provider value={pair}>
    {children}
  </AppContextContext.Provider>
};

// Get access to the application context (see `AppContextSingleton`)
// and a dispatch function to modify it (see `AppContextAction`).
export function useAppContext(): AppContextPair {
  return useContext(AppContextContext) as AppContextPair;
}

// The singleton-class of the application context.
export class AppContextSingleton {
  // Preferences
  preferences = new AppPreferencesSingleton();
  // Indicates whether the login is still in progress (in particular, if the full profile is still loading).
  //
  // Note that session.isLoggedIn will be true before this flag comes back to `false` after a call to `login`.
  loginInProgress = false;
  // A function for changing the language in the environment
  changeLanguage = (_: string) => {};
  // Useful for debugging purposes.
  debug = 0;

  // methods:
  // (NB: can not use "proper" methods, this prevents us from using the spread syntax in dispatcher)

  // Constructs a valid locale from preferences
  locale = function(this: AppContextSingleton) {
    if (this._localeCache == null) {
      this._localeCache = computeLocale(this);
      console.debug("AppContextSingleton.locale", this._localeCache)
    }
    return this._localeCache;
  }

  // private attribute for memoizing the result of locale()
  _localeCache: string | null = null;
}

// The singleton-class of the application preferences.
export class AppPreferencesSingleton {
  // The preferred language to use
  language = "en";
  // Locale suffix
  localeSuffix = "";
}

function initAppContext(changeLanguage: (lang: string) => void): AppContextSingleton {
  console.debug("initAppContext starting");
  let ret = new AppContextSingleton();
  ret.changeLanguage = changeLanguage;

  // detecting if login is in progress
  //  NB: detecting loging paramaters in URL is not entirely relibable,
  //      because the page is sometimes re-rendered without the parameter before the profile had a change to load completely,
  //      so we "cache" this hint in module variable LOGIN_IN_PROGRESS
  if (window.location.search !== "") {
    console.debug("initAppContext: detecting login parameters in URL");
    ret.loginInProgress = true;
    LOGIN_IN_PROGRESS = true;
  } else if (LOGIN_IN_PROGRESS) {
    console.debug("initAppContext: module variable LOGIN_IN_PROGRESS was set");
    ret.loginInProgress = true;
  } else {
    LOGIN_IN_PROGRESS = false;
  }

  // load saved preferences if any
  let savedPref = undefined;
  try { savedPref = JSON.parse(STORAGE.getItem(PREFERENCES_KEY) ?? "x"); }
  catch (e) { console.debug("Can not load preferences:", e); }
  if (savedPref) {
    ret.preferences = savedPref;
  }
  // TODO load preferences from Pod instead?
  
  return ret;
}

// The actions one can dispatch to modify the application context (see `useAppContext`).
//
// They should be self-explanatory.
export type AppContextAction = 
  { type: "setLanguage", value: string } |
  { type: "setLocaleSuffix", value: string } |
  { type: "setLoginInProgress" } |
  { type: "unsetLoginInProgress"} |

  { type: "incDebug" };
  

function dispatchAppContext(old: AppContextSingleton, action: AppContextAction): AppContextSingleton {
  let preferences;
  switch (action.type) {
    case "setLanguage":
      console.debug("AppContex: setLanguage", action.value);
      old.changeLanguage(action.value);
      preferences = { ...old.preferences, language: action.value };
      STORAGE.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      return { ...old, preferences, _localeCache: null};
    case "setLocaleSuffix":
      console.debug("AppContex: setLocaleSuffix", action.value);
      preferences = { ...old.preferences, localeSuffix: action.value };
      STORAGE.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      return { ...old, preferences, _localeCache: null};
    case "setLoginInProgress":
      console.debug("AppContex: setLoginInProgress");
      return { ...old, loginInProgress: true };
    case "unsetLoginInProgress":
      console.debug("AppContex: unsetLoginInProgress");
      return { ...old, loginInProgress: false };
    case "incDebug":
      console.debug("AppContex: incDebug");
      return { ...old, debug: old.debug + 1};
  }
}

type AppContextPair =  [AppContextSingleton, Dispatch<AppContextAction>];

function computeLocale(appCtx: AppContextSingleton): string {
  console.debug("computeLocale");
  const language = appCtx.preferences.language;
  const suffix = appCtx.preferences.localeSuffix;
  if (suffix) {
    const locale = language + "-" + suffix;
    try {
      (42).toLocaleString(locale) ;
      return locale;
    }
    catch {}
  }
  try {
    (42).toLocaleString(language);
    return language;
  }
  catch {}
  return 'en';
}

// Useful for loading preferences at initialization
export function loadPreferredLanguage() {
  try {
    return JSON.parse(STORAGE.getItem(PREFERENCES_KEY) ?? "x").language;
  }
  catch(_) {
    return undefined;
  }
}

let LOGIN_IN_PROGRESS = false;
