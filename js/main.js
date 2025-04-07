require('dotenv').config();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all sections as hidden
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show initial active section
    const initialSection = document.querySelector('.content-section.active');
    if (initialSection) initialSection.style.display = 'block';

    // Tab navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Show target section and mark active
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
            item.classList.add('active');
        });
    });

    // Initial load
    loadDriverStandings();
    loadNews();
    loadTeamStandings();
    loadDrivers();
    loadRaceResults();
});

async function fetchData(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Standings Loader
async function loadDriverStandings() {
    const data = await fetchData('https://ergast.com/api/f1/current/driverStandings.json');
    const container = document.getElementById('driver-standings');
    
    if (data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings) {
        // Clear grid layout for the table
        container.classList.remove('responsive-grid');
        
        container.innerHTML = `
            <div class="data-card">
                <div class="table-container">
                    <table class="standings-table">
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Driver</th>
                                <th>Team</th>
                                <th>Points</th>
                                <th>Wins</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.MRData.StandingsTable.StandingsLists[0].DriverStandings.map(driver => `
                                <tr class="table-row ${driver.position === '1' ? 'champion-row' : ''}">
                                    <td class="position">${driver.position === '1' ? '👑' : driver.position}</td>
                                    <td class="driver">
                                        <span class="driver-name ${driver.position === '1' ? 'champion-name' : ''}">${driver.Driver.givenName} ${driver.Driver.familyName}</span>
                                        <span class="driver-code">${driver.Driver.code}</span>
                                    </td>
                                    <td class="team">${driver.Constructors[0].name}</td>
                                    <td class="points">${driver.points}</td>
                                    <td class="wins">${driver.wins}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

// Teams Loader
async function loadTeamStandings() {
    const data = await fetchData('https://ergast.com/api/f1/current/constructorStandings.json');
    const container = document.getElementById('teams-container');
    
    if (data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings) {
        // Set up a table instead of cards for consistency
        container.classList.remove('responsive-grid');
        
        container.innerHTML = `
            <div class="data-card">
                <div class="table-container">
                    <table class="standings-table">
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Team</th>
                                <th>Points</th>
                                <th>Wins</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.map(team => `
                                <tr class="table-row ${team.position === '1' ? 'champion-row' : ''}">
                                    <td class="position">${team.position === '1' ? '👑' : team.position}</td>
                                    <td class="team">
                                        <span class="${team.position === '1' ? 'champion-name' : ''}">${team.Constructor.name}</span>
                                    </td>
                                    <td class="points">${team.points}</td>
                                    <td class="wins">${team.wins}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

// Results Loader
async function loadRaceResults() {
    const data = await fetchData('https://ergast.com/api/f1/current/last/results.json');
    const container = document.getElementById('race-results');
    
    if (data?.MRData?.RaceTable?.Races?.[0]?.Results) {
        container.innerHTML = `
            <div class="data-card">
                <div class="race-header">
                    <h3>${data.MRData.RaceTable.Races[0].raceName}</h3>
                    <p class="race-info">
                        <span>${data.MRData.RaceTable.Races[0].Circuit.circuitName}</span>
                        <span>${new Date(data.MRData.RaceTable.Races[0].date).toLocaleDateString()}</span>
                    </p>
                </div>
                <div class="results-grid">
                    ${data.MRData.RaceTable.Races[0].Results.map(result => `
                        <div class="result-item">
                            <div class="result-position">${result.position}</div>
                            <div class="driver-info">
                                <p class="driver-name">${result.Driver.givenName} ${result.Driver.familyName}</p>
                                <p class="team-name">${result.Constructor.name}</p>
                            </div>
                            <div class="result-stats">
                                <span class="points">${result.points} PTS</span>
                                <span class="status">${result.status}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// News Loader
async function loadNews() {
    const API_KEY = process.env.API_KEY;
    const container = document.getElementById('news-container');
    
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=formula+1&sortBy=publishedAt&apiKey=${API_KEY}`);
        const data = await response.json();

        if (data.status === 'ok') {
            container.innerHTML = data.articles.map(article => `
                <div class="data-card news-card">
                    ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}">` : ''}
                    <h3>${article.title}</h3>
                    <p>${article.description || ''}</p>
                    <a href="${article.url}" target="_blank" class="read-more">
                        Read full article <i class="fas fa-arrow-right"></i>
                    </a>
                    <div class="news-meta">
                        <span>${article.source.name}</span>
                        <span>${new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('News loading error:', error);
        container.innerHTML = `<div class="data-card">Error loading news. Please try again later.</div>`;
    }
}

// Drivers Loader
async function loadDrivers() {
    const data = await fetchData('https://ergast.com/api/f1/current/drivers.json');
    const container = document.getElementById('drivers-container');
    
    if (data?.MRData?.DriverTable?.Drivers) {
        container.innerHTML = data.MRData.DriverTable.Drivers
            .map(driver => `                <div class="data-card">
                    <h3>${driver.givenName} ${driver.familyName}</h3>
                    <p>Nationality: ${driver.nationality}</p>
                    <p>Number: ${driver.permanentNumber || 'N/A'}</p>
                    <p>Code: ${driver.code || 'N/A'}</p>
                    <a href="${driver.url}" target="_blank" class="read-more">
                        Driver Profile <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `).join('');
    }
}

