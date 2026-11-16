# ==============================================================================
# Dockerfile Ultra-Léger : Nginx Alpine pour Frontend Angular 17
# Casamance Écotourisme - UASZ L3 L2I (Dr Lamine FATY)
# Trinôme : Collé SYLL, Ndeye Thiamba FAYE, Mame Faty DIOP
# ==============================================================================

FROM nginx:alpine

# Copie des fichiers compilés en amont
COPY dist/frontend-angular/browser /usr/share/nginx/html

# Configuration Nginx avec gestion du routage pushState Angular et reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
