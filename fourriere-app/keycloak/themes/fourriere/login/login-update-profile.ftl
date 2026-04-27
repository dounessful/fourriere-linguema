<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','firstName','lastName','email'); section>
    <#if section = "header">
        <h1 class="auth-title">Compléter votre profil</h1>
        <p class="auth-subtitle">
            Quelques informations supplémentaires sont nécessaires avant de continuer.
        </p>
    <#elseif section = "form">
        <form id="kc-update-profile-form" action="${url.loginAction}" method="post" novalidate>
            <#if user.editUsernameAllowed>
                <div class="form-group">
                    <label for="username">${msg("username")}</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        class="form-input <#if messagesPerField.existsError('username')>error</#if>"
                        value="${(user.username)!''}"
                        autofocus
                        autocomplete="username"
                        dir="ltr"
                    />
                    <#if messagesPerField.existsError('username')>
                        <span class="field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
                    </#if>
                </div>
            </#if>

            <div class="form-group">
                <label for="email">${msg("email")}</label>
                <input
                    type="text"
                    id="email"
                    name="email"
                    class="form-input <#if messagesPerField.existsError('email')>error</#if>"
                    value="${(user.email)!''}"
                    autocomplete="email"
                    dir="ltr"
                />
                <#if messagesPerField.existsError('email')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('email'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-group">
                <label for="firstName">${msg("firstName")}</label>
                <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    class="form-input <#if messagesPerField.existsError('firstName')>error</#if>"
                    value="${(user.firstName)!''}"
                    autocomplete="given-name"
                />
                <#if messagesPerField.existsError('firstName')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('firstName'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-group">
                <label for="lastName">${msg("lastName")}</label>
                <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    class="form-input <#if messagesPerField.existsError('lastName')>error</#if>"
                    value="${(user.lastName)!''}"
                    autocomplete="family-name"
                />
                <#if messagesPerField.existsError('lastName')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('lastName'))?no_esc}</span>
                </#if>
            </div>

            <#if isAppInitiatedAction??>
                <button class="btn btn-primary" type="submit">${msg("doSubmit")}</button>
                <button class="btn btn-secondary" type="submit" name="cancel-aia" value="true" style="width:100%;margin-top:10px;">${msg("doCancel")}</button>
            <#else>
                <button class="btn btn-primary" type="submit">${msg("doSubmit")}</button>
            </#if>
        </form>
    </#if>
</@layout.registrationLayout>
