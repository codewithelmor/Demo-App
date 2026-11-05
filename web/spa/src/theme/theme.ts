import { createTheme } from '@mui/material/styles'

/**
 * The Material UI theme for the whole app: the standard Material palette (default blue) and system fonts
 * (the CSP allows `'self'` only, so no web fonts). `cssVariables` makes MUI write its palette as CSS
 * variables (`--mui-palette-primary-main`), which `styles/globals.css` reuses.
 *
 * CssBaseline below also sets the base page rhythm: paragraph, list and heading margins, so plain HTML
 * text between Material UI components is spaced evenly.
 */
export const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCssBaseline: {
      styleOverrides: {
        'h1, h2, h3, h4, h5, h6': {
          marginTop: 0,
          marginBottom: '0.5rem',
          fontWeight: 500,
          lineHeight: 1.2,
        },
        h1: { fontSize: '2rem' },
        h2: { fontSize: '1.75rem' },
        h3: { fontSize: '1.5rem' },
        h4: { fontSize: '1.25rem' },
        'p, dl, ol, ul': { marginTop: 0, marginBottom: '1rem' },
        'ol, ul': { paddingLeft: '2rem' },
        dd: { marginBottom: '0.5rem', marginLeft: 0 },
        figure: { margin: '0 0 1rem' },
        small: { fontSize: '0.875em' },
        a: { color: 'var(--mui-palette-primary-main)', textDecoration: 'underline' },
        caption: {
          padding: '0.5rem 0',
          color: 'var(--mui-palette-text-secondary)',
          textAlign: 'left',
          captionSide: 'bottom',
        },
        th: { textAlign: 'inherit' },
        label: { display: 'inline-block' },
        'input, button, select, textarea': { margin: 0, font: 'inherit' },
        textarea: { resize: 'vertical' },
        code: { fontSize: '0.875em' },
      },
    },
  },
})
