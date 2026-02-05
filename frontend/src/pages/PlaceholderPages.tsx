import { CommonPageLayout } from '../components/layout/CommonPageLayout'

export function Agents() {
    return <CommonPageLayout pageType="agents" title="Agent 관리 위젯" />
}

export function Strategy() {
    return <CommonPageLayout pageType="strategy" title="투자전략 위젯" />
}

export function Knowledge() {
    return <CommonPageLayout pageType="knowledge" title="지식관리 위젯" />
}

export function Lab() {
    return <CommonPageLayout pageType="lab" title="실험실 위젯" />
}

export function Settings() {
    return <CommonPageLayout pageType="settings" title="설정" />
}
