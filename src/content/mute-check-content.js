let isMuted = true;

// Listen for clicks on the mute button
document.addEventListener("click", (event) => {
  const muteButton =
    document.querySelector('[aria-label="Turn on microphone"]') ||
    document.querySelector('[aria-label="Turn off microphone"]');

  if (muteButton && muteButton.contains(event.target)) {
    isMuted = muteButton
      .getAttribute("aria-label")
      .includes("Turn off microphone");

    console.log("isMuted click:", isMuted);

    // Send mute status to the background script
    chrome.runtime.sendMessage({
      type: "MIC_STATUS",
      isMuted,
    });
  }
});

const checkMicStatus = () => {
  const muteButton =
    document.querySelector('[aria-label="Turn on microphone"]') ||
    document.querySelector('[aria-label="Turn off microphone"]');

  if (muteButton) {
    isMuted = muteButton
      .getAttribute("aria-label")
      .includes("Turn on microphone");

    console.log("isMuted initial:", isMuted);

    chrome.runtime.sendMessage({
      type: "MIC_STATUS",
      isMuted,
    });

    return true; // Found the button
  }

  return false; // Button not found yet
};

// MutationObserver to detect when the meeting UI changes
// finding the initial mic status
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      const joinButton = document.querySelector(
        '[jslog="227430; track:click"]'
      );
      if (!joinButton) {
        console.log("user joined");

        let attempts = 0;

        const interval = setInterval(() => {
          if (checkMicStatus() || attempts > 20) {
            clearInterval(interval);
          }

          attempts++;
        }, 500);

        observer.disconnect(); // Stop observing once the user joins
      }
    }
  }
});

// Start observing changes in the body
observer.observe(document.body, { childList: true, subtree: true });
