# Sales Agent Selector Dialog Component

A reusable Angular component for selecting sales agents with customizable options.

## Usage

### Import the Module

First, import the `SalesAgentSelectorDialogModule` in your feature module:

```typescript
import { SalesAgentSelectorDialogModule } from 'src/app/shared/components/sales-agent-selector-dialog/sales-agent-selector-dialog.module';

@NgModule({
  imports: [
    // ... other imports
    SalesAgentSelectorDialogModule
  ],
  // ...
})
export class YourFeatureModule { }
```

### Basic Usage

```typescript
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SalesAgentSelectorDialogComponent, SalesAgentSelectorConfig } from 'src/app/shared/components/sales-agent-selector-dialog/sales-agent-selector-dialog.component';

export class YourComponent {
  constructor(private bottomSheet: MatBottomSheet) {}

  openSalesAgentSelector() {
    const config: SalesAgentSelectorConfig = {
      title: 'Select Sales Representatives',
      subtitle: 'Choose agents for your task',
      allowMultipleSelection: true
    };

    const dialogRef = this.bottomSheet.open(SalesAgentSelectorDialogComponent, {
      data: config,
      disableClose: false,
      hasBackdrop: true
    });

    dialogRef.afterDismissed().subscribe((selectedAgentIds: number[]) => {
      if (selectedAgentIds && selectedAgentIds.length > 0) {
        console.log('Selected agent IDs:', selectedAgentIds);
        // Handle the selected agents
      }
    });
  }
}
```

## Configuration Options

The `SalesAgentSelectorConfig` interface provides the following options:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `'Select Sales Agents'` | The dialog title |
| `subtitle` | `string` | `undefined` | Optional subtitle/description |
| `searchPlaceholder` | `string` | `'Search sales agents...'` | Placeholder text for search input |
| `confirmButtonText` | `string` | `'Confirm Selection'` | Text for the confirm button |
| `allowMultipleSelection` | `boolean` | `true` | Enable multiple selection (checkboxes) vs single selection (checkbox with toggle behavior) |
| `preselectedAgentIds` | `number[]` | `[]` | Array of agent IDs to preselect |
| `excludeAgentIds` | `number[]` | `[]` | Array of agent IDs to exclude from the list |

## Examples

### Single Selection Mode

```typescript
const config: SalesAgentSelectorConfig = {
  title: 'Assign Task to Agent',
  subtitle: 'Select one sales agent to assign this task (click to select/deselect)',
  allowMultipleSelection: false,
  confirmButtonText: 'Assign Task'
};
```

### With Preselected Agents

```typescript
const config: SalesAgentSelectorConfig = {
  title: 'Edit Assignment',
  subtitle: 'Modify sales agent assignments',
  preselectedAgentIds: [1, 3, 5], // These agents will be pre-checked
  excludeAgentIds: [2, 4] // These agents won't appear in the list
};
```

### Custom Search and Button Text

```typescript
const config: SalesAgentSelectorConfig = {
  title: 'Territory Assignment',
  subtitle: 'Select agents for this territory',
  searchPlaceholder: 'Find agents by name or ID...',
  confirmButtonText: 'Assign Territory'
};
```

## Return Value

The component returns an array of selected agent IDs (`number[]`) when the user confirms their selection. If the user cancels or clicks outside the dialog, `undefined` is returned.

## Translation Keys

The component uses the following translation keys that should be added to your language files:

```json
{
  "SALES_AGENT_SELECTOR_DIALOG": {
    "DEFAULT_TITLE": "Select Sales Agents",
    "SEARCH_PLACEHOLDER": "Search sales agents...",
    "SELECT_ALL": "Select All",
    "NO_AGENTS_FOUND": "No sales agents found",
    "LOADING": "Loading sales agents...",
    "SELECTED_COUNT": "{{count}} agent(s) selected",
    "SELECTED_SINGLE": "{{name}} selected",
    "CONFIRM_BUTTON": "Confirm Selection",
    "ERROR_LOADING_AGENTS": "Failed to load sales agents. Please try again."
  }
}
```

## Features

- ✅ Search functionality with real-time filtering
- ✅ Single or multiple selection modes (both use checkbox UI for consistent behavior)
- ✅ Toggle behavior in single selection mode (click to select/deselect)
- ✅ Select all/deselect all for multiple selection
- ✅ Preselection support
- ✅ Agent exclusion capability
- ✅ Loading states and error handling
- ✅ Responsive design
- ✅ Internationalization support
- ✅ Material Design components
