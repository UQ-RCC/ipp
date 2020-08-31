export const config = {
    keycloak: {
        url: 'https://auth.rcc.uq.edu.au/auth/',
        realm: 'wiener',
        clientId: 'jsclient',
        onLoad: 'login-required'
    },
    services: {
        preference: '',
        hpc: ''
    }
};