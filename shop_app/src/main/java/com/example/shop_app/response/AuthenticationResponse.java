package com.example.shop_app.response;

public class AuthenticationResponse {
    private String accessToken;
    private String refreshToken;
    private boolean authenticated;

    public AuthenticationResponse(String accessToken, String refreshToken, boolean authenticated) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.authenticated = authenticated;
    }
    public AuthenticationResponse() {
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }
}
