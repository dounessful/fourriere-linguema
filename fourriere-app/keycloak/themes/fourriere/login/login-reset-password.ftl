<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username') displayInfo=true; section>
    <#if section = "header">
        <h1 class="auth-title">Mot de passe oublié</h1>
        <p class="auth-subtitle">
            Entrez votre <#if !realm.loginWithEmailAllowed>identifiant<#elseif !realm.registrationEmailAsUsername>identifiant ou email<#else>email</#if>, nous vous enverrons un lien de réinitialisation.
        </p>
    <#elseif section = "form">
        <form id="kc-reset-password-form" action="${url.loginAction}" method="post" novalidate>
            <div class="form-group">
                <label for="username">
                    <#if !realm.loginWithEmailAllowed>${msg("username")}
                    <#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}
                    <#else>${msg("email")}</#if>
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    class="form-input <#if messagesPerField.existsError('username')>error</#if>"
                    autofocus
                    value="${(auth.attemptedUsername!'')}"
                    autocomplete="off"
                    dir="ltr"
                />
                <#if messagesPerField.existsError('username')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
                </#if>
            </div>

            <button class="btn btn-primary" type="submit">${msg("doSubmit")}</button>

            <div class="divider"></div>

            <a href="${url.loginUrl}" class="btn btn-secondary" style="width:100%;">
                ← Retour à la connexion
            </a>
        </form>
    <#elseif section = "info">
        ${msg("emailInstruction")}
    </#if>
</@layout.registrationLayout>
