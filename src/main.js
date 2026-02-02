// Disable automatic scroll restoration to prevent jumps on refresh before content loads
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Save scroll position before reload
window.addEventListener('beforeunload', () => {
  sessionStorage.setItem('scrollPos', window.scrollY);
});

// Theme toggle logic - Run as early as possible
const themeToggle = document.getElementById('theme-toggle')
const body = document.body
const themeIcon = themeToggle.querySelector('i')

// Check for saved theme preference or default to system preference
const savedTheme = localStorage.getItem('theme')
const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

if (savedTheme === 'dark' || (!savedTheme && systemDarkMode)) {
  body.classList.add('dark-mode')
  themeIcon.className = 'bi bi-sun'
} else {
  body.classList.remove('dark-mode')
  body.classList.add('light-mode')
  themeIcon.className = 'bi bi-moon-stars'
}

themeToggle.addEventListener('click', () => {
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode')
    body.classList.add('light-mode')
    themeIcon.className = 'bi bi-moon-stars'
    localStorage.setItem('theme', 'light')
  } else {
    body.classList.remove('light-mode')
    body.classList.add('dark-mode')
    themeIcon.className = 'bi bi-sun'
    localStorage.setItem('theme', 'dark')
  }
})

// fetch and display projects card
let allProjects = [];

function renderProjects(projects) {
  const container = document.getElementById('project-grid')
  container.innerHTML = ''; // Clear previous projects
  const fragment = document.createDocumentFragment()

  projects.forEach(project => {
    const card = document.createElement('div')
    card.className = 'project-card'

    card.innerHTML = `
        <div class="card-media">
          <img src="${project.media.src}" alt="${project.media.alt}">
        </div>

        <div class="card-content">
          <h3>${project.index}. ${project.title}</h3>
          <p>${project.description}</p>
          
          <div class="contributed-by">
            ${project.contributor ?
        `Contributed by: ${project.contributor.name} 
             ${(project.contributor.portfolio || project.contributor.url || project.contributor.github) ? '(' : ''}${project.contributor.portfolio || project.contributor.url ? `<a href="${project.contributor.portfolio || project.contributor.url}" target="_blank">Portfolio</a>` : ''}${(project.contributor.portfolio || project.contributor.url) && project.contributor.github ? ' | ' : ''}${project.contributor.github ? `<a href="${project.contributor.github}" target="_blank">GitHub</a>` : ''}${(project.contributor.portfolio || project.contributor.url || project.contributor.github) ? ')' : ''}` :
        `Created by: Ovi ren (<a href="https://iamovi.github.io/" target="_blank">Portfolio</a> | <a href="https://github.com/iamovi" target="_blank">GitHub</a>)`}
          </div>

          <div class="card-links">
            <a href="${project.links.code}" target="_blank">
              <i class="bi bi-github"></i> Code
            </a>
            <a href="${project.links.preview}" target="_blank">
              <i class="bi bi-eye"></i> Preview
            </a>
          </div>
        </div>
      `
    fragment.appendChild(card)
  })

  container.appendChild(fragment)
  container.style.minHeight = 'auto';
}

function renderTeam(team) {
  const container = document.querySelector('.team-section');
  if (!container) return; // Guard clause if element not found

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  team.forEach(member => {
    const card = document.createElement('div');
    card.className = 'team-card';

    // Default country for Ovi ren if not present, though now it is in JSON.
    // The user requirement: "if its me ovi ren, it will selected to dhaka, bangladesh"
    const country = member.country || (member.name === 'Ovi ren' ? 'Dhaka, Bangladesh' : '');

    card.innerHTML = `
      <div class="team-avatar">
        <img src="${member.avatar}" alt="${member.name}">
      </div>
      <h5>${member.role}</h5>
      <h4>${member.name}</h4>
      ${country ? `<p style="font-size: 0.9rem; color: var(--secondary-text); margin-bottom: 0.5rem;"><i class="bi bi-geo-alt"></i> ${country}</p>` : ''}
      <p>${member.bio}</p>
      <div class="team-links">
        ${member.portfolio ? `<a href="${member.portfolio}" target="_blank"><i class="bi bi-box-arrow-up-right"></i> Portfolio</a>` : ''}
        ${member.github ? `<a href="${member.github}" target="_blank"><i class="bi bi-github"></i> GitHub</a>` : ''}
      </div>
    `;
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

fetch('./src/projects-data.json')
  .then(res => res.json())
  .then(data => {
    allProjects = data.projects;
    renderProjects(allProjects);

    // Restore scroll position after projects are loaded
    const savedScrollPos = sessionStorage.getItem('scrollPos');
    if (savedScrollPos) {
      window.scrollTo(0, parseInt(savedScrollPos));
      sessionStorage.removeItem('scrollPos');
    }
  })
  .catch(err => console.error(err))

fetch('./src/team-data.json')
  .then(res => res.json())
  .then(data => {
    if (data.team) {
      renderTeam(data.team);
    }
  })
  .catch(err => console.error(err))

// Search functionality
const searchInput = document.getElementById('project-search');
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredProjects = allProjects.filter(project => {
    const titleMatch = project.title.toLowerCase().includes(searchTerm);
    const descMatch = project.description.toLowerCase().includes(searchTerm);
    const contributorName = project.contributor ? project.contributor.name : "Ovi ren";
    const contributorMatch = contributorName.toLowerCase().includes(searchTerm);

    return titleMatch || descMatch || contributorMatch;
  });
  renderProjects(filteredProjects);
});

// fetch github stats with 5-minute localStorage caching
const GH_STATS_CACHE_KEY = 'gh_stats_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function fetchAndCacheGitHubStats() {
  const repoUrl = 'https://api.github.com/repos/iamovi/button-will-react'

  Promise.all([
    fetch(repoUrl).then(res => res.json()),
    fetch(`${repoUrl}/contributors`).then(res => res.json())
  ])
    .then(([repoData, contributorsData]) => {
      const stats = {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        contributors: contributorsData.length,
        timestamp: Date.now()
      };

      // Save to localStorage
      localStorage.setItem(GH_STATS_CACHE_KEY, JSON.stringify(stats));

      // Update UI
      document.getElementById('star-count').innerText = stats.stars;
      document.getElementById('fork-count').innerText = stats.forks;
      document.getElementById('contributor-count').innerText = stats.contributors;
    })
    .catch(err => {
      console.error('Error fetching GitHub stats:', err);
      document.getElementById('gh-stats').style.display = 'none';
    });
}

// Check if we have cached stats
const cachedGitHubStats = localStorage.getItem(GH_STATS_CACHE_KEY);

if (cachedGitHubStats) {
  try {
    const parsed = JSON.parse(cachedGitHubStats);
    const age = Date.now() - parsed.timestamp;

    if (age < CACHE_DURATION) {
      // Cache is still valid, use it
      document.getElementById('star-count').innerText = parsed.stars;
      document.getElementById('fork-count').innerText = parsed.forks;
      document.getElementById('contributor-count').innerText = parsed.contributors;
    } else {
      // Cache expired, fetch fresh data
      fetchAndCacheGitHubStats();
    }
  } catch (e) {
    // Invalid cache data, fetch fresh
    fetchAndCacheGitHubStats();
  }
} else {
  // No cache, fetch fresh data
  fetchAndCacheGitHubStats();
}
