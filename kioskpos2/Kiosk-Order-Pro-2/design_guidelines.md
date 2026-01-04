# POS Application Design Guidelines

## Design Approach: Material Design (Data-Dense Utility)

**Rationale**: POS systems prioritize speed, clarity, and information density. Material Design's clear hierarchy, responsive grids, and action-oriented components support rapid transaction flows and inventory management.

---

## Typography System

**Font Family**: Inter (Google Fonts CDN)
- **Display/Headers**: 600 weight, 24-32px for section titles
- **Product Names**: 500 weight, 16-18px
- **Prices**: 600 weight, 18-24px (prominent visibility)
- **Body/Data**: 400 weight, 14-16px for tables, receipts
- **Input Labels**: 500 weight, 12px uppercase with tracking

---

## Layout & Spacing

**Tailwind Spacing Units**: 2, 4, 6, 8, 12, 16
- Container padding: `p-4` to `p-8`
- Card spacing: `space-y-4`
- Grid gaps: `gap-4` or `gap-6`
- Component margins: `mb-6` or `mb-8`

**Main Layout**: Split-pane desktop layout
- **Left Panel (60%)**: Product grid/catalog with search
- **Right Panel (40%)**: Active cart and checkout
- **Mobile**: Stack vertically, cart becomes bottom sheet

---

## Core Components

### Product Catalog
- **Grid**: 3-4 columns desktop (`grid-cols-3 lg:grid-cols-4`), 2 mobile
- **Product Cards**: Image thumbnail, name, price, stock indicator, quick-add button
- **Search Bar**: Prominent top position with category filters as chips below

### Shopping Cart Panel
- **Line Items**: Product name, quantity stepper, unit price, subtotal
- **Sticky Footer**: Subtotal, tax, total (bold large numbers)
- **Action Buttons**: Clear cart (text), Checkout (filled primary)
- **Empty State**: Icon + message encouraging product selection

### Checkout Modal/View
- **Payment Methods**: Large button tiles (Cash, Card, Mobile)
- **Number Pad**: 3x4 grid for cash tendering
- **Receipt Preview**: Real-time display before confirming
- **Success State**: Checkmark animation, print receipt button, new transaction CTA

### Transaction History
- **Table View**: Date, items count, total, payment method
- **Filters**: Date range picker, payment type dropdown
- **Search**: Transaction ID or customer name
- **Row Actions**: View details, print receipt icons

### Inventory Management
- **Data Table**: Product, category, stock, price, actions
- **Bulk Actions**: Export data, import CSV buttons
- **Add/Edit Forms**: Modal with image upload, pricing, stock fields
- **Low Stock Alerts**: Warning badges on products below threshold

### Data Management Section
- **LocalStorage Status**: Storage usage indicator with percentage bar
- **Export/Import**: Clearly labeled buttons with last backup timestamp
- **Clear Data**: Dangerous action, requires confirmation modal

---

## Navigation

**Top App Bar**:
- Logo/app name left
- Icon buttons: Home, Inventory, History, Settings, Data Export
- Current date/time display right
- No mobile hamburger - use bottom navigation instead

**Mobile Bottom Nav**: Home (POS), Inventory, History, More

---

## Visual Hierarchy

**Emphasis System**:
- **Primary Actions**: Filled buttons (Add to Cart, Checkout, Confirm Payment)
- **Secondary Actions**: Outlined buttons (Clear, Cancel)
- **Danger Actions**: Red text/outlined (Delete, Clear Data)

**Cards**: Subtle shadow (`shadow-sm`) with rounded corners (`rounded-lg`)
**Inputs**: Clear borders (`border-2`), focused state with accent

---

## Interaction Patterns

**Cart Updates**: Instant feedback, no loading states
**Form Validation**: Inline error messages below inputs
**Modals**: Backdrop blur, centered, max-width constraints
**Toasts**: Top-right position for success/error notifications (e.g., "Item added", "Payment successful")
**Confirmation Dialogs**: For destructive actions (clear cart, delete product)

---

## Images Section

**Product Images**: 
- Placeholder thumbnails in catalog cards (200x200px)
- Square aspect ratio, object-cover
- Use icon placeholders for products without images
- Larger preview in product detail modal if needed

**No Hero Image**: POS is a utility application - launch directly into functional interface without marketing hero sections.

---

## Special Considerations

**Offline-First Messaging**: Banner or indicator showing "All data stored locally" for user confidence

**Receipt Design**: Clean, scannable format
- Store info header
- Itemized list with clear columns
- Tax breakdown
- Total (bold, larger)
- Payment method and change
- Footer with date/time and transaction ID

**Data Persistence Feedback**: Subtle save indicators or "Last synced" timestamp to reassure users data is persisting to LocalStorage

---

## Accessibility

- Keyboard shortcuts for common actions (Enter to add, Esc to close modals)
- Focus management in modals and steppers
- ARIA labels for icon buttons
- High contrast for prices and totals
- Touch targets minimum 44x44px for mobile