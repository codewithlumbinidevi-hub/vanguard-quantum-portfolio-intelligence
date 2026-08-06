document.addEventListener('DOMContentLoaded', () => {
    const year = document.getElementById('year');
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const renderAssetOptions = async () => {
        const container = document.getElementById('assetUniverseOptions');
        if (!container) return;

        try {
            const response = await fetch('/api/assets');
            const assets = await response.json();
            container.innerHTML = assets.map(asset => `
                <label class="asset-chip">
                    <span>${asset.name}</span>
                    <input type="checkbox" checked>
                </label>
            `).join('');
        } catch (error) {
            container.innerHTML = '<p class="text-muted">Asset universe unavailable.</p>';
        }
    };

    const renderHistory = async () => {
        const list = document.getElementById('historyList');
        if (!list) return;

        try {
            const response = await fetch('/api/history');
            const history = await response.json();
            list.innerHTML = history.map(item => `
                <a href="${window.location.origin}/results" class="list-group-item list-group-item-action bg-transparent text-light border-0">
                    <div class="d-flex justify-content-between"><span>${item.name}</span><strong>${item.return}</strong></div>
                    <small class="text-muted">${item.created}</small>
                </a>
            `).join('');
        } catch (error) {
            list.innerHTML = '<div class="text-muted">Historical data unavailable.</div>';
        }
    };

    const createChart = (canvasId, config) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        return new Chart(ctx, config);
    };

    const renderDashboardCharts = async () => {
        const allocationChart = document.getElementById('allocationOverviewChart');
        if (!allocationChart) return;

        createChart('allocationOverviewChart', {
            type: 'doughnut',
            data: {
                labels: ['Equities', 'Fixed Income', 'Alternatives', 'Cash', 'Crypto'],
                datasets: [{ data: [42, 22, 18, 10, 8], backgroundColor: ['#4f8cff', '#2dd4bf', '#7c3aed', '#f59e0b', '#ef4444'] }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    };

    const renderRiskPanel = () => {
        const panel = document.getElementById('riskPanel');
        if (!panel) return;
        const risks = [
            { name: 'Liquidity Risk', level: 'Green', status: 'status-green' },
            { name: 'Market Risk', level: 'Yellow', status: 'status-yellow' },
            { name: 'Sector Risk', level: 'Yellow', status: 'status-yellow' },
            { name: 'Currency Risk', level: 'Red', status: 'status-red' },
            { name: 'Interest Rate Risk', level: 'Green', status: 'status-green' },
            { name: 'Inflation Risk', level: 'Yellow', status: 'status-yellow' },
            { name: 'Credit Risk', level: 'Green', status: 'status-green' },
            { name: 'Correlation Risk', level: 'Red', status: 'status-red' }
        ];
        panel.innerHTML = risks.map(risk => `<div class="risk-item"><strong>${risk.name}</strong><div class="risk-status ${risk.status}">${risk.level}</div></div>`).join('');
    };

    const renderLiveMarket = async () => {
        const container = document.getElementById('liveMarketStatus');
        if (!container) return;
        try {
            const response = await fetch('/api/live-market');
            const data = await response.json();
            container.innerHTML = `
                <div class="mb-3"><strong>Sentiment:</strong> ${data.newsSentiment.summary}</div>
                <div class="mb-2"><strong>VIX:</strong> ${data.volatilityIndex.vix} (${data.volatilityIndex.signal})</div>
                <div class="small text-muted">Updated ${new Date(data.timestamp).toLocaleTimeString()}</div>
            `;
        } catch (error) {
            container.textContent = 'Live market intelligence unavailable.';
        }
    };

    const renderAlerts = async () => {
        const container = document.getElementById('alertStream');
        if (!container) return;
        try {
            const response = await fetch('/api/alerts');
            const alerts = await response.json();
            container.innerHTML = alerts.map(alert => `<div class="alert-pill mb-2"><strong>${alert.title}</strong><div class="text-muted small">${alert.detail}</div></div>`).join('');
        } catch (error) {
            container.innerHTML = '<div class="alert-pill">Alerts unavailable.</div>';
        }
    };

    const renderAssistant = async () => {
        const askBtn = document.getElementById('assistantAskBtn');
        const input = document.getElementById('assistantQuestion');
        const responseBox = document.getElementById('assistantResponse');
        if (!askBtn || !input || !responseBox) return;

        const renderResponse = (data) => {
            const detail = data.detail || {};
            responseBox.innerHTML = `
                <div class="mb-2">${data.reply}</div>
                <div class="text-muted small">
                    <div><strong>Where:</strong> ${detail.where || '-'}</div>
                    <div><strong>How:</strong> ${detail.how || '-'}</div>
                    <div><strong>Why:</strong> ${detail.why || '-'}</div>
                </div>
            `;
        };

        askBtn.addEventListener('click', async () => {
            const question = input.value.trim();
            if (!question) return;
            responseBox.textContent = 'AI co-pilot is analyzing...';
            try {
                const result = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
                const data = await result.json();
                renderResponse(data);
            } catch (error) {
                responseBox.textContent = 'AI co-pilot unavailable. Please try again later.';
            }
        });

        try {
            const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: '' }) });
            const data = await response.json();
            renderResponse(data);
        } catch (error) {
            responseBox.textContent = 'AI co-pilot unavailable. Please try again later.';
        }
    };

    const renderNotifications = async () => {
        const alertsList = document.getElementById('alertsList');
        const newsFeed = document.getElementById('newsFeed');
        const recPanel = document.getElementById('recommendationsPanel');
        if (!alertsList && !newsFeed && !recPanel) return;

        try {
            const [alertsRes, newsRes, recommendationsRes] = await Promise.all([
                fetch('/api/alerts'),
                fetch('/api/news'),
                fetch('/api/recommendations')
            ]);
            const alerts = await alertsRes.json();
            const newsItems = await newsRes.json();
            const recommendations = await recommendationsRes.json();

            if (alertsList) {
                alertsList.innerHTML = alerts.map(alert => `<div class="alert-pill mb-2"><strong>${alert.title}</strong><div class="text-muted small">${alert.detail}</div></div>`).join('');
            }
            if (newsFeed) {
                newsFeed.innerHTML = newsItems.map(item => `<div class="mb-3"><strong>${item.headline}</strong><div class="text-muted small">${item.source} · ${item.timestamp}</div></div>`).join('');
            }
            if (recPanel) {
                recPanel.innerHTML = Object.entries(recommendations).filter(([key]) => ['daily', 'weekly', 'taxAware', 'esg', 'sector'].includes(key)).flatMap(([key, items]) => items.map(item => `<div class="alert-pill mb-2"><strong>${item.title}</strong><div class="text-muted small">${item.detail}</div></div>`)).join('');
            }
        } catch (error) {
            if (alertsList) alertsList.innerHTML = '<div class="alert-pill">Notification data unavailable.</div>';
            if (newsFeed) newsFeed.innerHTML = '<div class="text-muted">News unavailable.</div>';
            if (recPanel) recPanel.innerHTML = '<div class="text-muted">Recommendations unavailable.</div>';
        }
    };

    const renderProfile = async () => {
        const summary = document.getElementById('profileSummary');
        const constraints = document.getElementById('profileConstraints');
        const allocation = document.getElementById('profileAllocation');
        const feedback = document.getElementById('profileFeedback');
        if (!summary && !constraints && !allocation && !feedback) return;

        try {
            const response = await fetch('/api/portfolio');
            const data = await response.json();
            if (summary) {
                summary.innerHTML = `
                    <div class="mb-2"><strong>Mandate:</strong> ${data.portfolioName}</div>
                    <div class="mb-2"><strong>Goal:</strong> ${data.investmentGoal}</div>
                    <div class="mb-2"><strong>Risk:</strong> ${data.riskTolerance}</div>
                    <div><strong>Horizon:</strong> ${data.investmentHorizon}</div>
                `;
            }
            if (constraints) {
                constraints.innerHTML = `
                    <div class="mb-2"><strong>Max Asset Weight:</strong> ${data.constraints.maxAssetWeight}%</div>
                    <div class="mb-2"><strong>Min Asset Weight:</strong> ${data.constraints.minAssetWeight}%</div>
                    <div class="mb-2"><strong>Max Sector Exposure:</strong> ${data.constraints.maxSectorExposure}%</div>
                    <div><strong>Carbon Limit:</strong> ${data.constraints.carbonLimit}%</div>
                `;
            }
            if (allocation) {
                allocation.innerHTML = data.currentAllocation.slice(0, 5).map(asset => `<div class="mb-2"><strong>${asset.name}</strong><div class="text-muted small">${asset.sector} · ${asset.weight}%</div></div>`).join('');
            }
            if (feedback) {
                feedback.innerHTML = `
                    <div class="mb-2"><strong>Confidence:</strong> ${data.userFeedback.confidence}%</div>
                    <div class="mb-2"><strong>Stress Level:</strong> ${data.userFeedback.stressLevel}</div>
                    <div class="text-muted small">${data.userFeedback.notes}</div>
                `;
            }
        } catch (error) {
            if (summary) summary.textContent = 'Profile data unavailable.';
            if (constraints) constraints.textContent = '';
            if (allocation) allocation.textContent = '';
            if (feedback) feedback.textContent = '';
        }
    };

    const renderResults = async () => {
        const metricsList = document.getElementById('metricsList');
        if (!metricsList) return;

        try {
            const response = await fetch('/api/results');
            const data = await response.json();
            metricsList.innerHTML = [
                { label: 'Expected Return', value: `${data.expectedReturn}%` },
                { label: 'Portfolio Risk', value: `${data.portfolioRisk}%` },
                { label: 'Sharpe Ratio', value: data.sharpeRatio },
                { label: 'Sortino Ratio', value: data.sortinoRatio },
                { label: 'Maximum Drawdown', value: `${data.maxDrawdown}%` },
                { label: 'Transaction Cost', value: `${data.transactionCost}%` },
                { label: 'Diversification Score', value: data.diversificationScore },
                { label: 'Quantum Improvement', value: `${data.quantumImprovement}%` }
            ].map(item => `<div class="metric-item"><span>${item.label}</span><strong>${item.value}</strong></div>`).join('');

            const comparisonBody = document.getElementById('comparisonBody');
            if (comparisonBody && data.comparison) {
                comparisonBody.innerHTML = ['classical', 'quantum', 'hybrid'].map(key => {
                    const item = data.comparison[key];
                    return `<tr><td>${key.charAt(0).toUpperCase() + key.slice(1)}</td><td>${item.return}%</td><td>${item.risk}%</td><td>${item.sharpe}</td><td>${item.quantumImprovement ? `+${item.quantumImprovement}%` : '-'}</td></tr>`;
                }).join('');
            }

            createChart('allocationChart', { type: 'pie', data: { labels: data.allocation.map(item => item.asset), datasets: [{ data: data.allocation.map(item => item.weight), backgroundColor: ['#4f8cff', '#2dd4bf', '#f59e0b', '#8b5cf6', '#fb7185', '#34d399', '#f43f5e', '#60a5fa'] }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } } } });
            createChart('weightsChart', { type: 'bar', data: { labels: data.allocation.map(item => item.asset), datasets: [{ label: 'Weight (%)', data: data.allocation.map(item => item.weight), backgroundColor: '#4f8cff' }] }, options: { responsive: true, scales: { y: { beginAtZero: true, max: 30 } } } });
            createChart('riskReturnChart', { type: 'scatter', data: { datasets: [{ label: 'Risk / Return', data: [{ x: data.portfolioRisk, y: data.expectedReturn }], backgroundColor: '#2dd4bf' }] }, options: { responsive: true, scales: { x: { title: { display: true, text: 'Risk' } }, y: { title: { display: true, text: 'Return' } } } } });
        } catch (error) {
            metricsList.innerHTML = '<div class="text-muted">Results unavailable.</div>';
        }
    };

    const renderAnalytics = async () => {
        try {
            const response = await fetch('/api/analytics');
            const data = await response.json();
            createChart('frontierChart', { type: 'line', data: { labels: ['Low', 'Medium', 'High', 'Very High', 'Extreme'], datasets: [{ label: 'Efficient Frontier', data: data.frontier, borderColor: '#4f8cff', tension: 0.3, fill: true, backgroundColor: 'rgba(79,140,255,0.2)' }] }, options: { responsive: true } });
            createChart('heatmapChart', { type: 'bar', data: { labels: ['SPY', 'AGG', 'GLD', 'BTC', 'MSFT', 'AAPL'], datasets: [{ label: 'Correlation', data: [0.82, 0.67, 0.53, 0.48, 0.74, 0.71], backgroundColor: '#2dd4bf' }] }, options: { responsive: true } });
            createChart('riskContributionChart', { type: 'bar', data: { labels: ['MSFT', 'AAPL', 'NVDA', 'SPY', 'AGG', 'GLD'], datasets: [{ label: 'Contribution', data: data.contributors, backgroundColor: ['#4f8cff', '#5eead4', '#c084fc', '#f59e0b', '#fb7185', '#34d399'] }] }, options: { responsive: true } });
            createChart('sectorChart', { type: 'doughnut', data: { labels: Object.keys(data.sectorAllocation), datasets: [{ data: Object.values(data.sectorAllocation), backgroundColor: ['#4f8cff', '#2dd4bf', '#f59e0b', '#8b5cf6', '#ef4444'] }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } } } });

            const insightsPanel = document.getElementById('insightsPanel');
            if (insightsPanel) {
                insightsPanel.innerHTML = [
                    { title: 'Why Apple was selected', body: 'Quality growth exposure with durable earnings resilience and strong liquidity.' },
                    { title: 'Why Gold was selected', body: 'Defensive ballast that helps preserve capital under inflationary and rate-shock conditions.' },
                    { title: 'Why Bonds were selected', body: 'Lower-volatility hedging that controls drawdown while preserving income stability.' },
                    { title: 'Portfolio strengths', body: 'Balanced upside potential with discipline around concentration and drawdown exposure.' },
                    { title: 'Weaknesses', body: 'Technology concentration can increase sensitivity to sharp risk-off rotations.' },
                    { title: 'Suggested improvements', body: 'Add selective alternatives and increase diversification across non-correlated return streams.' },
                    { title: 'Confidence Score', body: '92% confidence based on current regime assumptions, scenario stress, and constraint realism.' }
                ].map(item => `<div class="insight-card"><h6 class="fw-semibold">${item.title}</h6><p class="text-muted mb-0">${item.body}</p></div>`).join('');
            }
        } catch (error) {
            const insightsPanel = document.getElementById('insightsPanel');
            if (insightsPanel) insightsPanel.innerHTML = '<div class="text-muted">Analytics unavailable.</div>';
        }
    };

    const handleOptimization = async () => {
        const button = document.getElementById('runOptimizationBtn');
        const progress = document.getElementById('optimizationProgress');
        const stepsList = document.getElementById('stepsList');
        const statusList = document.getElementById('statusList');
        if (!button || !progress || !stepsList || !statusList) return;

        const steps = ['Loading Market Data', 'Building Return Matrix', 'Computing Covariance Matrix', 'Validating Constraints', 'Running Classical Optimizer', 'Running Quantum Optimizer', 'Comparing Solutions', 'Generating AI Insights', 'Portfolio Ready'];
        const status = ['Connecting to market feed', 'Assembling expected returns', 'Estimating covariance structure', 'Checking concentration and liquidity bounds', 'Evaluating classical benchmark', 'Solving quantum-enhanced candidate', 'Ranking feasible solutions', 'Producing explainability narrative', 'Preparing final allocation'];
        button.disabled = true;
        button.textContent = 'Running...';
        progress.style.width = '0%';
        stepsList.innerHTML = '';
        statusList.innerHTML = '';

        for (let index = 0; index < steps.length; index += 1) {
            progress.style.width = `${((index + 1) / steps.length) * 100}%`;
            const li = document.createElement('li');
            li.textContent = steps[index];
            stepsList.appendChild(li);
            const statusText = document.createElement('div');
            statusText.className = 'alert-pill mb-2';
            statusText.textContent = status[index];
            statusList.appendChild(statusText);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        try {
            const response = await fetch('/api/optimize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ portfolioName: 'Quantum Growth Mandate', optimizationMethod: 'Hybrid' }) });
            const result = await response.json();
            statusList.innerHTML = `<div class="alert-pill">${result.status}: ${result.scenario}</div>`;
        } catch (error) {
            statusList.innerHTML = '<div class="alert-pill">Optimization request failed.</div>';
        }

        button.disabled = false;
        button.textContent = 'Run Optimization';
    };

    const handlePortfolioSubmit = async (event) => {
        event.preventDefault();
        const button = event.target.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.textContent = 'Submitting...';
        }

        const formData = Object.fromEntries(new FormData(event.target));
        const payload = {
            portfolioName: formData.portfolioName || 'Quantum Growth Mandate',
            investmentAmount: Number(formData.investmentAmount || 5000000),
            objective: formData.objective || 'Balanced',
            riskPreference: formData.riskPreference || 'Medium',
            investmentHorizon: formData.investmentHorizon || '5 Years',
            optimizationMethod: formData.optimizationMethod || 'Hybrid',
            maxAssetWeight: Number(formData.maxAssetWeight || 25),
            minAssetWeight: Number(formData.minAssetWeight || 3),
            sectorExposure: Number(formData.sectorExposure || 35),
            liquidity: Number(formData.liquidity || 0.2),
            transactionCost: Number(formData.transactionCost || 0.5),
            esgPreference: formData.esgPreference || 'Moderate',
            carbonLimit: Number(formData.carbonLimit || 15),
            taxPreference: formData.taxPreference || 'Balanced'
        };

        try {
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.status === 'optimized') {
                window.location.href = '/results';
            }
        } catch (error) {
            window.location.href = '/results';
        }
    };

    const handleReportExport = async (event) => {
        const button = event.target.closest('.report-btn');
        if (!button) return;
        const format = button.dataset.format;
        try {
            const response = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ format }) });
            const result = await response.json();
            const preview = document.getElementById('reportPreview');
            if (preview) preview.innerHTML = `<h6 class="fw-semibold">${format.toUpperCase()} generated</h6><p class="text-muted mb-0">${result.message}</p>`;
        } catch (error) {
            const preview = document.getElementById('reportPreview');
            if (preview) preview.innerHTML = '<p class="text-muted">Report export failed.</p>';
        }
    };

    renderAssetOptions();
    renderHistory();
    renderDashboardCharts();
    renderRiskPanel();
    renderLiveMarket();
    renderAlerts();
    renderAssistant();
    renderNotifications();
    renderProfile();
    renderResults();
    renderAnalytics();

    const portfolioForm = document.getElementById('portfolioForm');
    if (portfolioForm) portfolioForm.addEventListener('submit', handlePortfolioSubmit);

    const optimizationButton = document.getElementById('runOptimizationBtn');
    if (optimizationButton) optimizationButton.addEventListener('click', handleOptimization);

    const downloadButton = document.getElementById('downloadReportBtn');
    if (downloadButton) downloadButton.addEventListener('click', () => window.location.href = '/reports');

    document.querySelectorAll('a[href="#about-section"]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const target = document.getElementById('about-section');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.location.href = '/about';
            }
        });
    });

    document.querySelectorAll('.report-btn').forEach(button => button.addEventListener('click', handleReportExport));
});
