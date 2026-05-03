<template>
  <main class="simple-page">
    <nav class="navbar">
      <div class="navbar-brand">Anajak Tour</div>
      <ul class="nav-menu">
        <li><a href="#home">Home</a></li>
        <li><a href="#tours">Tours</a></li>
        <li><a href="#about">About</a></li>
      </ul>
    </nav>

    <section class="hero">
      <div class="hero-content">
        <h1>Choose Your Dashboard</h1>
        <p>Select your role to access the Cambodia tour booking system</p>
      </div>
    </section>

    <section class="roles-section">
      <div class="roles-container">
        <button class="role-card" @click="selectRole('admin')">
          <div class="icon">👨‍💼</div>
          <h2>Admin</h2>
          <p>Manage finances and system oversight</p>
        </button>

        <button class="role-card" @click="selectRole('provider')">
          <div class="icon">🏢</div>
          <h2>Provider</h2>
          <p>Control inventory and pricing</p>
        </button>

        <button class="role-card" @click="selectRole('customer')">
          <div class="icon">🧳</div>
          <h2>Customer</h2>
          <p>Search and book trips</p>
        </button>
      </div>
    </section>

    <footer class="footer">
      <p>&copy; 2024 Anajak Tour. All rights reserved.</p>
      <RouterLink to="/login" class="footer-link">Back to Login</RouterLink>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { setCurrentUserRole } from '../../utils/auth'

const router = useRouter()

function selectRole(role: 'admin' | 'provider' | 'customer') {
  setCurrentUserRole(role)

  if (role === 'admin') {
    router.push('/admin/dashboard')
  } else if (role === 'provider') {
    router.push('/provider/dashboard')
  } else {
    router.push('/customer/dashboard')
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.simple-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 30px;
}

.nav-menu a {
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-menu a:hover {
  color: #333;
}

.hero {
  padding: 60px 40px;
  text-align: center;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #333;
}

.hero-content p {
  font-size: 1.1rem;
  color: #666;
}

.roles-section {
  padding: 60px 40px;
  flex: 1;
}

.roles-container {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.role-card {
  padding: 40px 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
  text-align: center;
  font-family: inherit;
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #999;
}

.role-card .icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.role-card h2 {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #333;
}

.role-card p {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
}

.footer {
  padding: 30px 40px;
  text-align: center;
  border-top: 1px solid #eee;
  background: #f9f9f9;
  color: #666;
  font-size: 0.9rem;
}

.footer-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  margin-left: 15px;
}

.footer-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
  }

  .nav-menu {
    gap: 15px;
  }

  .hero {
    padding: 40px 20px;
  }

  .hero-content h1 {
    font-size: 1.8rem;
  }

  .roles-section {
    padding: 40px 20px;
  }

  .roles-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
