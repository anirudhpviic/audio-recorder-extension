// Detect changes in mute button
let isMuted = true;

function checkMuteStatus() {
  const muteButton =
    document.querySelector('[aria-label="Turn on microphone"]') ||
    document.querySelector('[aria-label="Turn off microphone"]');

  if (muteButton) {
    if (
      isMuted !==
      muteButton.getAttribute("aria-label").includes("Turn on microphone")
    ) {
      // Send mute status to the background script
      chrome.runtime.sendMessage({
        type: "MIC_STATUS",
        muted: isMuted,
      });
      isMuted = !isMuted;
    }
  }
}

// Monitor for changes every 500ms
setInterval(checkMuteStatus, 500);
