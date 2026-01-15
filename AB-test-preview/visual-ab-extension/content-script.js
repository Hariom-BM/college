// Ensure modal inject only once
let modalInjected = false;

function createModal() {
  // Remove existing modal if present
  const existingOverlay = document.getElementById("livePreviewOverlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  if (modalInjected) {
    modalInjected = false;
  }
  modalInjected = true;

  // Overlay
  const overlay = document.createElement("div");
  overlay.id = "livePreviewOverlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999
  });

  // Modal Box
  const modal = document.createElement("div");
  modal.id = "livePreviewModal";
  Object.assign(modal.style, {
    background: "#fff",
    maxWidth: "500px",
    width: "90%",
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    maxHeight: "80vh",
    overflowY: "auto"
  });

  modal.innerHTML = `
    <h3 style="text-align:center;">Text Preview Tool</h3>
    <div id="rows">
      <div class="row" style="display:flex; gap:8px; margin-bottom:8px;">
        <input type="text" class="selector" placeholder="CSS Selector" style="flex:1; padding:5px;">
        <input type="text" class="text" placeholder="New Text" style="flex:1; padding:5px;">
      </div>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:10px;">
      <button id="addField" style="padding:5px 10px;">+ Add Field</button>
      <button id="previewBtn" style="padding:5px 10px;">Preview</button>
      <button id="closeModal" style="padding:5px 10px;">Close</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add Field
  overlay.querySelector("#addField").addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "row";
    row.style.cssText = "display:flex; gap:8px; margin-bottom:8px;";
    row.innerHTML = `
      <input type="text" class="selector" placeholder="CSS Selector" style="flex:1; padding:5px;">
      <input type="text" class="text" placeholder="New Text" style="flex:1; padding:5px;">
    `;
    overlay.querySelector("#rows").appendChild(row);
  });

  // Preview
  overlay.querySelector("#previewBtn").addEventListener("click", () => {
    overlay.querySelectorAll(".row").forEach(row => {
      const selector = row.querySelector(".selector").value.trim();
      const text = row.querySelector(".text").value;
      if (!selector) return;
      try {
        document.querySelectorAll(selector).forEach(el => el.textContent = text);
      } catch {
        alert("Invalid selector: " + selector);
      }
    });
  });

  // Close modal
  overlay.querySelector("#closeModal").addEventListener("click", () => {
    overlay.remove();
    modalInjected = false;
  });
}

// Debug: Check Chrome API availability
console.log("Content script context check:");
console.log("- typeof chrome:", typeof chrome);
console.log("- chrome.runtime:", chrome?.runtime);
console.log("- chrome.runtime.onMessage:", chrome?.runtime?.onMessage);

// Listen to popup trigger via message
try {
  if (chrome && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("Content script received message:", request);
      if (request && request.action === "openModal") {
        createModal();
        sendResponse({success: true});
      }
      return true; // Keep channel open for async response
    });
    console.log("✓ Message listener attached successfully");
  } else {
    console.warn("⚠ chrome.runtime.onMessage not available (this is OK, popup uses direct injection)");
  }
} catch (error) {
  console.error("Error setting up message listener:", error);
}

// Also listen to window event (for backward compatibility)
window.addEventListener("openLivePreviewModal", () => {
  console.log("Window event received: openLivePreviewModal");
  createModal();
});

console.log("✓ Content script loaded and ready");
