import { AuthService } from './services/auth.js';
import { AppState } from './services/state.js';
import { Toast } from './components/Toast.js';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';

import { LoginView } from './views/LoginView.js';
import { OverviewView } from './views/OverviewView.js';
import { OperatorsView } from './views/OperatorsView.js';
import { OperatorDetailView } from './views/OperatorDetailView.js';
import { AgentsView } from './views/AgentsView.js';
import { PlansView } from './views/PlansView.js';
import { ProvidersView } from './views/ProvidersView.js';
import { SubscribersView } from './views/SubscribersView.js';
import { NotificationsView } from './views/NotificationsView.js';
import { ApiDocsView } from './views/ApiDocsView.js';

class App {
  constructor() {
    this.appEl = document.getElementById('app');
    this.currentRoute = this.getRouteFromHash() || 'overview';
    this.init();
  }

  getRouteFromHash() {
    return window.location.hash.replace('#', '') || 'overview';
  }

  async init() {
    // Listen for auth expired event
    window.addEventListener('auth:expired', () => {
      Toast.error('Session expired. Please log in.');
      this.render();
    });

    // Listen for hash change in browser
    window.addEventListener('hashchange', () => {
      this.currentRoute = this.getRouteFromHash();
      this.render();
    });

    // Listen for global operator changes
    let lastActiveOpId = AppState.activeOperatorId;
    AppState.subscribe(({ activeOperatorId }) => {
      this.updateHeaderAndSidebar();
      if (activeOperatorId !== lastActiveOpId) {
        lastActiveOpId = activeOperatorId;
        const [route, query] = this.currentRoute.split('?');
        // An explicit detail route owns its operator; syncing the header must
        // not reload the page that just finished fetching that same operator.
        if (route !== 'operator-detail' || !new URLSearchParams(query).get('id')) {
          this.renderCurrentView();
        }
      }
    });

    // Check auth and load current profile
    if (AuthService.isAuthenticated()) {
      await AuthService.fetchMe();
      await AppState.loadOperators();
    }

    this.render();
  }

  navigateTo(route) {
    if (this.getRouteFromHash() === route) {
      this.currentRoute = route;
      this.render();
      return;
    }
    // hashchange owns rendering; rendering here too launches every request twice.
    window.location.hash = `#${route}`;
  }

  updateHeaderAndSidebar() {
    const sidebarContainer = document.querySelector('.sidebar');
    const headerContainer = document.querySelector('.top-header');

    if (sidebarContainer && AuthService.isAuthenticated()) {
      const newSidebar = new Sidebar(this.currentRoute, (r) => this.navigateTo(r)).render();
      sidebarContainer.replaceWith(newSidebar);
    }
    if (headerContainer && AuthService.isAuthenticated()) {
      const newHeader = new Header(this.currentRoute).render();
      headerContainer.replaceWith(newHeader);
    }
  }

  async renderCurrentView() {
    const mainContent = this.appEl.querySelector('.main-content');
    if (!mainContent) return;

    const currentSlot = mainContent.querySelector('.view-container') || mainContent.querySelector('#view-slot');
    if (!currentSlot) return;

    const viewComponent = this.createViewComponent(this.currentRoute);
    const newViewDom = await viewComponent.render();
    currentSlot.replaceWith(newViewDom);
  }

  createViewComponent(route) {
    const [baseRoute, queryString] = route.split('?');
    const params = new URLSearchParams(queryString || '');

    if (baseRoute === 'operator-detail') {
      const opId = params.get('id') || AppState.activeOperatorId || (AppState.operators[0]?.id);
      return new OperatorDetailView((r) => this.navigateTo(r), opId);
    }

    switch (baseRoute) {
      case 'overview':
        return new OverviewView((r) => this.navigateTo(r));
      case 'operators':
        return new OperatorsView((r) => this.navigateTo(r));
      case 'agents':
        return new AgentsView((r) => this.navigateTo(r));
      case 'plans':
        { const view = new OperatorDetailView((r) => this.navigateTo(r), AppState.activeOperatorId); view.activeTab = 'tab-plans'; return view; }
      case 'providers':
        return new ProvidersView((r) => this.navigateTo(r));
      case 'subscribers':
        return new SubscribersView((r) => this.navigateTo(r));
      case 'notifications':
        return new NotificationsView((r) => this.navigateTo(r));
      case 'api-docs':
        return new ApiDocsView((r) => this.navigateTo(r));
      default:
        return new OverviewView((r) => this.navigateTo(r));
    }
  }

  async render() {
    if (!AuthService.isAuthenticated()) {
      this.appEl.innerHTML = '';
      const loginView = new LoginView(async () => {
        await AuthService.fetchMe();
        await AppState.loadOperators();
        this.navigateTo('overview');
      });
      this.appEl.appendChild(loginView.render());
      return;
    }

    // Authenticated layout
    this.appEl.innerHTML = `
      <div class="app-layout">
        <div id="sidebar-slot"></div>
        <div class="main-content">
          <div id="header-slot"></div>
          <main id="view-slot"></main>
        </div>
      </div>
    `;

    // Render Sidebar & Header
    const sidebar = new Sidebar(this.currentRoute, (r) => this.navigateTo(r)).render();
    const header = new Header(this.currentRoute).render();

    this.appEl.querySelector('#sidebar-slot').replaceWith(sidebar);
    this.appEl.querySelector('#header-slot').replaceWith(header);

    // Render Active View
    const viewSlot = this.appEl.querySelector('#view-slot');
    const viewComponent = this.createViewComponent(this.currentRoute);
    const viewDom = await viewComponent.render();
    viewSlot.replaceWith(viewDom);
  }
}

new App();
