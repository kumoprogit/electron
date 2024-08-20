const { exec } = require('child_process');
const { ipcRenderer } = require('electron');

const regex = /^.*((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9]).*$/;
//const regex = "/^.*(\d+)\.(\d+)\.(\d+)\.(\d+).*$/";
/** @type {searchcondition} */
var data = {
    num: 0,
    group: [],
    ipaddr: [],
    macaddr: [],        
};

function getStartPos(t) {
    var f = t.indexOf('.');
    var g = t.substr(f-3, 3);
    if (g.substr(0,1) == ' ') {
        return f-2;
    }
    return f-3;
}
function getLastPos(t) {
    var f = t.lastIndexOf('.');
    var g = t.substr(f+1, 3);
    var h = g.indexOf(' ');
    if( h > 0 ) {
        return f+3-h;
    }
    return f+3;
}

function analysis(str) {
    let i = 0;
    str.forEach((t) => {
        if (t.match(regex)) {
            var l = t.indexOf('---');
            if (l > 0) {
                if (i == 0) {
                } else {
                }
                i++;
                var p = getStartPos(t);
                data.group.push(t.substr(p,l-p-1));
            } else {
                var tmp = t.split(' ');
                tmp.forEach((s) => {
                    if (s.indexOf('.') > 0) {
                        data.ipaddr.push(s);
                    }
                    if (s.indexOf('-') > 0) {
                        data.macaddr.push(s);
                    }

                })
            }

        }
    });
    data.num = data.ipaddr.length;
    return data;
}
function cast(flag) {
    if (flag) {
        exec('arp -a', (err, stdout, stderr) => {
            if (err) {
              console.log(`stderr: ${stderr}`)
              return
            }
            var param = analysis(stdout.split('\r\n'));
            console.log(param);
            ipcRenderer.send('show', param);
          }
        );    
    }
}