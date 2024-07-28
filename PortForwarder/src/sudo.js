const sudo = require('sudo-js');
const { exec } = require('child_process')
const { ipcRenderer } = require('electron');
const str = require('sprintf-js');
const { setDefaultAutoSelectFamily } = require('net');

const user = "yoshi_pihbcse"
const command = ['netsh interface portproxy', 'v4tov4'];
const command2 = ['show', 'add', 'delete'];

//const btn = document.getElementById('btn');
//btn.addEventListener('click', () => { ShowPortForwarder() });
function ShowPortForwarder() {
// runas /savecred /user:%username% "cmd /c mkdir C:\temp"
  var com = str.sprintf( "com /c 'netsh interface portproxy %s v4tov4'", command2[0]);
//  sudo.setPassword("noBana00");
//  sudo.exec(com, function(err, pid, result) {
  console.log(com);
  exec(com, (err, stdout, stderr) => {
    console.log(stdout);
    ipcRenderer.send('show', stdout);
  });
}

//localhost:8081を192.168.0.10:8080に転送するコマンド。
//netsh interface portproxy add v4tov4 listenaddress=localhost listenport=8081 connectaddress=192.168.0.10 connectport=8080
function set_portforward(ipaddr, lport, cport) {
  var com = str.sprintf( "com /c 'netsh interface portproxy %s v4tov4 %s %d %s %d'", command2[1], '127.0.0.1', lport, ipaddr, cport);
//  sudo.setPassword("noBana00");
//  sudo.exec(com, function(err, pid, result) {
  console.log(com);
  exec(com, (err, stdout, stderr) => {
    console.log(stdout);
    ipcRenderer.send('add', stdout);
  });
}

//export { set_portforward }