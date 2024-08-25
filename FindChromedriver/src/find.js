const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('node:path');
const glob = require('glob');
const { execSync } = require('child_process');
const { exec } = require('child_process');


const workerpool = require("workerpool");
const pool = workerpool.pool(__dirname + '/find.js', { workerType: 'process' });

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

var driver_path = "";
const INIFILE = __dirname + "/../FindChromedriver.json";

var last_ver0 = 0;
var last_ver1 = 0;
var last_ver2 = 0;
var last_ver3 = 0;

var list;
var data = {
    step: 0,
    buffer: []
};

const START_COMM = "chromedriver 検索中";
const END1_COMM = "chromedriver finded.";
const END2_COMM = "chromedriver not finded.";

function ver_comp(arg){
    var ipa = arg.split('.');
    if (ipa.length < 4) return false; 
    let ver0 = Number(ipa[0]);
    let ver1 = Number(ipa[1]);
    let ver2 = Number(ipa[2]);
    let ver3 = Number(ipa[3]);
    if (ver0 < last_ver0) {
        return false;
    }
    if (ver0 == last_ver0) {
        if (ver1 < last_ver1) {
            return false;
        }
        if (ver1 == last_ver1) {
            if (ver2 < last_ver2) {
                return false;
            }
            if (ver3 <= last_ver3) {
                return false;
            }
        }
    }
    last_ver0 = ver0;
    last_ver1 = ver1;
    last_ver2 = ver2;
    last_ver3 = ver3;
 //   console.log(arg);
    return true;
}
function ver_check(item) {
    const stdout = execSync(`"${item}" --version`);
    var param = stdout.toString().split(' ');
    if (ver_comp(param[1]) == true) {
        return true;
    }
    return false;
}

function exec_driver(param) {
    exec(`"${param}" --allowed-ips`, (err, stdout, stderr) => {
        if (err) {
          console.log(`stderr: ${stderr}`)
          return
        }
        console.log(`stdout: ${stdout}`)
      }
    )    
}

function get_file(ws) {
    return glob.sync(`${ws}/**/chromedriver*.exe`);
}

function find_file(ws) {
    var flist = get_file(ws);
    flist.forEach((item)=>{
        if (item != "") {
            var fname = item;
            if (ver_check(item) == true) {
                workerpool.workerEmit(fname);
                //window.show(data);
            }
        }
    })
    return;
}


workerpool.worker({
    find_file: find_file,
});


function find_step(){
    var textarea = document.getElementById('comm');
    textarea.value = START_COMM;
    var ini = JSON.parse(fs.readFileSync(INIFILE, 'utf8'));
    var ws = path.resolve(ini.driver_path);
    textarea.value = textarea.value+"\r\n"+ws;
    var buffer = "";
    pool
    .exec('find_file', [ws], {
        on: (message) => {
            buffer = message;
            textarea.value = textarea.value+"\r\n"+message;
        }
    })
    .then(function (result) {
        if(buffer.length > 0) {
            textarea.value = textarea.value+"\r\n"+END1_COMM;
        } else {
            textarea.value = textarea.value+"\r\n"+END2_COMM;

        }
    })
    .catch(function(err) {
        console.log(err);
    })
    .then(function() {
        pool.terminate()
        if (buffer!="") {
            console.log(buffer);
            exec_driver(buffer);
        }
    });
}
