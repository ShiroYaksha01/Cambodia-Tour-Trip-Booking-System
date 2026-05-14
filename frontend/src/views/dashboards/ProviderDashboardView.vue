<template>
  <main class="provider-shell">
    <DashboardSidebar role="provider" />

    <section class="provider-content">
      <header class="topbar">
        <div class="topbar__left">
          <h1>Inventory & Pricing</h1>
          <span class="sync-pill">⟳ Syncing: All OTAs</span>
        </div>

        <div class="provider-profile">
          <button class="icon-button" type="button" aria-label="Notifications">🔔</button>
          <div class="provider-profile__text">
            <strong>The Heritage Curator</strong>
            <span>Master Admin</span>
          </div>
          <div class="provider-avatar">AT</div>          <LogoutButton />        </div>
      </header>

      <section class="summary-grid" id="overview">
        <article class="summary-card summary-card--teal">
          <span>AVG. OCCUPANCY</span>
          <strong>84.2%</strong>
          <small>+12% from March</small>
        </article>
        <article class="summary-card summary-card--gold">
          <span>REVPAR</span>
          <strong>$142.50</strong>
          <small>Optimal Pricing Active</small>
        </article>
        <article class="summary-card summary-card--red">
          <span>LOW STOCK ALERTS</span>
          <strong>04</strong>
          <small>1 action required: April 14</small>
        </article>
        <article class="summary-card summary-card--forest">
          <span>KHMER NEW YEAR</span>
          <strong>98%</strong>
          <small>Peak Demand Season</small>
        </article>
      </section>

      <section class="workspace-grid">
        <article class="matrix-panel" id="matrix">
          <div class="matrix-toolbar">
            <button type="button" class="date-nav">‹</button>
            <h2>April 2024</h2>
            <button type="button" class="date-nav">›</button>

            <div class="matrix-toggle">
              <button type="button">Month</button>
              <button type="button" class="matrix-toggle__active">Fortnight</button>
            </div>
          </div>

          <div class="pricing-table">
            <div class="pricing-table__head">
              <span>Product / Service</span>
              <span>TUE 10</span>
              <span>TUE 11</span>
              <span>TUE 12</span>
              <span>SAT 13</span>
              <span>SUN 14</span>
              <span>MON 15</span>
            </div>

            <div class="pricing-row">
              <div>
                <strong>Angkor Wat Sunrise Premium</strong>
                <small>Daily Departure (4am)</small>
              </div>
              <span class="slot slot--teal">19 left<br /><small>$85</small></span>
              <span class="slot slot--teal">12 left<br /><small>$85</small></span>
              <span class="slot slot--teal">12 left<br /><small>$85</small></span>
              <span class="slot slot--gold">9 left<br /><small>$120</small></span>
              <span class="slot slot--red">2 left<br /><small>$130</small></span>
              <span class="slot slot--teal">11 left<br /><small>$90</small></span>
            </div>

            <div class="pricing-row">
              <div>
                <strong>Floating Village Photography</strong>
                <small>Afternoon Boat Tour</small>
              </div>
              <span class="slot slot--teal">14 left<br /><small>$45</small></span>
              <span class="slot slot--teal">27 left<br /><small>$45</small></span>
              <span class="slot slot--teal">10 left<br /><small>$45</small></span>
              <span class="slot slot--teal">29 left<br /><small>$45</small></span>
              <span class="slot slot--teal">17 left<br /><small>$45</small></span>
              <span class="slot slot--teal">22 left<br /><small>$45</small></span>
            </div>

            <div class="pricing-row">
              <div>
                <strong>Khmer Cooking Masterclass</strong>
                <small>Limited to 12 Pax</small>
              </div>
              <span class="slot slot--teal">7 left<br /><small>$65</small></span>
              <span class="slot slot--teal">8 left<br /><small>$65</small></span>
              <span class="slot slot--closed">CLOSED<br /><small>$65</small></span>
              <span class="slot slot--teal">5 left<br /><small>$65</small></span>
              <span class="slot slot--teal">5 left<br /><small>$65</small></span>
              <span class="slot slot--teal">9 left<br /><small>$65</small></span>
            </div>
          </div>

          <div class="legend-row">
            <div class="legend-item"><span class="dot dot--teal"></span>Available</div>
            <div class="legend-item"><span class="dot dot--red"></span>Low Stock (&lt;10%)</div>
            <div class="legend-item"><span class="dot dot--gold"></span>Khmer New Year (Peak)</div>
            <a href="#changes">Export Matrix</a>
          </div>
        </article>

        <aside class="side-rail">
          <article class="panel-card" id="pricing">
            <div class="card-header">
              <span class="card-icon">⌘</span>
              <h3>Pricing Engine</h3>
            </div>

            <label class="field">
              <span>RULE TYPE</span>
              <select>
                <option>Add % Markup</option>
                <option>Flat Rate</option>
                <option>Dynamic Demand</option>
              </select>
            </label>

            <label class="field">
              <span>VALUE</span>
              <div class="value-box">% <strong>25</strong></div>
            </label>

            <label class="switch-row">
              <span>AUTO-APPLY LOGIC</span>
              <div class="switch"><span class="switch__knob"></span></div>
              <small>Apply only when stock &lt; 20%</small>
            </label>

            <button type="button" class="primary-button">Update Market Prices</button>
          </article>

          <article class="panel-card" id="controller">
            <div class="card-header card-header--soft">
              <span class="card-icon card-icon--soft">▣</span>
              <h3>Inventory Controller</h3>
            </div>

            <div class="notice-box">
              <strong>KH New Year Focus</strong>
              <p>Apr 13-16 is designated as a high-demand peak period.</p>
            </div>

            <div class="date-grid">
              <label class="field">
                <span>START DATE</span>
                <input type="text" value="04/13/2024" />
              </label>
              <label class="field">
                <span>END DATE</span>
                <input type="text" value="04/16/2024" />
              </label>
            </div>

            <label class="field">
              <span>MAX PAX / DAILY LIMIT</span>
              <input type="text" value="15" />
            </label>

            <small class="helper-text">*Auto-close triggers at 100% occupancy.</small>

            <button type="button" class="outline-button">Batch Process Dates</button>
          </article>

          <article class="panel-card" id="changes">
            <span class="section-kicker">RECENT CHANGES</span>
            <div class="change-item">
              <span class="change-dot change-dot--teal"></span>
              <div>
                <strong>Price Override Applied</strong>
                <small>Angkor Premium · Apr 14-15</small>
              </div>
            </div>
            <div class="change-item">
              <span class="change-dot change-dot--gold"></span>
              <div>
                <strong>Auto-Close Triggered</strong>
                <small>Cooking Class · Apr 12</small>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.vue'
