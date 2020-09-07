export default {
    keycloak: {
        url: 'https://auth0.rcc.uq.edu.au/auth/',
        realm: 'ipp',
        clientId: 'jsclient',
        onLoad: 'login-required'
    },
    endpoints: {
      pref: 'https://pref.dev.rcc.uq.edu.au',
      wiener: 'https://wiener.dev.rcc.uq.edu.au'
    },
    signoutUrl: 'https://ipp.rcc.uq.edu.au'
  }
  