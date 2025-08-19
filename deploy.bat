@echo off
echo ========================================
echo Déploiement Tour Opérateur - Production
echo ========================================

:: Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installé ou n'est pas dans le PATH
    pause
    exit /b 1
)

:: Build du projet
echo.
echo [1/4] Build du projet...
npm run build
if errorlevel 1 (
    echo ERREUR: Le build a échoué
    pause
    exit /b 1
)

:: Vérifier si XAMPP est installé
if not exist "C:\xampp\htdocs" (
    echo ERREUR: XAMPP n'est pas installé dans C:\xampp
    pause
    exit /b 1
)

:: Créer le dossier de destination
echo.
echo [2/4] Préparation du dossier de destination...
if not exist "C:\xampp\htdocs\tour-op" mkdir "C:\xampp\htdocs\tour-op"

:: Copier les fichiers
echo [3/4] Copie des fichiers vers XAMPP...
xcopy /E /I /Y /Q "dist\spa\*" "C:\xampp\htdocs\tour-op\"

:: Créer le fichier .htaccess
echo.
echo [4/4] Configuration Apache...
echo > "C:\xampp\htdocs\tour-op\.htaccess" ^<IfModule mod_rewrite.c^>
echo RewriteEngine On
echo RewriteBase /tour-op/
echo RewriteRule ^index\.html$ - [L]
echo RewriteCond %%{REQUEST_FILENAME} !-f
echo RewriteCond %%{REQUEST_FILENAME} !-d
echo RewriteRule . /tour-op/index.html [L]
echo ^</IfModule^>

:: Message de succès
echo.
echo ========================================
echo Déploiement terminé avec succès!
echo ========================================
echo.
echo Accédez à votre application:
echo http://localhost/tour-op/
echo.
pause
