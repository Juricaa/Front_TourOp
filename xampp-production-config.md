# Guide de déploiement en production sur XAMPP

## Étapes de configuration

### 1. Copier les fichiers de build
Copier le contenu de `dist/spa/` vers `C:/xampp/htdocs/tour-op/`

### 2. Configuration Apache
Créer un fichier `.htaccess` dans le dossier de production:

```apache
# .htaccess pour React Router en production
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Configuration des headers de sécurité
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options nosniff
  Header always set X-Frame-Options DENY
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache des assets statiques
<IfModule mod_expires.c>
  ExpiresActive on
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### 3. Configuration de l'environnement
Créer un fichier `config.js` dans le dossier public:

```javascript
// config.js - Configuration de production
window.APP_CONFIG = {
  API_URL: 'http://localhost:8080/api', // Remplacez par votre backend
  ENVIRONMENT: 'production',
  DEBUG: false
};
```

### 4. Scripts de déploiement automatique
Créer un script batch `deploy.bat` dans le dossier racine:

```batch
@echo off
echo Déploiement en production sur XAMPP...

:: Build du projet
npm run build

:: Arrêt d'Apache (optionnel)
:: net stop Apache2.4

:: Copie des fichiers
xcopy /E /I /Y dist\spa\* C:\xampp\htdocs\tour-op\

:: Démarrage d'Apache (optionnel)
:: net start Apache2.4

echo Déploiement terminé!
pause
```

### 5. Configuration du backend
Assurez-vous que votre backend est accessible via:
- URL: http://localhost:8080/api (ou votre configuration)
- CORS configuré pour autoriser http://localhost

### 6. Vérification post-déploiement
1. Accéder à http://localhost/tour-op/
2. Vérifier que toutes les routes fonctionnent
3. Tester la connexion avec votre backend
4. Vérifier les performances et la console du navigateur
