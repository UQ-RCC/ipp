const LPI_RUNS_URL = 'https://tsx.org.au/lpi_runs'
export const ROOT_URL = 'https://tsx.org.au/tsxapi'

export function isLoggedIn() {
  return get('/is_logged_in')
}

