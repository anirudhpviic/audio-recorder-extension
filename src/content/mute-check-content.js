let isMuted = true;

// Function to check the initial mute status
function checkInitialMuteStatus() {
  const muteButton =
    document.querySelector('[aria-label="Turn on microphone"]') ||
    document.querySelector('[aria-label="Turn off microphone"]');

  if (muteButton) {
    isMuted = muteButton
      .getAttribute("aria-label")
      .includes("Turn on microphone");

    // Send initial mute status to the background script
    chrome.runtime.sendMessage({
      type: "MIC_STATUS",
      muted: isMuted,
    });
  }
}

// Check the mute status when the script loads
checkInitialMuteStatus();

document.addEventListener("click", (event) => {
  const muteButton =
    document.querySelector('[aria-label="Turn on microphone"]') ||
    document.querySelector('[aria-label="Turn off microphone"]');

  if (muteButton && muteButton.contains(event.target)) {
    isMuted = muteButton
      .getAttribute("aria-label")
      .includes("Turn on microphone");

    // Send mute status to the background script
    chrome.runtime.sendMessage({
      type: "MIC_STATUS",
      muted: isMuted,
    });
  }
});
