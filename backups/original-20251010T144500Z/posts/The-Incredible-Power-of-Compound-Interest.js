(function() {
  // Lazy-load Chart.js and then initialize charts
  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = function() { console.error('Failed to load', src); };
    document.head.appendChild(s);
  }

  function formatCurrencyTicks(value) {
    return '$' + Number(value).toLocaleString();
  }

  function createLineChart(ctx, labels, datasets, title, options) {
    return new Chart(ctx, {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: Object.assign({
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: !!title, text: title }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: formatCurrencyTicks } },
          x: { title: { display: true } }
        }
      }, options || {})
    });
  }

  function createBarChart(ctx, labels, dataset, title) {
    return new Chart(ctx, {
      type: 'bar',
      data: { labels: labels, datasets: [dataset] },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: !!title, text: title }
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: formatCurrencyTicks } },
          x: { title: { display: true } }
        }
      }
    });
  }

  function drawAliceBobCharts() {
    // Alice
    var startAge = 25;
    var endAge = 65;
    var investYears = 10;
    var totalYears = endAge - startAge + 1;
    var monthlyInvestment = 200;
    var annualReturn = 0.10;
    var monthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1;
    var balances = [];
    var balance = 0;

    for (var year = 0; year < totalYears; year++) {
      for (var month = 0; month < 12; month++) {
        if (year < investYears) { balance += monthlyInvestment; }
        balance *= (1 + monthlyReturn);
      }
      balances.push(Number(balance.toFixed(2)));
    }

    var years = [];
    for (var i = startAge; i <= endAge; i++) years.push(i);

    // Bob
    var bobStartAge = 25;
    var bobEndAge = 65;
    var bobInvestStart = 35;
    var bobInvestEnd = 65;
    var bobTotalYears = bobEndAge - bobStartAge + 1;
    var bobMonthlyInvestment = 200;
    var bobAnnualReturn = 0.10;
    var bobMonthlyReturn = Math.pow(1 + bobAnnualReturn, 1/12) - 1;
    var bobBalances = [];
    var bobBalance = 0;

    for (var y = 0; y < bobTotalYears; y++) {
      for (var m = 0; m < 12; m++) {
        if ((bobStartAge + y) >= bobInvestStart && (bobStartAge + y) <= bobInvestEnd) {
          bobBalance += bobMonthlyInvestment;
        }
        bobBalance *= (1 + bobMonthlyReturn);
      }
      bobBalances.push(Number(bobBalance.toFixed(2)));
    }

    // Draw charts if canvases exist
    var aliceCanvas = document.getElementById('aliceCompoundChart');
    if (aliceCanvas) {
      createLineChart(aliceCanvas.getContext('2d'), years, [{
        label: "Alice's Investment Value ($)",
        data: balances,
        borderColor: '#2a7ae2',
        backgroundColor: 'rgba(42,122,226,0.1)',
        fill: true,
        pointRadius: 2,
        tension: 0.15
      }], "Alice's Compound Interest Growth (Age 25-65)");
    }

    var bobCanvas = document.getElementById('bobCompoundChart');
    if (bobCanvas) {
      createLineChart(bobCanvas.getContext('2d'), years, [{
        label: "Bob's Investment Value ($)",
        data: bobBalances,
        borderColor: '#e27a2a',
        backgroundColor: 'rgba(226,122,42,0.1)',
        fill: true,
        pointRadius: 2,
        tension: 0.15
      }], "Bob's Compound Interest Growth (Age 25-65)");
    }

    var compCanvas = document.getElementById('comparisonCompoundChart');
    if (compCanvas) {
      createLineChart(compCanvas.getContext('2d'), years, [
        { label: "Alice's Investment Value ($)", data: balances, borderColor: '#2a7ae2', backgroundColor: 'rgba(42,122,226,0.08)', fill: false, pointRadius: 1.5, tension: 0.15 },
        { label: "Bob's Investment Value ($)", data: bobBalances, borderColor: '#e27a2a', backgroundColor: 'rgba(226,122,42,0.08)', fill: false, pointRadius: 1.5, tension: 0.15 }
      ], "Alice vs Bob: Compound Interest Growth (Age 25-65)");
    }
  }

  function drawComparisonInvestmentChart() {
    var yearsComp = [];
    for (var i = 0; i <= 40; i += 5) yearsComp.push(i);

    function compound(principal, rate, years) { return principal * Math.pow(1 + rate / 12, years * 12); }
    var savingsData = yearsComp.map(function(y) { return Number(compound(5000, 0.04, y).toFixed(2)); });
    function compoundYearly(principal, rate, years) { return principal * Math.pow(1 + rate, years); }
    var stockData = yearsComp.map(function(y) { return Number(compoundYearly(10000, 0.08, y).toFixed(2)); });

    var ctx = document.getElementById('comparisonInvestmentChart');
    if (!ctx) return;

    createLineChart(ctx.getContext('2d'), yearsComp.map(function(y){return y + ' yrs';}), [
      { label: "Savings Account ($5,000 at 4%)", data: savingsData, borderColor: '#2a7ae2', backgroundColor: 'rgba(42,122,226,0.08)', fill: false, pointRadius: 2, tension: 0.15 },
      { label: "Stock Market ($10,000 at 8%)", data: stockData, borderColor: '#e27a2a', backgroundColor: 'rgba(226,122,42,0.08)', fill: false, pointRadius: 2, tension: 0.15 }
    ], "Savings Account vs Stock Market Investment Growth");
  }

  function drawLongTermChart() {
    var ltYears = [];
    var ltBalances = [];
    var ltBalance = 0;
    var ltMonthlyInvestment = 1000;
    var ltAnnualReturn = 0.08;
    var ltMonthlyReturn = Math.pow(1 + ltAnnualReturn, 1/12) - 1;
    for (var year = 0; year <= 40; year++) {
      for (var month = 0; month < 12; month++) {
        ltBalance += ltMonthlyInvestment;
        ltBalance *= (1 + ltMonthlyReturn);
      }
      ltYears.push(year + 25);
      ltBalances.push(Number(ltBalance.toFixed(2)));
    }

    var ctx = document.getElementById('longTermCompoundChart');
    if (!ctx) return;
    createBarChart(ctx.getContext('2d'), ltYears.map(function(y){ return y % 5 === 0 ? y : ''; }), {
      label: 'Investment Value ($)', data: ltBalances, backgroundColor: 'rgba(42,122,226,0.45)', borderColor: '#2a7ae2', borderWidth: 1
    }, "$1,000/Month at 8% Annual Return (Age 25-65)");
  }

  function init() {
    // Load Chart.js then draw charts
    if (window.Chart) {
      drawAliceBobCharts();
      drawComparisonInvestmentChart();
      drawLongTermChart();
    } else {
      // Prefer a local copy under vendor/chartjs; fallback to CDN if local load fails
      var localPath = '../vendor/chartjs/chart.min.js';
      loadScript(localPath, function() { if (window.Chart) { drawAliceBobCharts(); drawComparisonInvestmentChart(); drawLongTermChart(); } else {
        // fallback to CDN
        loadScript('https://cdn.jsdelivr.net/npm/chart.js', function() { drawAliceBobCharts(); drawComparisonInvestmentChart(); drawLongTermChart(); });
      }});
    }
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
