(function() {
  console.log("=== Popup Script Starting ===");
  
  const button = document.getElementById("openModal");
  if (!button) {
    console.error("Button not found!");
    return;
  }
  console.log("Button found:", button);
  
  button.onclick = async function() {
    console.log("=== Button Clicked ===");
    
    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      console.log("Active tab:", tab);
      
      if (!tab) {
        alert("No active tab found!");
        return;
      }
      
      // Check URL
      if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
        alert("Please open a regular website (not Chrome pages)");
        return;
      }
      
      console.log("Tab URL:", tab.url);
      
      // Inject modal directly
      console.log("Injecting modal...");
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: createModal
      });
      
      console.log("Injection complete!");
      
    } catch (error) {
      console.error("ERROR:", error);
      alert("Error: " + error.message);
    }
  };
  
  console.log("Event listener attached");
  
  // Modal creation function
  function createModal() {
    console.log("createModal function called in page context");
    
    // Remove existing
    const existing = document.getElementById("livePreviewOverlay");
    if (existing) existing.remove();
    
    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "livePreviewOverlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
    `;
    
    // Create modal
    const modal = document.createElement("div");
    modal.id = "livePreviewModal";
    modal.style.cssText = `
      background: white;
      max-width: 500px;
      width: 90%;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    modal.innerHTML = `
      <h3 style="text-align:center; margin-top:0;">Text Preview Tool</h3>
      <div id="rows">
        <div class="row" style="display:flex; gap:8px; margin-bottom:8px;">
          <input type="text" class="selector" placeholder="CSS Selector (e.g., h1)" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;">
          <input type="text" class="text" placeholder="New Text" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;">
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; margin-top:15px; gap:8px;">
        <button id="addField" style="padding:8px 12px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer;">+ Add Field</button>
        <button id="previewBtn" style="padding:8px 12px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">Preview</button>
        <button id="closeModal" style="padding:8px 12px; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer;">Close</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    console.log("Modal added to page!");
    
    // Add Field button
    overlay.querySelector("#addField").onclick = function() {
      const row = document.createElement("div");
      row.className = "row";
      row.style.cssText = "display:flex; gap:8px; margin-bottom:8px;";
      row.innerHTML = `
        <input type="text" class="selector" placeholder="CSS Selector" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;">
        <input type="text" class="text" placeholder="New Text" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;">
      `;
      overlay.querySelector("#rows").appendChild(row);
    };
    
    // Preview button
    overlay.querySelector("#previewBtn").onclick = function() {
      overlay.querySelectorAll(".row").forEach(row => {
        const selector = row.querySelector(".selector").value.trim();
        const text = row.querySelector(".text").value;
        if (!selector) return;
        try {
          const elements = document.querySelectorAll(selector);
          if (elements.length === 0) {
            alert("No elements found with selector: " + selector);
            return;
          }
          elements.forEach(el => el.textContent = text);
          console.log(`Updated ${elements.length} element(s) with selector: ${selector}`);
        } catch (e) {
          alert("Invalid selector: " + selector + "\nError: " + e.message);
        }
      });
    };
    
    // Close button
    overlay.querySelector("#closeModal").onclick = function() {
      overlay.remove();
      console.log("Modal closed");
    };
    
    // Close on overlay click (outside modal)
    overlay.onclick = function(e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    };
  }
  
})();
