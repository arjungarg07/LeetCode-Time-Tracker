import { Problem, Action } from "./types";

// Gets Problem Name and Difficulty from the Content Script and Persit data

chrome.tabs.onActivated.addListener(function (activeInfo) {
  let urlRegex: RegExp = new RegExp("https://leetcode.com/problems/*");
  const activeTabId = activeInfo.tabId;
  // Setting Popup dynamically

  chrome.tabs.get(activeTabId, function (tab) {
    const currentUrl = tab.url;
    if (urlRegex.test(currentUrl)) {
      chrome.browserAction.setPopup({ popup: "popup.html" });
    } else {
      chrome.browserAction.setPopup({ popup: "invalid.html" });
    }
  });
});

const app = (function () {
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
      }
    }
  });
})();
