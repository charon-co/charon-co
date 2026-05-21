const DB1 =
"https://raw.githubusercontent.com/BlissBlender/Charon-Database/main/database-1/";

const DB2 =
"https://raw.githubusercontent.com/BlissBlender/Charon-Database/main/database-2/";

const GAMEGEN_API =
"https://gamegen.lol/api/mg_cca51ec305a5494a946454fcc21cf1c3/generate/";

const input =
document.getElementById("appid");

const generateBtn =
document.getElementById("generateBtn");

const status =
document.getElementById("status");

const gameCard =
document.getElementById("gameCard");

const gameImage =
document.getElementById("gameImage");

const gameName =
document.getElementById("gameName");

const gameInfo =
document.getElementById("gameInfo");

const downloadBtn =
document.getElementById("downloadBtn");

let downloadUrl = null;


/* --------------------------- */

generateBtn.onclick =
generate;


/* --------------------------- */

function resetUI(){

downloadBtn.style.display =
"none";

gameCard.style.display =
"none";

downloadUrl =
null;

}


/* --------------------------- */

async function exists(url){

try{

const r =
await fetch(
url
);

return r.ok;

}catch{

return false;

}

}


/* --------------------------- */
/* STEAM DETAILS (CORS FIXED) */

async function loadGame(appid){

try{

const url =

`https://corsproxy.io/?${encodeURIComponent(
`https://store.steampowered.com/api/appdetails?appids=${appid}`
)}`;

const r =
await fetch(url);

if(!r.ok)
return;

const json =
await r.json();

if(
!json?.[appid]?.success
)
return;

const game =
json[appid].data;

gameCard.style.display =
"block";

gameImage.src =
game.header_image;

gameName.textContent =
game.name;

gameInfo.textContent =

`${game.publishers?.[0] || "Unknown"}
 •
${game.release_date?.date || ""}`;

}catch(e){

console.log(
"Steam fetch failed",
e
);

}

}


/* --------------------------- */
/* LUA -> ZIP */

async function createZip(
luaUrl,
appid
){

const txt =
await fetch(luaUrl)
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


/* --------------------------- */
/* DATABASE */

async function searchDatabase(
base,
appid
){

const lua =
`${base}${appid}.lua`;

if(
await exists(lua)
){

downloadUrl =
await createZip(
lua,
appid
);

return true;

}


const zip =
`${base}${appid}.zip`;

if(
await exists(zip)
){

downloadUrl =
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

const entry =
index[appid];

if(
!entry
)
return false;


/* random zip */

if(
entry.zip
){

downloadUrl =
base+
entry.zip;

return true;

}


/* mapped lua */

if(
entry.lua
){

downloadUrl =
await createZip(
base+
entry.lua,
appid
);

return true;

}

}catch(e){

console.log(e);

}

return false;

}


/* --------------------------- */
/* EXTERNAL */

async function searchExternal(
appid
){

try{

const r =
await fetch(
GAMEGEN_API+
appid
);

const data =
await r.json();

const url =
data
?.manifest
?.downloadUrl;

if(!url)
return false;

downloadUrl =
url;

return true;

}catch{

return false;

}

}


/* --------------------------- */
/* SHOW DOWNLOAD */

function revealDownload(){

downloadBtn.style.display =
"inline-flex";

downloadBtn.onclick =
()=>{

window.open(
downloadUrl,
"_blank"
);

};

}


/* --------------------------- */
/* MAIN */

async function generate(){

const appid =
input.value
.trim();

if(
!appid
){

status.textContent =
"Enter App ID";

return;

}

resetUI();


/* load steam in background */

status.textContent =
"Loading game...";

loadGame(
appid
);


/* DB1 */

status.textContent =
"Searching Database 1...";

if(
await searchDatabase(
DB1,
appid
)
){

status.textContent =
"ZIP Ready";

revealDownload();

return;

}


/* DB2 */

status.textContent =
"Searching Database 2...";

if(
await searchDatabase(
DB2,
appid
)
){

status.textContent =
"ZIP Ready";

revealDownload();

return;

}


/* API */

status.textContent =
"Using External API...";

if(
await searchExternal(
appid
)
){

status.textContent =
"ZIP Ready";

revealDownload();

return;

}


/* fail */

status.textContent =
"Nothing Found";

}