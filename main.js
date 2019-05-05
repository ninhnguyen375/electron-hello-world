const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;
const isMac = process.platform == 'darwin';
const isProduction = process.env.NODE_ENV == 'production';

app.on('ready', () => {
  // Create new window
  mainWindow = new BrowserWindow({});
  // Load html to window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'mainWindow.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // Quit app when closed
  mainWindow.on('close', () => {
    app.quit();
  });

  // Catch item:add
  ipcMain.on('item:add', (e, item) => {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item'
  });
  // Load html to window
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'addWindow.html'),
      protocol: 'file:',
      slashes: true
    })
  );
  // Grabage collection handle
  addWindow.on('close', () => {
    addWindow = null;
  });
}

// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Item',
        click() {
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: isMac ? 'Command + Q' : 'Ctrl + Q',
        click() {
          app.quit();
        }
      }
    ]
  }
];

// If mac, add emplty object to menu
if (isMac) {
  mainMenuTemplate.unshift({});
}

if (!isProduction) {
  mainMenuTemplate.push({
    label: 'Devloper Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: isMac ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}
