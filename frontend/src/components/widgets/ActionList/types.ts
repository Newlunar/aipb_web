export interface ColumnConfig {
  key: string
  label: string
  source: 'customer' | 'scenario' | 'event' | 'account'
  field: string
  width?: string
  align?: 'left' | 'center' | 'right'
  format?: {
    type: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'progress'
    options?: Record<string, any>
  }
  sortable?: boolean
  clickable?: boolean
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'multi_select' | 'date_range' | 'search' | 'number_range'
  options?: { value: string; label: string }[]
  default_value?: any
  target: {
    source: string
    field: string
  }
}

export interface RowAction {
  key: string
  label: string
  icon?: string
  type: 'call' | 'message' | 'email' | 'popup' | 'navigate' | 'custom'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

export interface ActionListTemplateConfig {
  size: { width: number; height?: number }
  grid: {
    show_header: boolean
    row_height?: 'compact' | 'normal' | 'comfortable'
    stripe?: boolean
    border?: boolean
    hover_highlight?: boolean
  }
  filter_area: {
    enabled: boolean
    position: 'top' | 'inline'
    show_search?: boolean
    show_reset?: boolean
  }
  pagination: {
    enabled: boolean
    position: 'bottom' | 'top' | 'both'
    show_total?: boolean
    show_page_size?: boolean
    page_size_options?: number[]
  }
  action_area: {
    enabled: boolean
    position: 'row' | 'toolbar' | 'both'
  }
  row_click: {
    enabled: boolean
    action: 'popup' | 'navigate' | 'expand' | 'none'
  }
}

export interface ActionListDataSourceConfig {
  query: {
    base_table: string
    scenario_filter?: {
      categories?: string[]
      codes?: string[]
    }
    status_filter?: string[]
    customer_group_filter?: string[]
    wm_filter?: string | null
    date_range?: {
      type: 'relative' | 'absolute'
      relative_days?: { start: number; end: number }
      absolute_dates?: { start: string; end: string }
    }
  }
  columns: ColumnConfig[]
  filters: FilterConfig[]
  default_sort: { field: string; direction: 'asc' | 'desc' }
  default_page_size: number
  row_actions: RowAction[]
  row_highlight_rules?: {
    field: string
    rules: { condition: string; color: string }[]
  }
}

export interface ActionListData {
  id: string
  customer_id: string
  customer_name: string
  customer_group: 'vip' | 'general' | 'prospect'
  grade: string
  total_aum: number
  phone: string
  scenario_code: string
  scenario_name: string
  scenario_color: string
  event_date: string
  event_data: Record<string, any>
  status: 'pending' | 'contacted' | 'completed' | 'dismissed'
  priority: number
}
