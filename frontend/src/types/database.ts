export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          employee_code: string | null
          role: 'admin' | 'wm' | 'viewer'
          permission_level: number
          branch_id: string | null
          phone: string | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          customer_group: 'vip' | 'general' | 'prospect'
          grade: string | null
          total_aum: number
          wm_id: string | null
          birth_date: string | null
          join_date: string | null
          last_contact_date: string | null
          created_at: string
          updated_at: string
        }
      }
      scenarios: {
        Row: {
          id: string
          code: string
          name: string
          category: string
          description: string | null
          priority: number
          color: string | null
          icon: string | null
          data_schema: Record<string, any>
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      customer_scenario_events: {
        Row: {
          id: string
          customer_id: string
          scenario_id: string
          account_id: string | null
          event_date: string
          event_data: Record<string, any>
          status: 'pending' | 'contacted' | 'completed' | 'dismissed'
          priority: number
          assigned_wm_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      templates: {
        Row: {
          id: string
          template_id: string
          template_type: string
          title: string
          description: string | null
          config: Record<string, any>
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      datasources: {
        Row: {
          id: string
          datasource_id: string
          name: string
          config: Record<string, any>
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      widget_instances: {
        Row: {
          id: string
          widget_id: string
          template_id: string
          datasource_id: string
          title_override: string | null
          size_override: Record<string, any> | null
          visible: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

// 조인된 데이터 타입
export interface CustomerScenarioEventWithDetails {
  id: string
  customer_id: string
  scenario_id: string
  account_id: string | null
  event_date: string
  event_data: Record<string, any>
  status: 'pending' | 'contacted' | 'completed' | 'dismissed'
  priority: number
  assigned_wm_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  customer: {
    id: string
    name: string
    phone: string | null
    email: string | null
    customer_group: 'vip' | 'general' | 'prospect'
    grade: string | null
    total_aum: number
  }
  scenario: {
    code: string
    name: string
    category: string
    color: string | null
    icon: string | null
  }
}

export interface WidgetInstanceWithDetails {
  id: string
  widget_id: string
  title_override: string | null
  size_override: Record<string, any> | null
  visible: boolean
  template: {
    template_id: string
    template_type: string
    title: string
    config: Record<string, any>
  }
  datasource: {
    datasource_id: string
    name: string
    config: Record<string, any>
  }
}
