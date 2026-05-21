const DB1 =
"https://raw.githubusercontent.com/BlissBlender/Charon-Database/main/database-1/";

const DB2 =
"https://raw.githubusercontent.com/BlissBlender/Charon-Database/main/database-2/";

const API =
"https://gamegen.lol/api/mg_cca51ec305a5494a946454fcc21cf1c3/generate/";

const input =
document.getElementById("appid");

const status =
document.getElementById("status");

const button =
document.getElementById("generateBtn");

const card =
document.getElementById("gameCard");

const image =
document.getElementById("gameImage");

const title =
document.getElementById("gameName");

const info =
document.getElementById("gameInfo");

const download =
document.getElementById("downloadBtn");

let downloadURL = null;

button.onclick =
generate;


async function loadGame(appid){

try{

const url =
"https://corsproxy.io/?"+
encodeURIComponent(
`https://store.steampowered.com/api/appdetails?appids=${appid}`
);

const r =
await fetch(url);

if(!r.ok)
return;

const data =
await r.json();

if(
!data?.[appid]?.success
)
return;

const game =
data[appid].data;

card.style.display =
"block";

image.src =
game.header_image;

title.textContent =
game.name;

info.textContent =

`${game.publishers?.[0]||""}
 •
${game.release_date?.date||""}`;

}catch(e){

console.log(e);

}

}


async function fileExists(url){

try{

const r =
await fetch(url);

return r.ok;

}catch{

return false;

}

}


async function zipLua(
url,
appid
){

const txt =
await fetch(url)
.then(
r=>r.text()
);

const zip =
new JSZip();

zip.file(
`${appid}.lua`,
txt
);

const blob =
await zip.generateAsync({
type:"blob"
});

return URL.createObjectURL(
blob
);

}


async function searchDB(
base,
appid
){

const lua =
`${base}${appid}.lua`;

if(
await fileExists(lua)
){

downloadURL =
await zipLua(
lua,
appid
);

return true;

}

const zip =
`${base}${appid}.zip`;

if(
await fileExists(zip)
){

downloadURL =
zip;

return true;

}

try{

const index =
await fetch(
base+
"index.json"
)
.then(
r=>r.json()
);

const mapped =
index[appid];

if(
!mapped
)
return false;

downloadURL =
base+
mapped;

return true;

}catch{

return false;

}

}


async function searchAPI(appid){

try{

const r =
await fetch(
API+
appid
);

const data =
await r.json();

downloadURL =
data
?.manifest
?.downloadUrl;

return !!downloadURL;

}catch{

return false;

}

}


function showDownload(){

download.style.display =
"inline-block";

download.onclick =
()=>{

window.open(
downloadURL,
"_blank"
);

};

}


async function generate(){

download.style.display =
"none";

card.style.display =
"none";

downloadURL =
null;

const appid =
input.value.trim();

if(!appid){

status.textContent =
"Enter App ID";

return;

}

status.textContent =
"Loading game...";

loadGame(appid);

status.textContent =
"Searching Database 1";

if(
await searchDB(
DB1,
appid
)
){

status.textContent =
"ZIP Ready";

showDownload();

return;

}

status.textContent =
"Searching Database 2";

if(
await searchDB(
DB2,
appid
)
){

status.textContent =
"ZIP Ready";

showDownload();

return;

}

status.textContent =
"Using External API";

if(
await searchAPI(
appid
)
){

status.textContent =
"ZIP Ready";

showDownload();

return;

}

status.textContent =
"Nothing Found";

}