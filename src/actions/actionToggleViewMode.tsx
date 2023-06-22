import { CODES, KEYS } from "../keys";
import { register } from "./register";

export const actionToggleViewMode = register({
  name: "viewMode",
  viewMode: true,
  trackEvent: {
    category: "canvas",
    predicate: (appState) => !appState.viewModeEnabled,
  },
  perform(elements, appState, _, app) {
    //zsviczian
    if (app.props.onViewModeChange) {
      //zsviczian
      app.props.onViewModeChange(!this.checked!(appState));
    }
    return {
      appState: {
        ...appState,
        viewModeEnabled: !this.checked!(appState),
      },
      commitToHistory: false,
    };
  },
  checked: (appState) => appState.viewModeEnabled,
  predicate: (elements, appState, appProps) => {
    return typeof appProps.viewModeEnabled === "undefined";
  },
  contextItemLabel: "labels.viewMode",
  keyTest: (event) =>
    !event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === CODES.R,
});
