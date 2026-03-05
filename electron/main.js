// electron/main.js
// Point d'entrée principal d'Electron
// Lance le backend Spring Boot + affiche le frontend Angular dans une fenêtre native

const { app, BrowserWindow, shell, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let mainWindow;
let backendProcess;

// ─────────────────────────────────────────────
// 1. DÉMARRAGE DU BACKEND SPRING BOOT
// ─────────────────────────────────────────────

function startBackend() {
  console.log('[Electron] Démarrage du backend Spring Boot...');

  // Chemin vers le JAR compilé (mvn package génère target/RDF_Back-*.jar)
  const jarPath = path.join(__dirname, '..', 'RDF_Back', 'target', 'RDF_Back-0.0.1-SNAPSHOT.jar');

  backendProcess = spawn('java', ['-jar', jarPath], {
    cwd: path.join(__dirname, '..', 'RDF_Back'),
    stdio: 'pipe'
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend ERROR] ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`[Backend] Processus terminé avec le code : ${code}`);
  });
}

// ─────────────────────────────────────────────
// 2. ATTENDRE QUE LE BACKEND SOIT PRÊT
// ─────────────────────────────────────────────

function waitForBackend(url, maxRetries = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      http.get(url, (res) => {
        console.log(`[Electron] Backend prêt (HTTP ${res.statusCode})`);
        resolve();
      }).on('error', () => {
        attempts++;
        if (attempts >= maxRetries) {
          reject(new Error(`Le backend n'a pas démarré après ${maxRetries} tentatives`));
        } else {
          setTimeout(check, interval);
        }
      });
    };

    check();
  });
}

// ─────────────────────────────────────────────
// 3. CRÉATION DE LA FENÊTRE PRINCIPALE
// ─────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Gestionnaire RDF',
    icon: path.join(__dirname, 'assets', 'icon.png'),  // Optionnel
    webPreferences: {
      nodeIntegration: false,          // Sécurité : désactivé
      contextIsolation: true,          // Sécurité : activé
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  // En production : charger le build Angular depuis dist/
  // En développement : charger depuis le serveur Angular (ng serve)
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  } else {
    // Build Angular : ng build --output-path electron/dist/frontend
    mainWindow.loadFile(path.join(__dirname, 'dist', 'frontend', 'browser', 'index.html'));
  }

  // Ouvrir les liens externes dans le navigateur système
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─────────────────────────────────────────────
// 4. CYCLE DE VIE D'ELECTRON
// ─────────────────────────────────────────────

app.whenReady().then(async () => {
  try {
    // Démarrer le backend
    startBackend();

    // Attendre que Spring Boot soit accessible sur /api/datasources
    console.log('[Electron] Attente du démarrage du backend...');
    await waitForBackend('http://localhost:8080/api/datasources');

    // Créer la fenêtre principale
    createWindow();

  } catch (err) {
    console.error('[Electron] Erreur de démarrage :', err.message);
    // Créer quand même la fenêtre (affichera une erreur de connexion)
    createWindow();
  }
});

// Quitter quand toutes les fenêtres sont fermées (sauf macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Tuer le backend quand l'app se ferme
app.on('before-quit', () => {
  if (backendProcess) {
    console.log('[Electron] Arrêt du backend...');
    backendProcess.kill();
  }
});
