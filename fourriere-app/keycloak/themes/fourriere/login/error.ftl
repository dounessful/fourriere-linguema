<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <h1 class="auth-title">Une erreur est survenue</h1>
    <#elseif section = "form">
        <div class="alert alert-error" style="margin-bottom:24px;">
            <svg class="alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>${kcSanitize(message.summary)?no_esc}</span>
        </div>

        <#if client?? && client.baseUrl?has_content>
            <a href="${client.baseUrl}" class="btn btn-primary">Retour à l'application</a>
        <#else>
            <a href="https://www.fourriere.sn" class="btn btn-primary">Retour à l'accueil</a>
        </#if>
    </#if>
</@layout.registrationLayout>
