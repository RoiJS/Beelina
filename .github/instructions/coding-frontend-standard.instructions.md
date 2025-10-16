---
applyTo: "Beelina.APP/**"
---

## Beelina.APP

**Purpose:**  
Beelina.APP is an Angular-based SPA (Single Page Application) serving as the main frontend for Beelina’s sales and inventory platform. It communicates with Beelina.API via REST/GraphQL endpoints.

**Tech Stack:**

- Angular CLI v14+ (TypeScript, HTML, SCSS)
- Angular Material
- State: NgRx (Store, Effects, Signals, Devtools)
- Apollo Angular, @apollo/client (GraphQL)
- @ngx-translate/core (i18n)
- JWT, html2pdf.js, moment, ng-apexcharts, ngx-awesome-uploader, ngx-indexed-db, rxjs
- PWA features (service worker), Firebase hosting
- Jasmine, Karma (testing)

**Repository Structure:**

- `src/` – Application source code
- `src/assets/` – Static assets (images, translations)
- `src/environments/` – Environment configs
- `src/styles.scss` – Global styles
- `src/index.html` – Main HTML template
- `angular.json`, `tsconfig.json` – Build and TypeScript configs

- `src/app/directives/` – This contains custom angular directives

- `src/app/_enum/` – This contains global enums used across the application
- `src/app/_guards/` – This contains route guards for authentication and authorization
- `src/app/_helpers/` – This contains helper functions and utilities

- `src/app/_interfaces/` – This contains TypeScript global interfaces for defining data structures
- `src/app/_interfaces/connections/` – Contains base interface for defining graphQL pagination properties
- `src/app/_interfaces/errors/` – Contains base interface for defining error handling properties
- `src/app/_interfaces/inputs/` – Contains base interface for defining model input properties to communicate with the graphQL API
- `src/app/_interfaces/outputs/` – Contains base interface for defining model output properties consume from the graphQL API

- `src/app/_models/` – This contains TypeScript global models for defining data structures
- `src/app/_models/datasources/` – Defines datamodel sources for the application usually used in managing item lists that is displayed in the UI
- `src/app/_models/errors/` – Defines error models for the application
- `src/app/_models/filters/` – Defines filter models for the application
- `src/app/_models/local-db/` – Defines local database models for the application
- `src/app/_models/results/` – Defines result models for the application usually used in consuming response from the graphQL API
- `src/app/_services/` – Contains services for API communication (via HttpClient or Apollo), state management, and utility functions
- `src/app/_services/print/` – Contains services for bluetooth print functionality
- `src/app/_services/settings/` – Contains services for module settings management
- `src/app/_validators/` – Contains services for custom form validation
- `src/app/shared/` – Shared components, directives, pipes
- `src/app/shared/components/base-component/base-component.component.ts` – base component for all components
- `src/app/shared/components/subscription-panel/` – Bizual subscription panel component
- `src/app/shared/components/text-input-autocomplete/` – Bizual text input autocomplete component
- `src/app/shared/components/user-card/` – Bizual user card component
- `src/app/shared/ui/` – Shared custom app ui components
- `src/app/shared/ui/badge/` – Shared custom app ui components
- `src/app/shared/custom-ui-shared.module.ts` – angular shared module for custom ui components

- `src/app/auth/` – Bizual authentication module
- `src/app/admin-dashboard/` – Bizual admin dashboard module. This is for admin users to view sales and inventory analytics, sales agents performance, top selling products, and other business insights.
- `src/app/accounts/` – Bizual user accounts module. Here you can manage user accounts, roles, and permissions.
- `src/app/bad-orders/` – Bizual bad orders module. Here you can manage and review bad orders registered by the sales agent users.
- `src/app/barangays/` – Bizual barangays module. Sales agents can manage barangay information in this module.
- `src/app/customers/` – Bizual customers module. This is where sales agents can manage customer information.
- `src/app/draft-transactions/` – Contains draft orders module. Sales agents can manage draft orders in this module.
- `src/app/offline/` – Offline view. This page appears when application is in offline state.
- `src/app/order-transactions/` – Contains order transactions module. Only available for administrator accounts. Admin can view all orders registered by sales agents.
- `src/app/payment-methods/` – Contain payment methods store.
- `src/app/product/`
  - Contains modules related with managing products information.
  - Product cart page where sales agents can add products to cart and checkout.
  - Assign price per product to sales agents.
  - Transfer/Convert products from one product unit to another.
- `src/app/product-withdrawals/` – Manage product withdrawals module. This is where manager withdraws products from the warehouse to the sales agents accounts.
- `src/app/profile/` – Manage user profile module. This is where users can view and edit their profile information.
- `src/app/purchase-orders/` – Manage product stock entries module. This is where admin and manager can register to product stock entries for product in the warehouse.
- `src/app/reports/` – Contains reports module. This is where users can view and generate reports related to sales, inventory, and other business metrics. Specific reports only available based on the user roles.
- `src/app/sales/` – Sales module for sales agents account. This is where sales agent can view sales information.
- `src/app/settings/` – Settings module. This is where sales agents can manager their account settings, such as changing password, updating profile information, and other module specific settings.
- `src/app/suppliers/` – Manage suppliers module. This is where admin manages suppliers information.
- `src/app/system-update/` – System update view when app is locked during system maintenance.
- `src/app/transaction-history/` = View all confirmed orders registered by the sales agents.
- `src/app/warehouse/` – Manage warehouse module. This is where admin can manage warehouse information, such as product stock entries, product withdrawals, and other warehouse related tasks. Admin can also perform import products via the Product import feature.

- `src/app/app.module.ts` – Main app module
- `src/app/app.component.ts` – Root component
- `src/app/i18n/` – Internationalization files

- `.editorconfig`
- `package.json`
- `karma.conf.js`, `tsconfig*.json` – Build/test configs
- `firebase.json`, `.firebaserc` – Hosting configs

**Development Workflow:**

- Dev server: `ng serve`
- Build: `ng build`
- Unit tests: `ng test`
- Code generation: `ng generate component|service|module ...`

**Guidelines:**

- Follow Angular style guide and best practices that is available on the current Angular version
- Use NgRx store for state management for new modules specially when dealing with lists of data
- When new text is added, update the i18n files in `src/app/i18n/en.json`. Make sure to use the correct key format and avoid hardcoding text in components and if there is already a key available, use that key instead of creating a new one.
- Update `app-version.service.ts` with the new version number (eg. For bug fixes, use `1.0.1` or `1.0.2`, for new features, use `1.1.0` or `1.2.0`, and for breaking changes, use `2.0.0` or `3.0.0`)
- Use Apollo Angular for GraphQL queries and mutations
- Use Angular Material for UI components
- Ensure to follow app theme guidelines
- Introduce unit tests for new features and critical components
- Keep code modular and documented
- Use i18n and responsive/PWA design
- Ensure TypeScript strictness
