from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    totalCustomers: int
    totalAum: float
    todaySchedules: int
    urgentActions: int
    vipUrgentCount: int
