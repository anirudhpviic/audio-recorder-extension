const observer = new MutationObserver(() => {
  const leaveButton = document.querySelector('[aria-label="Leave call"]');
  if (leaveButton) {
    // To background script
    chrome.runtime.sendMessage({ type: "USER_JOINED_MEET" });
    observer.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
