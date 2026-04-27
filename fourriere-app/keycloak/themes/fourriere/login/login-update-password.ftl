<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
    <#if section = "header">
        <h1 class="auth-title">Définir un nouveau mot de passe</h1>
        <p class="auth-subtitle">
            Pour des raisons de sécurité, choisissez un mot de passe personnel avant de continuer.
        </p>
    <#elseif section = "form">
        <form id="kc-passwd-update-form" action="${url.loginAction}" method="post" novalidate>
            <input type="text" id="username" name="username" value="${(username)!''}" autocomplete="username" readonly="readonly" style="display:none;">
            <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;">

            <div class="form-group">
                <label for="password-new">${msg("passwordNew")}</label>
                <div class="password-wrapper">
                    <input
                        type="password"
                        id="password-new"
                        name="password-new"
                        class="form-input <#if messagesPerField.existsError('password')>error</#if>"
                        autocomplete="new-password"
                        autofocus
                        dir="ltr"
                    />
                    <button type="button" class="password-toggle" onclick="togglePwd('password-new')" tabindex="-1" aria-label="Afficher / masquer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
                <#if messagesPerField.existsError('password')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-group">
                <label for="password-confirm">${msg("passwordConfirm")}</label>
                <div class="password-wrapper">
                    <input
                        type="password"
                        id="password-confirm"
                        name="password-confirm"
                        class="form-input <#if messagesPerField.existsError('password-confirm')>error</#if>"
                        autocomplete="new-password"
                        dir="ltr"
                    />
                    <button type="button" class="password-toggle" onclick="togglePwd('password-confirm')" tabindex="-1" aria-label="Afficher / masquer">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                </div>
                <#if messagesPerField.existsError('password-confirm')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</span>
                </#if>
            </div>

            <#if isAppInitiatedAction??>
                <div class="form-options">
                    <label class="checkbox-row">
                        <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" checked>
                        ${msg("logoutOtherSessions")}
                    </label>
                </div>
            </#if>

            <#if isAppInitiatedAction??>
                <button class="btn btn-primary" type="submit">${msg("doSubmit")}</button>
                <button class="btn btn-secondary" type="submit" name="cancel-aia" value="true" style="width:100%;margin-top:10px;">${msg("doCancel")}</button>
            <#else>
                <button class="btn btn-primary" type="submit">${msg("doSubmit")}</button>
            </#if>
        </form>

        <script>
          function togglePwd(id) {
            var el = document.getElementById(id);
            if (!el) return;
            el.type = el.type === 'password' ? 'text' : 'password';
          }
        </script>
    </#if>
</@layout.registrationLayout>
