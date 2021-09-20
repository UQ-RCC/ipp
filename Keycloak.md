1. Keycloak setup

Need to add jsclient into aud. 

Configure audience in Keycloak

    Add realm or configure existing
    Add client my-app or use existing
    Goto to the newly added "Client Scopes" menu [1]
        Add Client scope 'good-service'
        Within the settings of the 'good-service' goto Mappers tab
            Create Protocol Mapper 'my-app-audience'
                Name: my-app-audience
                Choose Mapper type: Audience
                Included Client Audience: my-app
                Add to access token: on
    Configure client my-app in the "Clients" menu
        Client Scopes tab in my-app settings
        Add available client scopes "good-service" to assigned default client scopes

If you have more than one client repeat the steps for the other clients as well and add the good-service scope. The intention behind this is to isolate client access. The issued access token will only be valid for the intended audience. This is thoroughly described in Keycloak's documentation [1,2].
Links to recent master version of keycloak documentation:

    [1] https://github.com/keycloak/keycloak-documentation/blob/master/server_admin/topics/clients/client-scopes.adoc
    [2] https://github.com/keycloak/keycloak-documentation/blob/master/server_admin/topics/clients/oidc/audience.adoc

2. add User to default role, remove users and add them bcak if needed




To build with docker locally (might conflict if vpn is used): docker build . -t tagname --network host