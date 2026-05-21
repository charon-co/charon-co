const DB1=
"https://raw.githubusercontent.com/BlissBlender/Charon-Database/main/database-1/";

const DB2=
"https://raw.githubusercontent.com/BlissBlender/Charon-Database/main/database-2/";

const API=
"https://gamegen.lol/api/mg_cca51ec305a5494a946454fcc21cf1c3/generate/";

const input=
document.getElementById("appid");

const button=
document.getElementById("generateBtn");

const status=
document.getElementById("status");

const card=
document.getElementById("gameCard");

const img=
document.getElementById("gameImage");

const title=
document.getElementById("gameName");

const info=
document.getElementById("gameInfo");

const download=
document.getElementById("downloadBtn");

let downloadUrl=null;

button.onclick=generate;

async function exists(url){

try{

const r=
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

const r=
await fetch(
`https://store.steampowered.com/api/appdetails?appids=${appid}`
);

const data=
await r.json();

if(!data[appid]?.success){

status.innerText=
"Game not found";

return false;

}

const game=
data[appid].data;

card.style.display=
"flex";

img.src=
game.header_image;

title.innerText=
game.name;

info.innerText=

`${game.publishers?.[0]||""}
 •
${game.release_date?.date||""}`;

return true;

}

async function zipLua(url,name){

const lua=
await fetch(url)
.then(
r=>r.text()
);

const zip=
new JSZip();

zip.file(
`${name}.lua`,
lua
);

const blob=
await zip.generateAsync({
type:"blob"
});

return URL.createObjectURL(
blob
);

}

async function db(base,appid){

const lua=
base+
appid+
".lua";

if(
await exists(lua)
){

downloadUrl=
await zipLua(
lua,
appid
);

return true;

}

const zip=
base+
appid+
".zip";

if(
await exists(zip)
){

downloadUrl=
zip;

return true;

}

try{

const index=
await fetch(
base+
"index.json"
)
.then(
r=>r.json()
);

const entry=
index[appid];

if(!entry)
return false;

if(entry.zip){

downloadUrl=
base+
entry.zip;

return true;

}

if(entry.lua){

downloadUrl=
await zipLua(
base+
entry.lua,
appid
);

return true;

}

}catch{}

return false;

}

async function external(appid){

try{

const r=
await fetch(
API+
appid
);

const data=
await r.json();

downloadUrl=
data
.manifest
.downloadUrl;

return true;

}catch{

return false;

}

}

async function generate(){

download.style.display=
"none";

downloadUrl=
null;

const appid=
input.value.trim();

if(!appid)
return;

status.innerText=
"Loading game...";

await fetchGame(
appid
);

status.innerText=
"Searching...";

if(
await db(
DB1,
appid
)
){

show();

return;

}

if(
await db(
DB2,
appid
)
){

show();

return;

}

if(
await external(
appid
)
){

show();

return;

}

status.innerText=
"Nothing found";

}

function show(){

status.innerText=
"ZIP Ready";

download.style.display=
"block";

download.onclick=
()=>{

window.open(
downloadUrl
);

};

}