import LogoutButton from '../../components/LogoutButton.vue'
</script>

<style scoped>
.provider-shell {
  height: 100vh;
  display: grid;
  grid-template-columns: 245px minmax(0, 1fr);
  background: #202020;
  box-sizing: border-box;
  overflow: hidden;
}

.provider-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(180deg, #f7f7f6 0%, #f9faf9 100%);
  overflow-y: auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 8px;
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar h1 {
  margin: 0;
  color: #143b3f;
  font-size: 1.3rem;
  font-weight: 800;
}

.sync-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #f0f2f1;
  color: #606f6b;
  font-size: 0.65rem;
}

.provider-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: transparent;
}

.provider-profile__text strong,
.provider-profile__text span {
  display: block;
  line-height: 1.1;
}

.provider-profile__text strong {
  color: #173f42;
  font-size: 0.78rem;
}

.provider-profile__text span {
  color: #73827d;
  font-size: 0.64rem;
}

.provider-avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f6e70, #efb34f);
  color: #fff;
  font-size: 0.64rem;
  font-weight: 800;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
  border-top: 3px solid transparent;
}

.summary-card span {
  display: block;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: #7f8b88;
}

.summary-card strong {
  display: block;
  margin-top: 6px;
  color: #173f42;
  font-size: 1.5rem;
  line-height: 1;
}

.summary-card small {
  display: block;
  margin-top: 4px;
  color: #6c7b77;
  font-size: 0.72rem;
}

