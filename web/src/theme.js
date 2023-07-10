import { createTheme, ThemeProvider } from '@mui/material/styles';

export const rankTheme = {
  provider: createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: '#24eaa8',
        },
        secondary: {
          main: '#34544c',
        },
        background: {
          default: '#002a1c',
          paper: '#002a1c',
        }
      }
  }),
  primary: "#24eaa8",
  secondary: "#34544c",
  background: "#002a1c",
  color: "#eee",
  colorMuted: "rgba(255, 255, 255, 0.7)",
  rankGoldBackground: "rgba(241, 196, 15, 0.36)",
  rankSilverBackground: "rgba(161, 164, 201, 0.36)",
  rankBronzeBackground: "rgba(173, 138, 86, 0.36)",
  rankGold: "rgb(248, 225, 135)",
  rankSilver: "rgb(208, 210, 228)",
  rankBronze: "rgb(214, 196, 170)"
};

export { ThemeProvider as Theme };