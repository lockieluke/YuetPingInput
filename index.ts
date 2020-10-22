import {
    BrowserWindow,
    BrowserView,
    app,
    ipcMain,
    session,
    Menu,
    MenuItem,
    clipboard,
    globalShortcut,
    Tray,
    nativeImage
} from 'electron'
import {ElectronBlocker} from '@cliqz/adblocker-electron'
import * as path from "path";
import fetch from 'cross-fetch';
import * as fs from 'fs';

function createWindow(): void {
    let isShown: boolean = true;
    let loaded: boolean = false;
    let webview: BrowserView = null;
    let win: BrowserWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: false
        },
        width: 460,
        height: 375,
        title: "YuetPingInput",
        center: true,
        resizable: false,
        maximizable: false,
        icon: path.join(__dirname, '../static/hkflag.png')
    });

    win.setMenu(null);

    win.loadFile(path.join(__dirname, "../window/index.html"))

    const tray: Tray = new Tray(nativeImage.createFromPath(path.join(__dirname, '../static/hkflag.png')));
    const ctxMenu = Menu.buildFromTemplate([
        { label: "Toggle Visibility", click: function () {
            toggleVisibility();
            } }
    ])
    tray.setTitle("YuetPingInput");
    tray.setToolTip("YuetPingInput")
    tray.setContextMenu(ctxMenu);

    win.on('close', function () {
        win.destroy();
        win = null;
    })

    ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
        blocker.enableBlockingInSession(session.defaultSession);
    });

    win.setMenuBarVisibility(false);

    ipcMain.on('ctxmenu', function () {
        const menu: Menu = new Menu();
        menu.append(new MenuItem({
            label: "Reload",
            click: function () {
                initWebView();
            },
            accelerator: 'CommandOrControl+R'
        }))
        menu.append(new MenuItem({
            label: "Open DevTools",
            accelerator: "CommandOrControl+Shift+I",
            click: function () {
                webview.webContents.openDevTools({
                    mode: 'detach'
                })
            }
        }))
        menu.popup({
            window: win
        })
    })

    ipcMain.on('init-webview', function () {
        initWebView();
    })

    ipcMain.on('copyt', function (event, args: string[]) {
        clipboard.writeText(args[0], 'clipboard');
        toggleVisibility();
    })

    ipcMain.on('console', function (event, args: string[]) {
        for (let i = 0; i < args.length; i++) {
            console.log(args[i]);
        }
    })

    globalShortcut.register('CommandOrControl+Alt+Y', function () {
        console.log("Detected Global Shortcut Key");
        toggleVisibility();
    })

    function toggleVisibility() {
        if (isShown) {
            win.setOpacity(0);
            win.setSkipTaskbar(true);
            isShown = false
        } else {
            win.setOpacity(1);
            win.setSkipTaskbar(false)
            isShown = true;
            if (loaded) {
                win.webContents.send('focus');
            }
        }
    }

    function initWebView() {
        loaded = false
        if (webview != null) {
            win.removeBrowserView(webview);
            webview.destroy();
        }
        webview = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                preload: path.join(__dirname, "../window/preload.js")
            }
        });

        webview.webContents.loadURL('https://www.cantoneseinput.com/');

        win.setBrowserView(webview);
        webview.setBounds({
            height: 0,
            width: 0,
            x: 0,
            y: 0
        })

        webview.webContents.once('did-finish-load', function () {
            console.log("WebView Loaded");
            resizeWebView();
            win.on('resize', function () {
                resizeWebView();
                console.log("Resizing to " + win.getBounds().width + " , " + win.getBounds().height);
            })
            webview.webContents.send('load-finished')
            webview.webContents.insertCSS(fs.readFileSync(path.join(__dirname, '../window/styles/injection.css'), {
                encoding: 'utf8'
            }), {
                cssOrigin: 'user'
            })
            loaded = true
        })

        webview.webContents.on('will-navigate', function (e) {
            if (loaded) {
                e.preventDefault();
            }
        })

        webview.webContents.on('will-redirect', function (e) {
            if (loaded) {
                e.preventDefault();
            }
        })

        function resizeWebView(): void {
            webview.setBounds({
                height: win.getBounds().height,
                width: win.getBounds().width,
                x: 0,
                y: 0
            });
        }
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function (): void {
    if (process.platform !== 'darwin')
        app.quit()
})