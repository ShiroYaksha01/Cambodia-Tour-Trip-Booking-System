<template>
  <main class="verification-page">
    <section class="backdrop" aria-hidden="true"></section>

    <section class="verification-panel" aria-label="Verification form">
      <div class="icon-wrap" aria-hidden="true">
        <span class="icon">&#9711;</span>
      </div>

      <h1>Verify Your Identity</h1>
      <p class="subtitle">
        We've sent a 6-digit verification code to
        <strong>curator@heritage.kh</strong>.
        Please enter it below to proceed.
      </p>

      <div class="code-row" role="group" aria-label="Verification code">
        <input maxlength="1" inputmode="numeric" aria-label="Digit 1" />
        <input maxlength="1" inputmode="numeric" aria-label="Digit 2" />
        <input maxlength="1" inputmode="numeric" aria-label="Digit 3" />
        <input maxlength="1" inputmode="numeric" aria-label="Digit 4" />
        <input maxlength="1" inputmode="numeric" aria-label="Digit 5" />
        <input maxlength="1" inputmode="numeric" aria-label="Digit 6" />
      </div>

      <button type="button" class="verify-btn">Verify &amp; Continue -&gt;</button>

      <p class="resend-row">
        Didn't receive a code?
        <a href="#">Resend Code</a>
      </p>

      <RouterLink to="/auth/sign-in" class="back-link">&larr; Back to Login</RouterLink>
    </section>

    <p class="bottom-brand">THE HERITAGE CURATOR</p>
  </main>
</template>

<style scoped>
.verification-page {
  min-height: 100vh;
  position: relative;
  display: grid;
  place-items: center;
  padding: 30px 16px;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.backdrop {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(9, 22, 39, 0.42), rgba(9, 22, 39, 0.36)),
    url('/auth-signup-hero.jpg'),
    url('/auth-signup-hero.svg');
  background-size: cover;
  background-position: center;
  filter: blur(1.5px);
  transform: scale(1.01);
}

.verification-panel {
  position: relative;
  z-index: 1;
  width: min(420px, 100%);
  background: rgba(248, 248, 246, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 12px;
  box-shadow: 0 30px 60px rgba(5, 11, 20, 0.38);
  padding: 22px 20px 22px;
  text-align: center;
  backdrop-filter: blur(6px);
}

.icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  background: rgba(9, 126, 121, 0.08);
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  position: relative;
}

.icon-wrap::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  border-radius: 999px;
  background: #b78a31;
}

.icon {
  color: #0e7b77;
  font-size: 1.15rem;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.2rem);
  line-height: 1.1;
  color: #1f2a31;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 10px auto 0;
  max-width: 30ch;
  font-size: 0.96rem;
  color: #5c6971;
  line-height: 1.5;
}

.subtitle strong {
  color: #0e7b77;
  font-weight: 700;
}

.code-row {
  margin-top: 20px;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.code-row input {
  height: 44px;
  border: 1px solid #d8dcdf;
  border-radius: 6px;
  background: #ffffff;
  font: inherit;
  font-size: 1.3rem;
  text-align: center;
  color: #1f2a31;
  outline: none;
}

.code-row input:focus {
  border-color: #0e7b77;
  box-shadow: 0 0 0 2px rgba(14, 123, 119, 0.14);
}

.verify-btn {
  margin-top: 18px;
  width: 100%;
  min-height: 44px;
  border: 0;
  border-radius: 6px;
  font: inherit;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(180deg, #118680, #0d726c);
  cursor: pointer;
}

.resend-row {
  margin: 14px 0 0;
  font-size: 0.86rem;
  color: #5f686d;
}

.resend-row a,
.back-link {
  color: #a06a00;
  text-decoration: none;
  font-weight: 700;
}

.back-link {
  margin-top: 12px;
  display: inline-block;
  font-size: 0.9rem;
}

.bottom-brand {
  position: absolute;
  z-index: 1;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  letter-spacing: 0.28em;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.84);
  font-weight: 600;
}

@media (max-width: 480px) {
  .verification-panel {
    padding: 20px 14px;
  }

  .code-row {
    gap: 6px;
  }
}
</style>
