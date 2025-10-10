(function(){
  // Small shared chart initializer for pages that include JSON <script> configs next to canvases
  function parseJSON(id){
    var el = document.getElementById(id+'-config');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch(e) { console.error('Invalid JSON for', id, e); return null; }
  }

  // lightweight debug wrapper so we can see what's happening at runtime
  function debugLog(){
    if (window && window.console && window.console.debug) {
      try { window.console.debug.apply(console, arguments); } catch(e){ window.console.log.apply(console, arguments); }
    }
  }

  function formatCurrencyTicks(value){ return '$' + Number(value).toLocaleString(); }

  function makeLine(ctx, labels, datasets, title, opts){
    return new Chart(ctx, Object.assign({
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: Object.assign({
        responsive: true,
        plugins: { legend: { display: true }, title: { display: !!title, text: title } },
        scales: { y: { beginAtZero: true, ticks: { callback: formatCurrencyTicks } }, x: { title: { display: true } } }
      }, opts || {})
    }, {}));
  }

  function makeBar(ctx, labels, dataset, title){
    return new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [dataset] }, options: { responsive:true, plugins:{legend:{display:false}, title:{display:!!title,text:title}}, scales:{y:{beginAtZero:true,ticks:{callback:formatCurrencyTicks}}, x:{title:{display:true}} } } });
  }

  function computePeriodicSeries(cfg){
    var start = cfg.startAge || 25;
    var end = cfg.endAge || 65;
    var years = [];
    for(var i=start;i<=end;i++) years.push(i);
    var monthlyReturn = Math.pow(1 + (cfg.annualReturn||0)/1, 1/12) - 1; // approximate
    var balances = [];
    var balance = 0;
    var investYears = cfg.investYears || 0;
    for(var y=0;y<years.length;y++){
      for(var m=0;m<12;m++){
        if (cfg.mode==='periodic' && y < investYears) balance += cfg.monthlyInvestment || 0;
        if (cfg.mode==='periodic-range'){
          var age = start + y;
          if (age >= (cfg.investStartAge||0) && age <= (cfg.investEndAge||0)) balance += cfg.monthlyInvestment||0;
        }
        balance *= (1 + monthlyReturn);
      }
      balances.push(Number(balance.toFixed(2)));
    }
    return { labels: years, data: balances };
  }

  function initOne(id){
    var canvas = document.getElementById(id);
    if (!canvas) return;
    var cfg = parseJSON(id);
    if (!cfg) return;

    debugLog('[charts-init] initOne:', id, cfg.mode);

    if (cfg.mode==='periodic' || cfg.mode==='periodic-range'){
      var series = computePeriodicSeries(cfg);
      makeLine(canvas.getContext('2d'), series.labels, [{ label: cfg.label || 'Value', data: series.data, borderColor: cfg.color||'#2a7ae2', backgroundColor:'rgba(42,122,226,0.1)', fill:true, pointRadius:2, tension:0.15 }], cfg.title || '');
    }
  }

  function initCompare(id){
    var cfg = parseJSON(id);
    if (!cfg) return;
    var canvas = document.getElementById(id);
    if (!canvas) return;
    var labels = null;
    var datasets = [];
    (cfg.series || []).forEach(function(s){
      var el = document.getElementById(s+'-config');
      if (!el) return;
      try{
        var scfg = JSON.parse(el.textContent);
        var series = computePeriodicSeries(scfg);
        labels = series.labels;
        datasets.push({ label: scfg.label || s, data: series.data, borderColor: scfg.color|| (datasets.length? '#e27a2a' : '#2a7ae2'), backgroundColor: datasets.length? 'rgba(226,122,42,0.08)' : 'rgba(42,122,226,0.08)', fill:false, pointRadius:1.5, tension:0.15 });
      }catch(e){console.error('parse',s,e);}    });
    debugLog('[charts-init] initCompare:', id, 'series count=', datasets.length);
    if (labels && datasets.length) makeLine(canvas.getContext('2d'), labels, datasets, cfg.title||'');
  }

  function computeLongTermSeries(cfg){
    var start = cfg.startAge || 25;
    var years = cfg.years || 40;
    var labels = [];
    for(var i=0;i<years;i++) labels.push(start + i);
    var monthlyReturn = Math.pow(1 + (cfg.annualReturn||0), 1/12) - 1;
    var balances = [];
    var balance = 0;
    for(var y=0;y<years;y++){
      for(var m=0;m<12;m++){
        balance += cfg.monthlyInvestment || 0;
        balance *= (1 + monthlyReturn);
      }
      balances.push(Number(balance.toFixed(2)));
    }
    return { labels: labels, data: balances };
  }

  function computeInvestmentCompare(cfg){
    var years = cfg.years || [0,5,10,15,20,25,30,35,40];
    var labels = years.map(function(y){ return y + ' yrs'; });
    var datasets = [];
    (cfg.series || []).forEach(function(s, idx){
      var data = years.map(function(y){
        if (s.compound === 'monthly') return Number((s.principal * Math.pow(1 + s.rate/12, y*12)).toFixed(2));
        return Number((s.principal * Math.pow(1 + s.rate, y)).toFixed(2));
      });
      datasets.push({ label: s.label || ('series' + idx), data: data, borderColor: idx? '#e27a2a' : '#2a7ae2', backgroundColor: idx? 'rgba(226,122,42,0.08)' : 'rgba(42,122,226,0.08)', fill:false, pointRadius:2, tension:0.15 });
    });
    return { labels: labels, datasets: datasets };
  }

  function initAll(){
    if (!window.Chart) { console.warn('Chart.js not loaded'); return; }
    debugLog('[charts-init] Chart.js found:', !!window.Chart);
    // init known charts
    ['aliceCompoundChart','bobCompoundChart','comparisonCompoundChart','comparisonInvestmentChart','longTermCompoundChart'].forEach(function(id){
      var cfgEl = document.getElementById(id+'-config');
      if (!cfgEl) return;
      var cfg = JSON.parse(cfgEl.textContent);
      debugLog('[charts-init] initAll - found config for', id, 'mode=', cfg.mode);
      if (cfg.mode==='compare') initCompare(id);
      else if (cfg.mode==='periodic' || cfg.mode==='periodic-range') initOne(id);
      else if (cfg.mode==='longterm'){
        var canvas = document.getElementById(id);
        if (!canvas) return;
        var series = computeLongTermSeries(cfg);
        makeBar(canvas.getContext('2d'), series.labels, { label: cfg.label || 'Value', data: series.data, backgroundColor: 'rgba(42,122,226,0.45)', borderColor: '#2a7ae2', borderWidth: 1 }, cfg.title || '');
      }
      else if (cfg.mode==='investment-compare'){
        var canvas = document.getElementById(id);
        if (!canvas) return;
        var res = computeInvestmentCompare(cfg);
        makeLine(canvas.getContext('2d'), res.labels, res.datasets, cfg.title || '');
      }
    });
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();
})();
