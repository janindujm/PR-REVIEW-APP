async function loadPRs() {
  const res = await fetch("http://13.220.94.183:3000/prs");
  const prs = await res.json();

  const list = document.getElementById("pr-list");
  list.innerHTML = "";

  prs.forEach(pr => {
    const li = document.createElement("li");
    li.textContent = `#${pr.prNumber} - ${pr.title} by ${pr.author} [${pr.status}]`;

    if (pr.status === "PENDING") {
      const btn = document.createElement("button");
      btn.textContent = "Approve & Merge";
      btn.onclick = async () => {
        await fetch(`http://13.220.94.183:3000/approve/${pr.prNumber}`, {
          method: "POST"
        });
        loadPRs();
      };
      li.appendChild(btn);
    }

    list.appendChild(li);
  });
}

loadPRs();