.summary-card--teal { border-top-color: #1b8d90; }
.summary-card--gold { border-top-color: #c68a22; }
.summary-card--red { border-top-color: #e03a3a; }
.summary-card--forest { border-top-color: #4a7a65; }

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 284px;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.matrix-panel {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
  display: flex;
  flex-direction: column;
}

.matrix-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0 10px;
}

.matrix-toolbar h2 {
  margin: 0;
  color: #2c4042;
  font-size: 1rem;
  font-weight: 700;
}

.date-nav {
  border: 0;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #f2f4f3;
  color: #556866;
  font-size: 0.8rem;
}

.matrix-toggle {
  margin-left: auto;
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  background: #f0f0f0;
  border-radius: 6px;
}

.matrix-toggle button {
  border: 0;
  background: transparent;
  padding: 4px 8px;
  border-radius: 4px;
  color: #5f6f6d;
  font-size: 0.68rem;
}

.matrix-toggle__active {
  background: #0f6e70 !important;
  color: #fff !important;
}

.pricing-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #edf0ef;
  flex: 1;
  overflow-y: auto;
}

.pricing-table__head,
.pricing-row {
  display: grid;
  grid-template-columns: 1.6fr repeat(6, 1fr);
}

.pricing-table__head {
  background: #fafafa;
  border-bottom: 1px solid #eef0ef;
  position: sticky;
  top: 0;
  z-index: 10;
}

.pricing-table__head span {
  padding: 8px;
  font-size: 0.6rem;
  font-weight: 800;
  color: #5c6d6a;
  text-align: center;
}

.pricing-table__head span:first-child {
  text-align: left;
}

.pricing-row {
  border-bottom: 1px solid #f0f1f0;
}

.pricing-row:last-child {
  border-bottom: 0;
}

.pricing-row > div {
  padding: 10px 12px;
}

.pricing-row > div strong {
  display: block;
  color: #1b3031;
  font-size: 0.82rem;
}

.pricing-row > div small {
  display: block;
  margin-top: 3px;
  color: #7b8b88;
  font-size: 0.7rem;
}

.slot {
  padding: 8px 6px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #1e5457;
  border-left: 1px solid #f2f4f3;
}

.slot small {
  display: block;
  margin-top: 2px;
  color: #6c7b77;
  font-size: 0.68rem;
}

.slot--teal { color: #1e6567; }
.slot--gold { background: #fff8ef; color: #a46a00; }
.slot--red { background: #fff3f3; color: #c94f4f; }
.slot--closed { color: #9ea8a6; background: #f7f8f7; }

.legend-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px 0;
  color: #60706d;
  font-size: 0.7rem;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-row a {
  margin-left: auto;
  color: #1d7777;
  text-decoration: none;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.dot--teal { background: #1b8d90; }
.dot--red { background: #df4c4c; }
.dot--gold { background: #efb34f; }

.side-rail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.panel-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
  box-sizing: border-box;
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-header h3 {
  margin: 0;
  color: #263f41;
  font-size: 0.9rem;
}

.card-icon {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  background: #f4f0dc;
  color: #b08724;
  font-size: 0.7rem;
}

.card-icon--soft {
  background: #eaf3f4;
  color: #4f8b8f;
}

.field {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  width: 100%;
  box-sizing: border-box;
}

.field span,
.section-kicker {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: #7a8784;
}

.field select,
.field input,
.value-box {
  width: 100%;
  box-sizing: border-box;
  min-height: 32px;
  border: 1px solid #edf0ef;
  border-radius: 4px;
  background: #f7f8f8;
  padding: 0 8px;
  font: inherit;
  color: #345054;
  font-size: 0.8rem;
}

.value-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value-box strong {
  font-size: 0.95rem;
  color: #3a4648;
}

.switch-row {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.switch-row small,
.helper-text,
.notice-box p,
.change-item small {
  color: #778784;
  font-size: 0.68rem;
}

.switch {
  width: 36px;
  height: 18px;
  border-radius: 999px;
  background: #1b8d90;
  position: relative;
}

.switch__knob {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #fff;
  position: absolute;
  top: 2px;
  right: 2px;
}

.primary-button,
.outline-button {
  width: 100%;
  min-height: 34px;
  margin-top: 10px;
  border: 0;
  border-radius: 3px;
  font: inherit;
  font-weight: 700;
  font-size: 0.8rem;
}

.primary-button {
  background: #f4a51c;
  color: #fff;
}

.outline-button {
  background: #fff;
  color: #0f6e70;
  border: 1px solid #0f6e70;
}

.notice-box {
  padding: 10px;
  border-left: 3px solid #e9b25e;
  background: #fbf4e8;
  border-radius: 4px;
  margin: 8px 0 10px;
}

.notice-box strong {
  color: #4b3a14;
  font-size: 0.78rem;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.helper-text {
  display: block;
  margin-top: 6px;
}

.change-item {
  display: flex;
  gap: 8px;
  align-items: start;
  margin-top: 6px;
}

.change-item strong {
  display: block;
  color: #2b3f41;
  font-size: 0.78rem;
}

.change-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  margin-top: 4px;
}

.change-dot--teal { background: #0f6e70; }
.change-dot--gold { background: #f4a51c; }

@media (max-width: 1280px) {
  .provider-shell {
    grid-template-columns: 1fr;
    height: auto;
    overflow: auto;
  }

  .provider-content {
    height: auto;
    padding: 16px;
  }

  .summary-grid,
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 800px) {
  .summary-card strong {
    font-size: 1.2rem;
  }
  .pricing-row > div {
    padding: 6px 12px;
  }
}
</style>