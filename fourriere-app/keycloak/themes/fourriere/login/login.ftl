<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password'); section>
    <#if section = "header">
        <h1 class="auth-title">Se connecter</h1>
        <p class="auth-subtitle">Accédez à votre espace ${realm.displayName!'Fourrière'}</p>
    <#elseif section = "form">
        <#if realm.password>
            <form id="kc-form-login" action="${url.loginAction}" method="post" novalidate>
                <div class="form-group">
                    <label for="username">
                        <#if !realm.loginWithEmailAllowed>${msg("username")}
                        <#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}
                        <#else>${msg("email")}</#if>
                    </label>
                    <input
                        tabindex="1"
                        id="username"
                        class="form-input <#if messagesPerField.existsError('username','password')>error</#if>"
                        name="username"
                        value="${(login.username!'')}"
                        type="text"
                        autofocus
                        autocomplete="off"
                        dir="ltr"
                    />
                    <#if messagesPerField.existsError('username','password')>
                        <span class="field-error">${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</span>
                    </#if>
                </div>

                <div class="form-group">
                    <label for="password">${msg("password")}</label>
                    <div class="password-wrapper">
                        <input
                            tabindex="2"
                            id="password"
                            class="form-input <#if messagesPerField.existsError('username','password')>error</#if>"
                            name="password"
                            type="password"
                            autocomplete="off"
                            dir="ltr"
                        />
                        <button type="button" class="password-toggle" onclick="togglePwd()" tabindex="-1" aria-label="Afficher / masquer le mot de passe">
                            <svg id="pwd-eye" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                </div>

                <div class="form-options">
                    <#if realm.rememberMe && !usernameHidden??>
                        <label class="checkbox-row">
                            <#if login.rememberMe??>
                                <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked>
                            <#else>
                                <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox">
                            </#if>
                            ${msg("rememberMe")}
                        </label>
                    <#else>
                        <span></span>
                    </#if>

                    <#if realm.resetPasswordAllowed>
                        <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="text-link">${msg("doForgotPassword")}</a>
                    </#if>
                </div>

                <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                <button tabindex="4" class="btn btn-primary" name="login" id="kc-login" type="submit">
                    ${msg("doLogIn")}
                </button>
            </form>
        </#if>
    </#if>

    <script>
      function togglePwd() {
        var input = document.getElementById('password');
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    </script>
</@layout.registrationLayout>
