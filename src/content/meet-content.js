chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "get-meeting-id") {
    const meetId = window.location.pathname.slice(1); // Removes the leading "/"

    chrome.runtime.sendMessage({ type: "return-meeting-id", data: meetId });
  }
});
