document.addEventListener("DOMContentLoaded", function () {
    const profilePic = document.querySelector(".profile-pic");
    if (profilePic) {
      profilePic.addEventListener("mouseover", function () {
        profilePic.style.transform = "scale(1.1) rotateY(10deg)";
        profilePic.style.transition = "0.3s ease-in-out";
      });
      profilePic.addEventListener("mouseout", function () {
        profilePic.style.transform = "scale(1) rotateY(0deg)";
      });
    }
  
    const hud = document.querySelector(".hud");
    if (hud) {
      let angle = 0;
      setInterval(() => {
        angle += 2;
        hud.style.transform = `rotate(${angle}deg)`;
      }, 100);
    }
  
    let text = document.querySelector(".animated-text");
    if (text) {
      text.innerHTML = text.innerText.split("").map(
        (letter, i) => `<span style="animation-delay:${i * 50}ms">${letter}</span>`
      ).join("");
    }
  });
  