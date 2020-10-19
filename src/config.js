export default {
    keycloak: {
        url: 'https://auth0.rcc.uq.edu.au/auth/',
        realm: 'ipp',
        clientId: 'jsclient',
        onLoad: 'login-required',
        minValidity: 10
    },
    endpoints: {
      pref: 'https://pref.dev.rcc.uq.edu.au',
      wiener: 'https://wwi-test.qbi.uq.edu.au/devwienerbackend'
    },
    signoutUrl: 'https://ipp.rcc.uq.edu.au'
  }
  