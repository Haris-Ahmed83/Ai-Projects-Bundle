// Markdown Previewer - Fallback Project #65
console.log("Markdown Previewer loaded");
document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  if (content) {
    content.innerHTML += "<p style='margin-top:12px;color:#667eea'>Ready to customize!</p>";
  }
});
