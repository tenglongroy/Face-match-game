import React from 'react';
import Board from './components/Board';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#05aba9"
    },
    secondary: {
      main: '#fbcbb7',
    },
    default: {
      main: "#95c9e2",
      dark: "#77a0b4",
      light: "#aad3e7",
    },
    inherit: {
      main: "#fee4a7",
      light: "#fee9b8",
      dark: "#cbb685"
    },
    /* fifth: {
      main: "	#d9eedb"
    } */
  },
});


function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Board key="board" />
      </ThemeProvider>
    </div>
  );
}

export default App;
