import { Problem, Action } from "./types";
import { getTimeasString } from "./helpers";

// Overriding Custom Window Object Since cannot am unable to extend the default window obj
let windowObj = <any>window;
let timeString;
// Setting Popup dynamically
console.log(chrome.extension.getViews({type:"popup"}));

chrome.tabs.onActivated.addListener(function (activeInfo) {
  let urlRegex: RegExp = new RegExp("https://leetcode.com/problems/*");
  const activeTabId = activeInfo.tabId;

  chrome.tabs.get(activeTabId, function (tab) {
    const currentUrl = tab.url;
    if (urlRegex.test(currentUrl)) {
      chrome.browserAction.setPopup({ popup: "popup.html" });
    } else {
      chrome.browserAction.setPopup({ popup: "invalid.html" });
    }
  });
});

// Persisting Data Stuffst

const problem: Problem = {};
chrome.runtime.onMessage.addListener(function (
  request: Action,
  sender,
  sendResponse
) {
  if (request) {
    if (request.action == "setProblem") {
      problem.problemName = request.payload.problemName;
      problem.difficulty = request.payload.difficulty;
    } else if (request.action == "getProblem") {
      sendResponse(problem);
    } else if (request.action == "setTimer") {
      startStop();
    }
  }
});

// Updating Timer Stuffs

let startstop = 0;
let x;
/* Toggle StartStop */
function startStop() {
  startstop = startstop + 1;
  let document = chrome.extension.getViews({ type: "popup" })[0].document;

  if (startstop == 1) {
    startTimer();
    document.getElementById("start").innerHTML = "Pause";
  } else if (startstop == 2) {
    document.getElementById("start").innerHTML = "Start";
    startstop = 0;
    stopTimer();
  }
}

// Creating my Custom Window object since Typescript doesnt allow much flexiblity
windowObj.startStop = startStop;
windowObj.resetFunc = reset;
windowObj.saveData = saveData;

//Starts the Timer

function startTimer() {
  x = setInterval(timer, 10);
}

// Stops the timer
function stopTimer() {
  clearInterval(x);
}

// Declaring Variables
let milisec = 0;
let sec = 0; /* holds incrementing value */
let min = 0;
let hour = 0;
let miliSecOut = 0;
let secOut = 0;
let minOut = 0;
let hourOut = 0;
// Driver for Timer
function timer() {
  let popup = chrome.extension.getViews({ type: "popup" })[0];
  let document = popup && popup.document;
  miliSecOut = checkTime(milisec);
  secOut = checkTime(sec);
  minOut = checkTime(min);
  hourOut = checkTime(hour);

  milisec = ++milisec;

  if (milisec === 100) {
    milisec = 0;
    sec = ++sec;
  }

  if (sec == 60) {
    min = ++min;
    sec = 0;
  }

  if (min == 60) {
    min = 0;
    hour = ++hour;
  }

  // Updates DOM

  /*
  When the Popup is closed background does'nt have reference to the Popup's
  document object  we no need to render when the popup is not opened


  */

  if (document) {
    document.getElementById("milisec").innerHTML = miliSecOut.toString();
    document.getElementById("sec").innerHTML = secOut.toString();
    document.getElementById("min").innerHTML = minOut.toString();
    document.getElementById("hour").innerHTML = hourOut.toString();
  }

  // Update the badge Text
  timeString = getTimeasString(secOut, minOut, hourOut);

  chrome.browserAction.setBadgeText({ text: timeString });
}

// Checks time to add 0 or not
function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

// Resets the timer
function reset() {
  console.log("hey");
  stopTimer();
  chrome.browserAction.setBadgeText({ text: "" });

  let document = chrome.extension.getViews({ type: "popup" })[0].document;
  /*Reset*/
  startstop = 0;
  document.getElementById("start").innerHTML = "Start";

  milisec = 0;
  sec = 0;
  min = 0;
  hour = 0;

  document.getElementById("milisec").innerHTML = "00";
  document.getElementById("sec").innerHTML = "00";
  document.getElementById("min").innerHTML = "00";
  document.getElementById("hour").innerHTML = "00";
}

function setData() {
  console.log("hi");

  let data = JSON.parse(localStorage.getItem("leetCodeExtensionDetails"));
  let today = new Date();
  //@ts-ignore
  let dd = String(today.getDate()).padStart(2, "0");
  //@ts-ignore
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();

  const todayString = dd + "/" + mm + "/" + yyyy;

  const dataMap = {
    problemName: problem.problemName,
    difficulty: problem.difficulty,
    timeTaken: timeString,
    date: todayString,
  };
  data[problem.difficulty.toLowerCase()].push(dataMap);
  let dataToSet = JSON.stringify(data);

  localStorage.setItem("leetCodeExtensionDetails", dataToSet);
  console.log(localStorage.getItem("leetCodeExtensionDetails"));
}

function saveData() {
  if (!localStorage.getItem("leetCodeExtensionDetails")) {
    setInitialData();
    setData();
  } else {
    setData();
  }
}

function setInitialData() {
  var problemDetails = JSON.stringify({
    easy: [],
    medium: [],
    hard: [],
  });
  localStorage.setItem("leetCodeExtensionDetails", problemDetails);
}
