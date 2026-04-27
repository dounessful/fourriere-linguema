<#macro registrationLayout displayInfo=false displayMessage=true displayRequiredFields=false showAnotherWayIfPresent=true>
<!DOCTYPE html>
<html lang="${locale.currentLanguageTag!'fr'}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link rel="icon" type="image/png" href="${url.resourcesPath}/img/logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link rel="stylesheet" href="${url.resourcesPath}/${style}">
        </#list>
    </#if>
</head>
<body>

<header class="site-header">
    <div class="header-inner">
        <a href="https://www.fourriere.sn" class="brand">
            <img src="${url.resourcesPath}/img/logo.png" alt="Linguema">
            <span>Linguema Fourrière</span>
        </a>
        <a href="https://www.fourriere.sn" class="back-link" title="Retour à l'accueil">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Retour à l'accueil</span>
        </a>
    </div>
</header>

<main class="auth-main">
    <div class="auth-card">
        <#nested "header">

        <#-- Messages flash (erreur, info, etc.) -->
        <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
            <div class="alert alert-${message.type}">
                <#if message.type = 'error'>
                    <svg class="alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                <#elseif message.type = 'success'>
                    <svg class="alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                <#else>
                    <svg class="alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                </#if>
                <span>${kcSanitize(message.summary)?no_esc}</span>
            </div>
        </#if>

        <#nested "form">

        <#if displayInfo>
            <div class="help-text">
                <#nested "info">
            </div>
        </#if>
    </div>
</main>

<footer class="site-footer">
    <span>© ${.now?string("yyyy")} Linguema Assistance Routière</span>
</footer>

</body>
</html>
</#macro>
