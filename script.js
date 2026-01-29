const searchInput = document.getElementById("searchInput");
const profileCard = document.getElementById("profileCard");
const statusText = document.getElementById("status");
const loader = document.getElementById("loader");

/*  SEARCH HANDLER  */
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const username = searchInput.value.trim();
    if (username) {
      fetchUser(username);
    }
  }
});

/*  FETCH USER  */
async function fetchUser(username) {
  showLoading();

  try {
    const userResponse = await fetch(
      `https://api.github.com/users/${username}`
    );

    if (userResponse.status === 404) {
      throw new Error("User Not Found");
    }

    if (userResponse.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Try again later.");
    }

    if (!userResponse.ok) {
      throw new Error("Something went wrong");
    }

    const userData = await userResponse.json();

    const repoResponse = await fetch(userData.repos_url);

    if (!repoResponse.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const repoData = await repoResponse.json();

    hideLoading();
    renderProfile(userData, repoData);

  } catch (error) {
    showError(error.message);
  }
}

/*  UI STATES  */
function showLoading() {
  loader.classList.remove("hidden");
  statusText.textContent = "";
  profileCard.classList.add("hidden");
}

function hideLoading() {
  loader.classList.add("hidden");
}

function showError(message) {
  hideLoading();
  statusText.textContent = message;
  profileCard.classList.add("hidden");
}

/*  RENDER PROFILE  */
function renderProfile(user, repos) {
  statusText.textContent = "";
  profileCard.classList.remove("hidden");

  const latestRepos = repos
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  profileCard.innerHTML = `
    <div class="avatar-wrapper">
      <img src="${user.avatar_url}" class="avatar" />
    </div>

    <h2>${user.name || user.login}</h2>
    <p>${user.bio || "No bio available"}</p>
    <p>Joined: ${formatDate(user.created_at)}</p>

    <a href="${user.blog || user.html_url}" target="_blank">
      ${user.blog || "GitHub Profile"}
    </a>

    ${
      latestRepos.length
        ? `
      <div class="repos">
        <h3>Latest Repositories</h3>
        <ul>
          ${latestRepos
            .map(
              repo => `
            <li>
              <a href="${repo.html_url}" target="_blank">
                ${repo.name}
              </a>
              — ${formatDate(repo.created_at)}
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
      `
        : ""
    }
  `;

  /* avatar zoom animation  */
  requestAnimationFrame(() => {
    const avatar = profileCard.querySelector(".avatar");
    if (avatar) {
      avatar.classList.remove("animate"); 
      void avatar.offsetWidth;            
      avatar.classList.add("animate");    // play animation
    }
  });
}

/* DATE FORMAT  */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
