const DB1 =
"https://raw.githubusercontent.com/BlissBlender/Charon-Database/main/database-1/";

const DB2 =
"https://raw.githubusercontent.com/BlissBlender/Charon-Database/main/database-2/";

const GAMEGEN_API =
"https://gamegen.lol/api/mg_cca51ec305a5494a946454fcc21cf1c3/generate/";

const input =
document.getElementById("appid");

const searchBtn =
document.getElementById("generateBtn");

const status =
document.getElementById("status");

const card =
document.getElementById("gameCard");

const image =
document.getElementById("gameImage");

const nameBox =
document.getElementById("gameName");

const infoBox =
document.getElementById("gameInfo");

const downloadBtn =
document.getElementById("downloadBtn");

let finalDownload = null;

searchBtn.addEventListener(
"click",
generate
);

async function exists(url){

try{

const r =
await fetch(
url,
{
method:"HEAD"
}
);

return r.ok;

}

catch{

return false;

}

}

async function fetchGame(appid){

try{

const r =
await fetch(
`https://store.steampowered.com/api/appdetails?appids=${appid}`
);

const data =
await r.json();

if(
!data?.[appid]?.success
){

return false;

}

const game =
data[appid].data;

card.style.display =
"flex";

image.src =
game.header_image;

nameBox.innerText =
game.name;

infoBox.innerText =
`${game.publishers?.[0] || "Unknown Publisher"}
 •
${game.release_date?.date || ""}`;

return true;

}catch(e){

console.log(e);

return false;

}

}

async function convertLuaToZip(luaUrl, appid){

const content =
await fetch(luaUrl)
.then(
r=>r.text()
);

const zip =
new JSZip();

zip.file(
`${appid}.lua`,
content
);

const blob =
await zip.generateAsync({
type:"blob"
});

return URL.createObjectURL(
blob
);

}

async function searchDatabase(base, appid){

const lua =
base +
appid +
".lua";

if(
await exists(lua)
){

finalDownload =
await convertLuaToZip(
lua,
appid
);

return true;

}

const zip =
base +
appid +
".zip";

if(
await exists(zip)
){

finalDownload =
zip;

return true;

}

try{

const index =
await fetch(
base +
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

if(
entry.zip
){

finalDownload =
base +
entry.zip;

return true;

}

if(
entry.lua
){

finalDownload =
await convertLuaToZip(
base +
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

async function searchAPI(appid){

try{

const r =
await fetch(
GAMEGEN_API +
appid
);

const data =
await r.json();

const url =
data
?.manifest
?.downloadUrl;

if(
!url
)
return false;

finalDownload =
url;

return true;

}catch{

return false;

}

}

function showDownload(){

downloadBtn.style.display =
"inline-flex";

downloadBtn.onclick =
()=>{

window.location.href =
finalDownload;

};

}

async function generate(){

downloadBtn.style.display =
"none";

card.style.display =
"none";

finalDownload =
null;

const appid =
input.value
.trim();

if(
!appid
){

status.innerText =
"Enter App ID";

return;

}

status.innerText =
"Loading game...";

await fetchGame(
appid
);

status.innerText =
"Searching Database 1...";

if(
await searchDatabase(
DB1,
appid
)
){

status.innerText =
"ZIP Ready";

showDownload();

return;

}

status.innerText =
"Searching Database 2...";

if(
await searchDatabase(
DB2,
appid
)
){

status.innerText =
"ZIP Ready";

showDownload();

return;

}

status.innerText =
"Using External API...";

if(
await searchAPI(
appid
)
){

status.innerText =
"Ready";

showDownload();

return;

}

status.innerText =
"Nothing Found";

}