const Popup = () => {
  const handleClick = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage({ type: "click", tabId: tabs[0].id });
    });
  };

  return (
    <div
      style={{
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      Popup
      <button
        style={{ padding: "10px", backgroundColor: "green" }}
        onClick={handleClick}
      >
        click
      </button>
    </div>
  );
};

export default Popup;
