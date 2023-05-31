console.log('index.js');
let intervalID;

//handler after rendering
async function handler() {
  //get tiles
  const tiles = document.getElementsByClassName('sapUshellTile');
  // console.log(tiles);

  //if tiles rendered do
  if (tiles.length > 0) {
    
    try{
      removeUnauthTiles(tiles);
      removeEmptyGroups();
      aTagOpenSelfConfiguration(tiles);
      logoutConfiguration()
    }catch(err){
      return;
    }
      
    //removes the hider
    document.getElementById('hider').style.display = 'none';
    //stops the interval
    clearInterval(intervalID);
  }
}

//Start the inteval, run the handler until stopped
function onRender() {
  intervalID = setInterval(handler, 500);
}

//sap init
sap.ui.getCore().attachInit(() => {
  //create render async
  sap.ushell.Container.createRenderer(true).then((render) => {
    //override after render
    render.onAfterRendering = (e) => {
      //call render after rendering the launchpad
      onRender();
    };
    //render the launchpad at #content
    render.placeAt('content');
  });
});

async function getUserApps() {
  //console.log('getting userInfo');
  try {
    const userInfo = await $.get('/service/users/userInfo()');
    
    return userInfo.attr.apps;
  } catch (error) {
    console.log(error)
    return undefined;
  }
}


async function removeUnauthTiles(tiles){
  const apps = await getUserApps();
  if(apps === undefined) throw new Error("Error: could not get user apps");
  // console.log(apps);
  
  let removeList = [];
  //filter unauthorized apps to remove the tiles
  for (let i = 0; i < tiles.length; i++) {
    //get app href
    let href = tiles[i].firstChild.firstChild.firstChild.href;
    if (href === undefined) return; //tile didn't load properly, restart

    let authorized = false; //flag
    //search if app name is in app href
    for (let j = 0; j < apps.length; j++) {
      if (href.includes(apps[j])) {
        authorized = true;
      }
    }
    //if app is not authorized, add tile to the remove list
    if (!authorized) {
      removeList.push(tiles[i]);
    }
  }
  //remove unauthorized tiles
  for (let i = 0; i < removeList.length; i++) {
    removeList[i].remove();
  }
}

function removeEmptyGroups(){
  //get groups
  let groups = document.getElementsByClassName('sapUshellDashboardGroupsContainerItem');
  //remove empty groups
  for (let i = 0; i < groups.length; i++) {
    //get ul and check if it has children, children = tiles
    let hasChildNodes = groups[i].firstChild.firstChild.childNodes[1].hasChildNodes();
    //remove groups without tiles
    if (!hasChildNodes) {
      groups[i].remove();
    }
  }
}

//configs the tiles to open in the current tab
function aTagOpenSelfConfiguration(tiles){
  function openLinkInSameTab(href) {
    const win = window.open(href, '_self');
    win.focus();
  }

  //configures each tile
  for(let i = 0; i < tiles.length; i++){
    const aTag = tiles[i].firstChild.firstChild.firstChild;
    const href = aTag.getAttribute("href");
    aTag.addEventListener("click", (e) => openLinkInSameTab(href))
  }
}

//configs the log out button
function logoutConfiguration(){
  const userActionsBtn = document.getElementById("userActionsMenuHeaderButton");
  userActionsBtn.addEventListener("click", userActionsBtnHandler)

  //add eventlistener to logout button
  function userActionsBtnHandler(e){
    setTimeout(() => {
      const logoutBtn = document.getElementById("__list0-4-logoutBtn-content");
      logoutBtn.addEventListener("click", logoutBtnHandler)

    },100)
  }
  //add eventlistener to confirm logout button
  function logoutBtnHandler(e){
    setTimeout( () => {
      const confirmBtn = document.getElementById("__mbox-btn-0");
      confirmBtn.addEventListener("click", onLogout);
    }, 100)
  }
}

//log out
async function onLogout(){
  try {
    await $.post({
      url: '/logout',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({ clearCookies: true }),
    });
    const win = window.open("../", '_self');
    win.focus();
  } catch (err) {
    const errorMessage =
      err.responseJSON.message && typeof err.responseJSON.message === 'string'
        ? err.responseJSON.message
        : 'Something went wrong';
    alert(errorMessage)
  }
}