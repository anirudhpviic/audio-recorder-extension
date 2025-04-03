chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "get-meeting-id") {
    const meetId = window.location.pathname.slice(1); // Removes the leading "/"

    chrome.runtime.sendMessage({ type: "return-meeting-id", data: meetId });
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "is-in-meeting") {
    const meetingUrl = window.location.href; // Get the full URL
    const isGoogleMeet = meetingUrl.startsWith("https://meet.google.com");
    const meetId = window.location.pathname.slice(1); // Extract the part after "/"

    // Check if the meetId matches the expected format (letters and dashes)
    const isValidMeeting = isGoogleMeet && /^[a-zA-Z0-9-]+$/.test(meetId);

    chrome.runtime.sendMessage({
      type: "return-is-in-meeting",
      data: isValidMeeting,
    });
  }
});
