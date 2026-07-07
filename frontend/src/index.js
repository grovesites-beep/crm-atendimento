import { Buffer } from "buffer";
import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import * as serviceworker from './serviceWorker';
import App from "./App";

// IMPORTANDO A FONTE INTER
import "@fontsource/inter"; // peso 400 padrão
import "@fontsource/inter/500.css"; // peso 500 opcional
import "@fontsource/inter/600.css"; // peso 600 opcional
import "@fontsource/inter/700.css"; // peso 700 opcional

window.Buffer = Buffer;

// CRIANDO O TEMA COM A FONTE INTER
const theme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById("root"),
  () => {
    window.finishProgress && window.finishProgress();
  }
);

serviceworker.register();
