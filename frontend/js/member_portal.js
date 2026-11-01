/**
 * The Society — Member Interface Controller
 * Manages 3-Tab Navigation: My Profile, Communications, Codename Dossier
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Only execute on Member Portal (index.html)
  if (!document.getElementById('memberLayout')) return;

  // Verify authentication session via Supabase or LocalStorage
  let session = await getSupabaseSession();
  if (!session || !session.access_token) {
    const local = getLocalSession();
    if (local && local.access_token) {
      session = local;
      if (supabaseClient) {
        try {
          await supabaseClient.auth.setSession({
            access_token: local.access_token,
            refresh_token: local.access_token
          });
        } catch (_) {}
      }
    }
  }

  if (!session || !session.access_token) {
    localStorage.removeItem('pulse_session');
    window.location.href = 'login.html';
    return;
  }

  // Ensure local storage is in sync
  localStorage.setItem('pulse_session', JSON.stringify({
    access_token: session.access_token,
    user: session.user || {}
  }));

  // Bind Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      localStorage.removeItem('pulse_session');
      if (supabaseClient) {
        try { await supabaseClient.auth.signOut(); } catch (_) {}
      }
      window.location.href = 'login.html';
    });
  }

  // Set up tab switching
  setupMemberTabs();

  // Load and render member profile dossier
  await loadMemberDossier();
});

/**
 * Tab Navigation Controller
 */
function setupMemberTabs() {
  const navItems = document.querySelectorAll('.society-nav-item[data-tab]');
  const tabPanels = document.querySelectorAll('.society-tab-panel');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');

      // Update active nav rail item
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Update active tab panel
      tabPanels.forEach(panel => {
        if (panel.id === targetTab) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      // Save tab selection preference
      sessionStorage.setItem('society_active_tab', targetTab);

      // Trigger chat layout adjustment if switching to Communications
      if (targetTab === 'tabCommunications' && window.scrollToBottom) {
        setTimeout(window.scrollToBottom, 50);
      }
    });
  });

  // Restore previous active tab or default to Profile
  const savedTab = sessionStorage.getItem('society_active_tab') || 'tabProfile';
  const defaultItem = document.querySelector(`.society-nav-item[data-tab="${savedTab}"]`);
  if (defaultItem) defaultItem.click();
}

/**
 * Fetch and Render Member Dossier
 */
async function loadMemberDossier() {
  try {
    const profile = await api.get('/members/me');
    if (!profile) return;

    // Render Rail Info
    const railCodename = document.getElementById('railCodename');
    const railMemberNum = document.getElementById('railMemberNum');
    const railAvatar = document.getElementById('railAvatarText');
    const founderLink = document.getElementById('founderPortalLink');

    if (railCodename) railCodename.textContent = profile.codename || 'MEMBER';
    if (railMemberNum) railMemberNum.textContent = profile.member_number || 'SOC-0000';
    if (railAvatar) railAvatar.textContent = (profile.codename || 'M')[0].toUpperCase();

    // Persist profile and role for seamless chamber navigation
    try {
      localStorage.setItem('society_user_profile', JSON.stringify(profile));
      localStorage.setItem('society_user_role', profile.society_role || 'member');
    } catch (_) {}

    // Show Founder Portal link if user possesses Founder role
    if (founderLink && profile.society_role === 'founder') {
      founderLink.style.display = 'flex';
    }

    // Render Tab 1: My Profile
    const dCodename = document.getElementById('dossierCodename');
    const dNumber = document.getElementById('dossierNumber');
    const dRank = document.getElementById('dossierRank');
    const dDesignation = document.getElementById('dossierDesignation');
    const dPoints = document.getElementById('dossierPoints');
    const dLevel = document.getElementById('dossierLevel');
    const dInduction = document.getElementById('dossierInduction');
    const dProgBar = document.getElementById('dossierProgFill');
    const dLegendsBadge = document.getElementById('legendsBadge');

    if (dCodename) dCodename.textContent = profile.codename || 'Initiate';
    if (dNumber) dNumber.textContent = profile.member_number || 'SOC-PENDING';
    if (dRank) dRank.textContent = profile.society_rank || 'Initiate';
    if (dDesignation) dDesignation.textContent = profile.designation || 'Society Member';
    if (dPoints) dPoints.textContent = (profile.points || 0).toLocaleString();
    if (dLevel) dLevel.textContent = `Level ${profile.progression_level || 1}`;
    
    if (dProgBar) {
      const percentage = Math.min(100, Math.max(10, (profile.points % 1000) / 10));
      dProgBar.style.width = `${percentage}%`;
    }

    if (dInduction && profile.induction_date) {
      const date = new Date(profile.induction_date);
      dInduction.textContent = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    if (dLegendsBadge) {
      dLegendsBadge.style.display = profile.is_hall_of_legends ? 'inline-flex' : 'none';
    }

    // Render Tab 3: Codename Dossier
    renderCodenameNarrative(profile);

  } catch (err) {
    console.error('Failed to load member dossier:', err);
    if (err.message && err.message.includes('401')) {
      window.location.href = 'login.html';
    }
  }
}

/**
 * Render Codename Intellectual & Symbolic Narrative
 */
function renderCodenameNarrative(profile) {
  const title = document.getElementById('codenameTitle');
  const narrative = document.getElementById('codenameNarrativeText');
  const attrCodename = document.getElementById('attrCodename');
  const attrNum = document.getElementById('attrNumber');
  const attrRank = document.getElementById('attrRank');
  const attrRole = document.getElementById('attrRole');
  const attrStatus = document.getElementById('attrStatus');

  const codename = profile.codename || 'Society Member';
  if (title) title.textContent = codename.toUpperCase();
  if (attrCodename) attrCodename.textContent = codename;
  if (attrNum) attrNum.textContent = profile.member_number || 'SOC-0000';
  if (attrRank) attrRank.textContent = profile.society_rank || 'Initiate';
  if (attrRole) attrRole.textContent = (profile.society_role || 'member').toUpperCase();
  if (attrStatus) attrStatus.textContent = profile.is_active ? 'Active & In Good Standing' : 'Suspended';

  // Curated Intellectual Symbolism Narratives
  const narratives = {
    'Sovereign': 'Conferred upon the founding leadership of The Society. Represents supreme strategic authority, absolute stewardship of the institution\'s constitutional principles, and the burden of ultimate responsibility for public welfare and accountability.',
    'Vanguard': 'Derived from the military and intellectual forefront. Bestowed upon fellows tasked with pioneering lawful inquiry, uncovering concealed truths, and advancing public accountability where traditional avenues falter.',
    'Sentinel': 'The guardian archetype of the institutional order. Conferred upon members whose analytical rigor and steadfast vigilance protect the integrity of the Society\'s research, ethical boundaries, and member records.',
    'Oracle': 'Symbolising profound intellectual foresight and synthesis of complex knowledge. Conferred upon researchers whose analytical discernment guides strategic policy recommendations and structural reform.'
  };

  const defaultNarrative = `The designation "${codename}" represents a solemn covenant between the Fellow and The Society. Conferred under the charter of merit, intellectual rectitude, and disciplined discretion, this identity supersedes personal distinction to advance the higher imperatives of public welfare, lawful investigation, and institutional legacy.`;

  if (narrative) {
    narrative.textContent = narratives[codename] || defaultNarrative;
  }
}

/**
 * Session Helper
 */
function getLocalSession() {
  try {
    const raw = localStorage.getItem('pulse_session');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
