/* ==========================================================================
   NEXUS // SHADOW TRACE - CORE APPLICATION CONTROLLER & SOUND SYNTHESIZER
   ========================================================================== */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  class CyberAudioSynth {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('NEXUS_SOUND') === 'true';
    }

    initCtx() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('NEXUS_SOUND', this.enabled ? 'true' : 'false');
      if (this.enabled) {
        this.initCtx();
        this.playBeep(880, 0.1);
      }
      return this.enabled;
    }

    playTyping() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400 + Math.random() * 400, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    }

    playBeep(freq = 800, duration = 0.08) {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }

    playWarning() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);
    }

    playConnect() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.04, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.15);
      });
    }

    playSuccess() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.05, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    }

    playTransition() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  const audio = new CyberAudioSynth();
  window.NEXUS_AUDIO = audio;

  // --- GLOBAL HUD & PAGE NAVIGATION ---
  function initGlobalHUD() {
    // Session ID setup
    let sessionId = sessionStorage.getItem('NEXUS_SESSION');
    if (!sessionId) {
      const randHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
      sessionId = `NX-${randHex()}-${randHex()}`;
      sessionStorage.setItem('NEXUS_SESSION', sessionId);
    }

    const sessionEl = document.getElementById('hudSessionId');
    if (sessionEl) sessionEl.textContent = sessionId;

    // Time Clock setup
    const timeEl = document.getElementById('hudLiveTime');
    if (timeEl) {
      const updateClock = () => {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        timeEl.textContent = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
      };
      updateClock();
      setInterval(updateClock, 1000);
    }

    // Sound toggle button setup
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
      const updateBtnText = () => {
        soundBtn.textContent = audio.enabled ? '🔊 SOUND: ON' : '🔇 SOUND: OFF';
      };
      updateBtnText();
      soundBtn.addEventListener('click', () => {
        audio.toggle();
        updateBtnText();
      });
    }

    // Intercept transition links
    document.querySelectorAll('.cyber-btn[data-target], .cyber-link[data-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target');
        if (target) navigateTo(target);
      });
    });
  }

  function navigateTo(url) {
    audio.playTransition();
    let overlay = document.getElementById('transitionOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'transitionOverlay';
      overlay.className = 'page-transition-overlay';
      overlay.innerHTML = '<div>INITIALIZING QUANTUM TRANSITION...</div>';
      document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
    setTimeout(() => {
      window.location.href = url;
    }, 350);
  }
  window.NEXUS_NAVIGATE = navigateTo;

  // --- PAGE ROUTER & SPECIFIC PAGE LOGIC ---
  document.addEventListener('DOMContentLoaded', () => {
    initGlobalHUD();

    const pageId = document.body.dataset.page;

    switch (pageId) {
      case 'home':
        initBootPage();
        break;
      case 'terminal':
        initTerminalPage();
        break;
      case 'location':
        initLocationPage();
        break;
      case 'mobile':
        initMobilePage();
        break;
      case 'calls':
        initCallsPage();
        break;
      case 'network':
        initNetworkPage();
        break;
      case 'final':
        initFinalPage();
        break;
    }
  });

  // ==========================================================================
  // PAGE 01 LOGIC — SYSTEM BOOT
  // ==========================================================================
  function initBootPage() {
    const lines = [
      "> Loading kernel...",
      "> Initializing encryption engine...",
      "> Connecting virtual network...",
      "> Loading trace protocol...",
      "> Synchronizing nodes...",
      "> Establishing secure session..."
    ];

    const logContainer = document.getElementById('bootTerminalLog');
    const actionBox = document.getElementById('bootActions');

    if (!logContainer || !actionBox) return;

    let delay = 600;
    lines.forEach((lineText, idx) => {
      setTimeout(() => {
        const lineEl = document.createElement('div');
        lineEl.className = 'boot-log-line';
        lineEl.textContent = lineText;
        logContainer.appendChild(lineEl);

        setTimeout(() => {
          lineEl.classList.add('visible');
          audio.playTyping();
        }, 50);

        if (idx === lines.length - 1) {
          setTimeout(() => {
            const readyEl = document.createElement('div');
            readyEl.className = 'boot-log-line success visible';
            readyEl.textContent = '[SYSTEM READY]';
            logContainer.appendChild(readyEl);
            audio.playSuccess();

            actionBox.classList.add('visible');
          }, 600);
        }
      }, delay);
      delay += 450;
    });
  }

  // ==========================================================================
  // PAGE 02 LOGIC — HACKER TERMINAL
  // ==========================================================================
  function initTerminalPage() {
    const screen = document.getElementById('terminalScreen');
    const input = document.getElementById('terminalInput');
    const side1 = document.getElementById('sideTerminal1');
    const side2 = document.getElementById('sideTerminal2');
    if (!screen || !input) return;

    const startupLogs = [
      { text: "> initializing secure shell...", cls: "log-info" },
      { text: "> loading virtual target profile...", cls: "log-info" },
      { text: "> establishing encrypted channel...", cls: "log-info" },
      { text: "> analyzing simulated traffic...", cls: "log-info" },
      { text: "> scanning virtual nodes...", cls: "log-warn" },
      { text: "> packet stream detected...", cls: "log-warn" },
      { text: "> decoding virtual payload...", cls: "log-info" },
      { text: "> trace protocol initialized...", cls: "log-success" },
      { text: "> target identified...", cls: "log-success" },
      { text: "> ACCESS LEVEL: ROOT", cls: "log-root" }
    ];

    let delay = 400;
    startupLogs.forEach((item, idx) => {
      setTimeout(() => {
        appendTerminalLine(item.text, item.cls);
        audio.playTyping();
        if (idx === startupLogs.length - 1) {
          appendTerminalLine("\nType 'help' to view available fictional simulation commands.\n", "log-info");
          audio.playConnect();
        }
      }, delay);
      delay += 350;
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim().toLowerCase();
        appendTerminalLine(`NEXUS@SYSTEM:~$ ${cmd}`, 'log-info');
        audio.playBeep(900, 0.05);
        input.value = '';
        handleTerminalCommand(cmd);
      }
    });

    // Auto-running Side Terminal 1 (Decryption & Hex Stream)
    if (side1) {
      const randHex = (len) => Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
      const addresses = ['0x7FFF982A', '0x7FFF9840', '0x4A008F1C', '0x1004B990', '0x8820EF10'];

      setInterval(() => {
        const addr = addresses[Math.floor(Math.random() * addresses.length)];
        const div = document.createElement('div');

        if (Math.random() > 0.3) {
          div.textContent = `[${addr}] ${randHex(2)} ${randHex(2)} ${randHex(2)} ${randHex(2)} ${randHex(2)} ${randHex(2)} ${randHex(2)} ${randHex(2)}`;
          div.style.color = 'var(--cyan-primary)';
        } else {
          div.textContent = `[DECRYPT RSA-4096] BLOCK #${Math.floor(1000 + Math.random() * 9000)} OK`;
          div.style.color = 'var(--neon-green)';
        }

        side1.appendChild(div);
        if (side1.children.length > 40) side1.removeChild(side1.firstChild);
        side1.scrollTop = side1.scrollHeight;
      }, 300);
    }

    // Auto-running Side Terminal 2 (Packet Sniffer Stream)
    if (side2) {
      const ports = [22, 80, 443, 8080, 3306, 5432];
      const ips = ['192.168.1.10', '192.168.1.14', '10.0.4.88', '10.0.8.105'];

      setInterval(() => {
        const srcIp = ips[Math.floor(Math.random() * ips.length)];
        const tgtIp = ips[Math.floor(Math.random() * ips.length)];
        const port = ports[Math.floor(Math.random() * ports.length)];
        const div = document.createElement('div');

        if (Math.random() > 0.4) {
          div.textContent = `[SNIFF] ${srcIp}:${port} -> ${tgtIp} [ACK] PUSH`;
          div.style.color = 'var(--cyan-primary)';
        } else {
          div.textContent = `[SCAN] PORT ${port}/TCP OPEN ON ${tgtIp}`;
          div.style.color = 'var(--amber-warning)';
        }

        side2.appendChild(div);
        if (side2.children.length > 40) side2.removeChild(side2.firstChild);
        side2.scrollTop = side2.scrollHeight;
      }, 450);
    }
  }

  function appendTerminalLine(text, className = '') {
    const screen = document.getElementById('terminalScreen');
    if (!screen) return;
    const div = document.createElement('div');
    div.className = `terminal-line ${className}`;
    div.textContent = text;
    screen.appendChild(div);
    screen.scrollTop = screen.scrollHeight;
  }

  function handleTerminalCommand(cmd) {
    const primaryCmd = cmd.split(' ')[0];

    switch (primaryCmd) {
      case 'help':
        appendTerminalLine('[AVAILABLE SIMULATION COMMANDS]', 'log-success');
        appendTerminalLine('  help      - Display this command menu');
        appendTerminalLine('  scan      - Initiate virtual node scan');
        appendTerminalLine('  trace     - Display active trace parameters');
        appendTerminalLine('  status    - Show simulated target status');
        appendTerminalLine('  hack      - Execute simulated breach sequence');
        appendTerminalLine('  ping      - Ping virtual target node');
        appendTerminalLine('  decrypt   - Run simulated RSA decryption');
        appendTerminalLine('  inject    - Inject simulated payload');
        appendTerminalLine('  nmap      - Run virtual port scanner');
        appendTerminalLine('  cat / ls  - Inspect fictional virtual files');
        appendTerminalLine('  clear     - Clear terminal screen');
        appendTerminalLine('  device    - Jump to mobile device trace page');
        appendTerminalLine('  calls     - Jump to call intercept page');
        appendTerminalLine('  map       - Jump to location trace map page');
        appendTerminalLine('  exit      - Return to system boot page');
        appendTerminalLine('  * Any typed command will run simulated execution *', 'log-warn');
        break;
      case 'scan':
      case 'nmap':
        appendTerminalLine('[SCAN] Initializing virtual port & node scan...', 'log-info');
        setTimeout(() => appendTerminalLine('PORT 22/TCP   ........ OPEN [SSH-2.0-OpenSSH_8.9]', 'log-success'), 300);
        setTimeout(() => appendTerminalLine('PORT 80/TCP   ........ OPEN [HTTP/1.1 Nginx]', 'log-success'), 600);
        setTimeout(() => appendTerminalLine('PORT 443/TCP  ........ OPEN [HTTPS/TLSv1.3]', 'log-success'), 900);
        setTimeout(() => appendTerminalLine('PORT 8080/TCP ........ ENCRYPTED [SIMULATED TARGET]', 'log-warn'), 1200);
        setTimeout(() => appendTerminalLine('Virtual scan complete. 4 open ports identified.', 'log-info'), 1500);
        break;
      case 'trace':
        appendTerminalLine('[TRACE DATA] Target signal strength: 87%', 'log-info');
        appendTerminalLine('Lat: 11.0168 | Long: 76.9558 (Fictional Coordinates)', 'log-info');
        break;
      case 'status':
        appendTerminalLine('SYSTEM: ONLINE | SESSION: ACTIVE | TARGET: LOCKED', 'log-success');
        break;
      case 'hack':
      case 'exploit':
      case 'inject':
        appendTerminalLine('[SIMULATION MODE] Initializing virtual breach...', 'log-warn');
        audio.playWarning();
        setTimeout(() => appendTerminalLine('Analyzing fictional security layer...', 'log-info'), 400);
        setTimeout(() => appendTerminalLine('Virtual firewall detected... Bypassing simulated tokens...', 'log-info'), 800);
        setTimeout(() => appendTerminalLine('Running cinematic sequence...', 'log-warn'), 1200);
        setTimeout(() => {
          appendTerminalLine('ACCESS GRANTED - SIMULATED ROOT PRIVILEGES OBTAINED', 'log-root');
          audio.playSuccess();
        }, 1600);
        break;
      case 'ping':
        appendTerminalLine('PING 10.0.4.88 (10.0.4.88): 56 data bytes', 'log-info');
        setTimeout(() => appendTerminalLine('64 bytes from 10.0.4.88: icmp_seq=0 ttl=64 time=12.4 ms', 'log-success'), 200);
        setTimeout(() => appendTerminalLine('64 bytes from 10.0.4.88: icmp_seq=1 ttl=64 time=11.8 ms', 'log-success'), 400);
        setTimeout(() => appendTerminalLine('--- 10.0.4.88 ping statistics --- 2 packets transmitted, 0% packet loss', 'log-info'), 600);
        break;
      case 'decrypt':
        appendTerminalLine('[DECRYPT] Reading simulated payload hash...', 'log-info');
        setTimeout(() => appendTerminalLine('Applying simulated private key 0x7FFF982A...', 'log-warn'), 300);
        setTimeout(() => appendTerminalLine('RSA-4096 DECRYPTION COMPLETE: Payload string decrypted.', 'log-success'), 700);
        audio.playSuccess();
        break;
      case 'ls':
      case 'dir':
        appendTerminalLine('system_cache.sim    encrypted_media.sim    device_log.sim    profile_data.sim', 'log-info');
        break;
      case 'cat':
        appendTerminalLine('[FILE CONTENTS: simulated_config.sys]', 'log-info');
        appendTerminalLine('  TARGET_IP="10.0.4.88"', 'log-success');
        appendTerminalLine('  ENCRYPTION="AES-256-SIM"', 'log-success');
        appendTerminalLine('  ACCESS_LEVEL="ROOT"', 'log-success');
        break;
      case 'whoami':
        appendTerminalLine('root@nexus-shadow-trace (SIMULATED PRIVILEGED USER)', 'log-root');
        break;
      case 'clear':
        const screen = document.getElementById('terminalScreen');
        if (screen) screen.innerHTML = '';
        break;
      case 'device':
        window.NEXUS_NAVIGATE('mobile.html');
        break;
      case 'calls':
        window.NEXUS_NAVIGATE('calls.html');
        break;
      case 'map':
        window.NEXUS_NAVIGATE('location.html');
        break;
      case 'exit':
        window.NEXUS_NAVIGATE('index.html');
        break;
      case '':
        break;
      default:
        // Execute dynamic fictional hacker sequence for any custom text typed by user!
        appendTerminalLine(`[EXEC] Initializing fictional script '${cmd}'...`, 'log-warn');
        audio.playBeep(700, 0.08);
        setTimeout(() => appendTerminalLine(`> Resolving simulated target parameters for '${cmd}'...`, 'log-info'), 300);
        setTimeout(() => appendTerminalLine(`> Executing virtual payload & bypassing sandbox filters...`, 'log-info'), 600);
        setTimeout(() => {
          appendTerminalLine(`[SUCCESS] Execution of '${cmd}' complete. Simulated output generated.`, 'log-success');
          audio.playSuccess();
        }, 1000);
        break;
    }
  }

  // ==========================================================================
  // PAGE 03 LOGIC — LOCATION TRACE
  // ==========================================================================
  function initLocationPage() {
    const traceBtn = document.getElementById('startTraceBtn');
    const locBtn = document.getElementById('useMyLocationBtn');
    const logBox = document.getElementById('locationLogBox');
    const latVal = document.getElementById('latVal');
    const longVal = document.getElementById('longVal');
    const statusVal = document.getElementById('targetStatusVal');

    if (traceBtn) {
      traceBtn.addEventListener('click', () => {
        audio.playWarning();
        if (logBox) logBox.textContent = 'ACQUIRING SIGNAL...';

        setTimeout(() => {
          if (logBox) logBox.textContent = 'SIGNAL DETECTED... LOCKING TARGET...';
          audio.playBeep(900, 0.1);
        }, 800);

        setTimeout(() => {
          if (logBox) logBox.textContent = 'TRACE ESTABLISHED // TARGET LOCKED';
          if (statusVal) {
            statusVal.textContent = 'LOCKED (100%)';
            statusVal.style.color = 'var(--neon-green)';
          }
          audio.playSuccess();
        }, 1800);
      });
    }

    if (locBtn) {
      locBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          if (logBox) logBox.textContent = 'GEOLOCATION NOT SUPPORTED BY BROWSER';
          return;
        }

        if (logBox) logBox.textContent = 'REQUESTING BROWSER GEOLOCATION PERMISSION...';
        audio.playBeep(700, 0.1);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude.toFixed(4);
            const long = pos.coords.longitude.toFixed(4);
            if (latVal) latVal.textContent = lat;
            if (longVal) longVal.textContent = long;
            if (logBox) logBox.textContent = `USER LOCATION ACQUIRED: LAT ${lat}, LONG ${long}`;
            audio.playSuccess();
          },
          (err) => {
            if (logBox) logBox.textContent = 'LOCATION ACCESS DENIED OR UNAVAILABLE';
            audio.playWarning();
          }
        );
      });
    }
  }

  // ==========================================================================
  // PAGE 04 LOGIC — MOBILE DEVICE SIMULATION
  // ==========================================================================
  function initMobilePage() {
    const tabs = document.querySelectorAll('.phone-tab-btn');
    const content = document.getElementById('phoneContentBody');
    const overlay = document.getElementById('extractionOverlay');
    const bar = document.getElementById('progressBarInner');
    const percentTxt = document.getElementById('progressPercent');
    const traceBtn = document.getElementById('initiateDeviceTraceBtn');

    const tabData = {
      calls: [
        { label: "+91 •••• ••4821", detail: "UNKNOWN | 14:32" },
        { label: "+91 •••• ••1934", detail: "PRIVATE | 12:18" },
        { label: "+91 •••• ••8829", detail: "ENCRYPTED | 09:45" }
      ],
      messages: [
        { label: "SMS #8491", detail: "Payload packet ready." },
        { label: "SMS #8492", detail: "Meeting at node 13." }
      ],
      contacts: [
        { label: "OPERATIVE ALPHA", detail: "SECURE CHAN #1" },
        { label: "OPERATIVE BRAVO", detail: "SECURE CHAN #4" }
      ],
      files: [
        { label: "system_cache.sim", detail: "2.4 MB" },
        { label: "encrypted_media.sim", detail: "18.9 MB" },
        { label: "device_log.sim", detail: "512 KB" }
      ],
      camera: [
        { label: "SIMULATED FEED #1", detail: "OFFLINE / ENCRYPTED" }
      ],
      mic: [
        { label: "AUDIO REC #001", detail: "00:42 DURATION" }
      ]
    };

    function renderTab(tabKey) {
      if (!content) return;
      content.innerHTML = '';
      const items = tabData[tabKey] || [];
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'phone-item-card';
        card.innerHTML = `
          <div>
            <div style="font-weight:bold; color:var(--cyan-primary);">${item.label}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${item.detail}</div>
          </div>
          <button class="cyber-btn cyber-btn-cyan extract-btn" style="padding:4px 10px; font-size:0.65rem;">EXTRACT</button>
        `;
        content.appendChild(card);
      });

      document.querySelectorAll('.extract-btn').forEach(btn => {
        btn.addEventListener('click', runSimulatedExtraction);
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        audio.playTyping();
        renderTab(tab.dataset.tab);
      });
    });

    renderTab('calls');

    function runSimulatedExtraction() {
      if (!overlay || !bar || !percentTxt) return;
      overlay.classList.add('active');
      audio.playWarning();
      let p = 0;
      const interval = setInterval(() => {
        p += 5;
        bar.style.width = p + '%';
        percentTxt.textContent = p + '%';
        audio.playTyping();

        if (p >= 100) {
          clearInterval(interval);
          audio.playSuccess();
          setTimeout(() => {
            overlay.classList.remove('active');
          }, 600);
        }
      }, 70);
    }

    if (traceBtn) {
      traceBtn.addEventListener('click', runSimulatedExtraction);
    }
  }

  // ==========================================================================
  // PAGE 05 LOGIC — CALL INTERCEPTION
  // ==========================================================================
  function initCallsPage() {
    const acceptBtn = document.getElementById('acceptCallBtn');
    const declineBtn = document.getElementById('declineCallBtn');
    const callStatus = document.getElementById('callStatusLabel');
    const timerVal = document.getElementById('callTimerVal');
    const subtitleBox = document.getElementById('callSubtitlesBox');
    const canvas = document.getElementById('waveformCanvas');

    let isCallActive = false;
    let timerInterval = null;
    let secondsElapsed = 0;
    let animFrameId = null;

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        if (isCallActive) return;
        isCallActive = true;
        audio.playConnect();

        if (callStatus) callStatus.textContent = 'VOICE CHANNEL ACTIVE';
        if (callStatus) callStatus.style.color = 'var(--neon-green)';

        const subtitleList = [
          "[ SIGNAL DETECTED ]",
          "[ AUDIO CHANNEL SIMULATED ]",
          "[ DECODING ENCRYPTED FREQUENCY... ]",
          "[ CONNECTION STABLE ]",
          "[ TRANSMISSION ENDED ]"
        ];

        let subIdx = 0;
        const subInterval = setInterval(() => {
          if (subtitleBox && subIdx < subtitleList.length) {
            subtitleBox.textContent = subtitleList[subIdx];
            audio.playBeep(750, 0.05);
            subIdx++;
          } else {
            clearInterval(subInterval);
          }
        }, 2000);

        secondsElapsed = 0;
        timerInterval = setInterval(() => {
          secondsElapsed++;
          const m = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
          const s = String(secondsElapsed % 60).padStart(2, '0');
          if (timerVal) timerVal.textContent = `${m}:${s}`;
        }, 1000);

        renderWaveform();
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        isCallActive = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animFrameId);
        audio.playWarning();
        if (callStatus) callStatus.textContent = 'SIGNAL TERMINATED';
        if (callStatus) callStatus.style.color = 'var(--red-danger)';
        if (subtitleBox) subtitleBox.textContent = '[ CONNECTION CLOSED ]';
      });
    }

    function renderWaveform() {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let step = 0;

      function draw() {
        if (!isCallActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const width = canvas.width;
        const height = canvas.height;
        const midY = height / 2;

        for (let x = 0; x < width; x++) {
          const y = midY + Math.sin((x + step) * 0.05) * 20 * Math.sin(step * 0.03);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
        step += 4;
        animFrameId = requestAnimationFrame(draw);
      }

      draw();
    }
  }

  // ==========================================================================
  // PAGE 06 LOGIC — NETWORK TRACE
  // ==========================================================================
  function initNetworkPage() {
    const canvas = document.getElementById('networkCanvas');
    const logBox = document.getElementById('networkLogBox');
    const packetCountEl = document.getElementById('packetCountVal');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });

    const nodes = [
      { id: 'TARGET', x: width * 0.5, y: height * 0.5, isTarget: true },
      { id: 'NODE-01', x: width * 0.2, y: height * 0.3, isTarget: false },
      { id: 'NODE-02', x: width * 0.8, y: height * 0.25, isTarget: false },
      { id: 'NODE-07', x: width * 0.75, y: height * 0.7, isTarget: false },
      { id: 'NODE-13', x: width * 0.25, y: height * 0.75, isTarget: false },
      { id: 'NODE-21', x: width * 0.5, y: height * 0.2, isTarget: false }
    ];

    const packets = [];
    let packetCounter = 1842;

    function spawnPacket() {
      const source = nodes[Math.floor(Math.random() * nodes.length)];
      let target = nodes[Math.floor(Math.random() * nodes.length)];
      while (target === source) {
        target = nodes[Math.floor(Math.random() * nodes.length)];
      }

      packets.push({
        sx: source.x,
        sy: source.y,
        tx: target.x,
        ty: target.y,
        progress: 0,
        speed: 0.01 + Math.random() * 0.015,
        srcId: source.id,
        tgtId: target.id
      });

      packetCounter++;
      if (packetCountEl) packetCountEl.textContent = packetCounter;

      if (logBox && Math.random() > 0.4) {
        const div = document.createElement('div');
        div.textContent = `PACKET ${packetCounter} → ${source.id} to ${target.id} [AES-SIM ENCRYPTED]`;
        logBox.appendChild(div);
        logBox.scrollTop = logBox.scrollHeight;
      }
    }

    setInterval(spawnPacket, 400);

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw Connections
      nodes.forEach(n1 => {
        nodes.forEach(n2 => {
          if (n1 !== n2) {
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        });
      });

      // Update & Draw Packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;

        const curX = p.sx + (p.tx - p.sx) * p.progress;
        const curY = p.sy + (p.ty - p.sy) * p.progress;

        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(curX, curY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.progress >= 1) {
          packets.splice(i, 1);
        }
      }

      // Draw Nodes
      nodes.forEach(n => {
        ctx.fillStyle = n.isTarget ? '#ff0055' : '#00ff88';
        ctx.shadowColor = n.isTarget ? '#ff0055' : '#00ff88';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.isTarget ? 10 : 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = '12px Share Tech Mono';
        ctx.fillText(n.id, n.x + 12, n.y + 4);
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // ==========================================================================
  // PAGE 07 LOGIC — FINAL ACCESS
  // ==========================================================================
  function initFinalPage() {
    audio.playSuccess();
  }

})();
