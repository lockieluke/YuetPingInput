const {ipcRenderer} = require('electron')
const fs = require('fs')

/**
 *
 * @type {HTMLElement}
 */

ipcRenderer.on('load-finished', function () {
    const textArea = document.getElementById('InputArea')

    window.scrollTo(95, 80);
    document.getElementById('leftmenu').style.visibility = 'hidden';
    document.getElementsByName('coreform').item(0).children.item(0).style.visibility = 'hidden';
    document.getElementById('brief').style.visibility = 'hidden';
    document.getElementById('explanation').style.visibility = 'hidden';
    document.getElementById('functbutton').style.visibility = 'hidden';
    document.getElementById('credits').style.visibility = 'hidden';
    document.getElementById('plusminus').style.visibility = 'hidden';
    document.getElementById('InputArea').style.resize = 'none';

    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'hidden';

    const copyButton = document.createElement('button');
    copyButton.innerText = "Copy and Hide";

    document.getElementById('corefunct').appendChild(copyButton);

    copyButton.addEventListener('click', function () {
        ipcRenderer.send('copyt', [textArea.value]);
    })

    document.getElementById("InputArea").focus();

    document.getElementById("InputArea").addEventListener('blur', function (e) {document.getElementById("InputArea").focus();})

    ipcRenderer.on('focus', function () {
        document.getElementById("InputArea").focus();
    })
})

document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.altKey && e.key === 'y') {
        e.preventDefault();
    } else {

    }
})

window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    ipcRenderer.send('ctxmenu');
})

/**
 *
 * @param path {string}
 * @returns {HTMLElement}
 */
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}