const { dialog } = require('electron');

function select_dialog(){
    dialog.showOpenDialogSync(mainWindow, { properties: ['Select IP address', 'multiSelections'] })
}