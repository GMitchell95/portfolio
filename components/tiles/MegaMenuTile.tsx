'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// ── SVG Icons ────────────────────────────────────────────────────────────────

const DesignTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-design)">
      <path d="M1.13728 11.2785L0.418533 13.7191L0.0310334 15.0379C-0.0470916 15.3035 0.0247834 15.5879 0.218533 15.7816C0.412283 15.9754 0.696658 16.0473 0.959158 15.9723L2.28103 15.5816L4.72166 14.8629C5.04666 14.7691 5.34978 14.6129 5.61541 14.4098L5.62478 14.416L5.64041 14.391C5.68416 14.3566 5.72478 14.3223 5.76541 14.2879C5.80916 14.2504 5.84978 14.2098 5.89041 14.1691L15.3967 4.66602C16.081 3.98164 16.1654 2.92852 15.6529 2.15039C15.581 2.04102 15.4935 1.93477 15.3967 1.83789L14.1654 0.603516C13.3842 -0.177734 12.1185 -0.177734 11.3373 0.603516L1.83103 10.1098C1.75291 10.1879 1.67791 10.2723 1.60916 10.3598L1.58416 10.3754L1.59041 10.3848C1.38728 10.6504 1.23416 10.9535 1.13728 11.2785ZM11.9685 5.96914L6.16853 11.7691L4.61853 11.3816L4.23103 9.83164L10.031 4.03164L11.9685 5.96914ZM3.03103 11.216L3.27166 12.1848C3.33728 12.4535 3.54978 12.6629 3.81853 12.7316L4.78728 12.9723L4.55603 13.3223C4.47478 13.366 4.39041 13.4035 4.30291 13.4285L3.57166 13.6441L1.85603 14.1441L2.35916 12.4316L2.57478 11.7004C2.59978 11.6129 2.63728 11.5254 2.68103 11.4473L3.03103 11.216ZM9.85291 6.83477C10.0467 6.64102 10.0467 6.32227 9.85291 6.12852C9.65916 5.93477 9.34041 5.93477 9.14666 6.12852L6.14666 9.12852C5.95291 9.32227 5.95291 9.64102 6.14666 9.83477C6.34041 10.0285 6.65916 10.0285 6.85291 9.83477L9.85291 6.83477Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-design"><rect width="16" height="16" fill="white"/></clipPath></defs>
  </svg>
)

const BiddingTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-bidding)">
      <path d="M9.78086 0.218359C10.0715 0.508984 10.0746 0.977734 9.78711 1.27148L14.7277 6.21211C15.0215 5.92461 15.4902 5.92773 15.7809 6.21836C16.0746 6.51211 16.0746 6.98711 15.7809 7.27773L15.259 7.80273L12.2809 10.7809L11.7809 11.2809C11.4871 11.5746 11.0121 11.5746 10.7215 11.2809C10.4402 10.9996 10.4277 10.5465 10.6934 10.2527L5.74961 5.30898C5.45586 5.57148 5.00273 5.56211 4.72148 5.28086C4.42773 4.98711 4.42773 4.51211 4.72148 4.22148L5.22148 3.72148L8.19648 0.743359L8.71836 0.218359C9.01211 -0.0753906 9.48711 -0.0753906 9.77773 0.218359H9.78086ZM8.72461 2.33398L6.80898 4.24961L11.7496 9.19023L13.6652 7.27461L8.72461 2.33398ZM6.98086 7.95586L8.04023 9.01523L6.48398 10.5715L6.70273 10.7902C7.09336 11.1809 7.09336 11.8152 6.70273 12.2059L3.20273 15.7059C2.81211 16.0965 2.17773 16.0965 1.78711 15.7059L0.287109 14.2059C-0.103516 13.8152 -0.103516 13.1809 0.287109 12.7902L3.78711 9.29023C4.17773 8.89961 4.81211 8.89961 5.20273 9.29023L5.42148 9.50898L6.97773 7.95273L6.98086 7.95586ZM4.49961 10.7059L1.70586 13.4996L2.49961 14.2934L5.29336 11.4996L4.49961 10.7059Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-bidding"><rect width="16" height="16" fill="white"/></clipPath></defs>
  </svg>
)

const AnalysisTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-analysis)">
      <path d="M6.5 1.5C7.82608 1.5 9.09785 2.02678 10.0355 2.96447C10.9732 3.90215 11.5 5.17392 11.5 6.5C11.5 7.82608 10.9732 9.09785 10.0355 10.0355C9.09785 10.9732 7.82608 11.5 6.5 11.5C5.17392 11.5 3.90215 10.9732 2.96447 10.0355C2.02678 9.09785 1.5 7.82608 1.5 6.5C1.5 5.17392 2.02678 3.90215 2.96447 2.96447C3.90215 2.02678 5.17392 1.5 6.5 1.5ZM6.5 13C8.025 13 9.42813 12.475 10.5344 11.5969L14.7188 15.7812C15.0125 16.075 15.4875 16.075 15.7781 15.7812C16.0687 15.4875 16.0719 15.0125 15.7781 14.7219L11.5969 10.5344C12.475 9.42813 13 8.025 13 6.5C13 2.90937 10.0906 0 6.5 0C2.90937 0 0 2.90937 0 6.5C0 10.0906 2.90937 13 6.5 13ZM7.25 4.25C7.25 3.83437 6.91563 3.5 6.5 3.5C6.08437 3.5 5.75 3.83437 5.75 4.25V8.75C5.75 9.16563 6.08437 9.5 6.5 9.5C6.91563 9.5 7.25 9.16563 7.25 8.75V4.25ZM4.75 5.25C4.75 4.83437 4.41563 4.5 4 4.5C3.58437 4.5 3.25 4.83437 3.25 5.25V7.75C3.25 8.16563 3.58437 8.5 4 8.5C4.41563 8.5 4.75 8.16563 4.75 7.75V5.25ZM9.75 5.75C9.75 5.33437 9.41563 5 9 5C8.58437 5 8.25 5.33437 8.25 5.75V7.25C8.25 7.66563 8.58437 8 9 8C9.41563 8 9.75 7.66563 9.75 7.25V5.75Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-analysis"><rect width="16" height="16" fill="white"/></clipPath></defs>
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="5.5"/><path d="M13.5 13.5L17 17"/>
  </svg>
)

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      width: 18,
      height: 18,
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease-in-out',
    }}
  >
    <path d="M5 7.5l5 5 5-5"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M9 18l6-6-6-6"/>
  </svg>
)

// ── Menu item icons ──────────────────────────────────────────────────────────

const EventInfoIcon = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-ei)">
      <path d="M1.77778 2.1875C1.53333 2.1875 1.33333 2.38437 1.33333 2.625V11.375C1.33333 11.6156 1.53333 11.8125 1.77778 11.8125H14.2222C14.4667 11.8125 14.6667 11.6156 14.6667 11.375V2.625C14.6667 2.38437 14.4667 2.1875 14.2222 2.1875H1.77778ZM0 2.625C0 1.65977 0.797222 0.875 1.77778 0.875H14.2222C15.2028 0.875 16 1.65977 16 2.625V11.375C16 12.3402 15.2028 13.125 14.2222 13.125H1.77778C0.797222 13.125 0 12.3402 0 11.375V2.625ZM3.33333 6.5625H8.22222C8.59167 6.5625 8.88889 6.85508 8.88889 7.21875C8.88889 7.58242 8.59167 7.875 8.22222 7.875H3.33333C2.96389 7.875 2.66667 7.58242 2.66667 7.21875C2.66667 6.85508 2.96389 6.5625 3.33333 6.5625ZM10.4444 6.5625H12.6667C13.0361 6.5625 13.3333 6.85508 13.3333 7.21875C13.3333 7.58242 13.0361 7.875 12.6667 7.875H10.4444C10.075 7.875 9.77778 7.58242 9.77778 7.21875C9.77778 6.85508 10.075 6.5625 10.4444 6.5625ZM3.33333 9.1875H5.55556C5.925 9.1875 6.22222 9.48008 6.22222 9.84375C6.22222 10.2074 5.925 10.5 5.55556 10.5H3.33333C2.96389 10.5 2.66667 10.2074 2.66667 9.84375C2.66667 9.48008 2.96389 9.1875 3.33333 9.1875ZM7.77778 9.1875H12.6667C13.0361 9.1875 13.3333 9.48008 13.3333 9.84375C13.3333 10.2074 13.0361 10.5 12.6667 10.5H7.77778C7.40833 10.5 7.11111 10.2074 7.11111 9.84375C7.11111 9.48008 7.40833 9.1875 7.77778 9.1875Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-ei"><rect width="16" height="14" fill="white"/></clipPath></defs>
  </svg>
)

const BidSheetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2.5V5.25H14.5V3C14.5 2.725 14.275 2.5 14 2.5H6ZM4.5 2.5H2C1.725 2.5 1.5 2.725 1.5 3V5.25H4.5V2.5ZM1.5 6.75V9.25H4.5V6.75H1.5ZM1.5 10.75V13C1.5 13.275 1.725 13.5 2 13.5H4.5V10.75H1.5ZM6 13.5H14C14.275 13.5 14.5 13.275 14.5 13V10.75H6V13.5ZM14.5 9.25V6.75H6V9.25H14.5ZM0 3C0 1.89688 0.896875 1 2 1H14C15.1031 1 16 1.89688 16 3V13C16 14.1031 15.1031 15 14 15H2C0.896875 15 0 14.1031 0 13V3Z" fill="currentColor"/>
  </svg>
)

const RFIIcon = () => (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-rfi)">
      <path d="M10 2H8.75H8.45C8.21875 0.859375 7.20938 0 6 0C4.79062 0 3.78125 0.859375 3.55 2H3.25H2C0.896875 2 0 2.89688 0 4V14C0 15.1031 0.896875 16 2 16H10C11.1031 16 12 15.1031 12 14V4C12 2.89688 11.1031 2 10 2ZM2.5 3.5V4.25C2.5 4.66563 2.83437 5 3.25 5H6H8.75C9.16563 5 9.5 4.66563 9.5 4.25V3.5H10C10.275 3.5 10.5 3.725 10.5 4V14C10.5 14.275 10.275 14.5 10 14.5H2C1.725 14.5 1.5 14.275 1.5 14V4C1.5 3.725 1.725 3.5 2 3.5H2.5ZM5.25 2.5C5.25 2.30109 5.32902 2.11032 5.46967 1.96967C5.61032 1.82902 5.80109 1.75 6 1.75C6.19891 1.75 6.38968 1.82902 6.53033 1.96967C6.67098 2.11032 6.75 2.30109 6.75 2.5C6.75 2.69891 6.67098 2.88968 6.53033 3.03033C6.38968 3.17098 6.19891 3.25 6 3.25C5.80109 3.25 5.61032 3.17098 5.46967 3.03033C5.32902 2.88968 5.25 2.69891 5.25 2.5ZM3.30625 7.16563L3.29375 7.20312C3.15625 7.59375 3.35938 8.02188 3.75 8.15938C4.14062 8.29688 4.56875 8.09375 4.70625 7.70312L4.71875 7.66563C4.75313 7.56563 4.85 7.5 4.95312 7.5H6.775C7.0375 7.5 7.24687 7.7125 7.24687 7.97188C7.24687 8.14063 7.15625 8.29688 7.00938 8.38125L5.625 9.175C5.39062 9.30938 5.24687 9.55625 5.24687 9.825V10.2469C5.24687 10.6625 5.58125 10.9969 5.99687 10.9969C6.40625 10.9969 6.74062 10.6687 6.74687 10.2594L7.75625 9.68125C8.36875 9.32812 8.74687 8.675 8.74687 7.96875C8.74687 6.87812 7.8625 5.99687 6.775 5.99687H4.95312C4.2125 5.99687 3.55312 6.4625 3.30312 7.1625L3.30625 7.16563ZM7 13C7 12.7348 6.89464 12.4804 6.70711 12.2929C6.51957 12.1054 6.26522 12 6 12C5.73478 12 5.48043 12.1054 5.29289 12.2929C5.10536 12.4804 5 12.7348 5 13C5 13.2652 5.10536 13.5196 5.29289 13.7071C5.48043 13.8946 5.73478 14 6 14C6.26522 14 6.51957 13.8946 6.70711 13.7071C6.89464 13.5196 7 13.2652 7 13Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-rfi"><rect width="12" height="16" fill="white"/></clipPath></defs>
  </svg>
)

const SuppliersIcon = () => (
  <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-sup)">
      <path d="M0.0375 11.6467C0.1875 10.4914 0.7675 9.47324 1.6075 8.7623C2.3825 8.10977 3.375 7.71875 4.4575 7.71875H5.6H6.7425C7.825 7.71875 8.8175 8.10977 9.59 8.7623C10.43 9.47324 11.01 10.4914 11.16 11.6467C11.185 11.8422 11.1975 12.0428 11.1975 12.2459C11.1975 12.6623 10.865 13 10.455 13H9.965H1.2325H0.7425C0.3325 13 0 12.6623 0 12.2459C0 12.0428 0.0125 11.8422 0.0375 11.6467ZM2.4 3.25C2.4 2.38805 2.73714 1.5614 3.33726 0.951903C3.93737 0.34241 4.75131 0 5.6 0C6.44869 0 7.26263 0.34241 7.86274 0.951903C8.46286 1.5614 8.8 2.38805 8.8 3.25C8.8 4.11195 8.46286 4.9386 7.86274 5.5481C7.26263 6.15759 6.44869 6.5 5.6 6.5C4.75131 6.5 3.93737 6.15759 3.33726 5.5481C2.73714 4.9386 2.4 4.11195 2.4 3.25ZM7.6 3.25C7.6 2.71128 7.38929 2.19462 7.01421 1.81369C6.63914 1.43276 6.13043 1.21875 5.6 1.21875C5.06957 1.21875 4.56086 1.43276 4.18579 1.81369C3.81071 2.19462 3.6 2.71128 3.6 3.25C3.6 3.78872 3.81071 4.30538 4.18579 4.68631C4.56086 5.06724 5.06957 5.28125 5.6 5.28125C6.13043 5.28125 6.63914 5.06724 7.01421 4.68631C7.38929 4.30538 7.6 3.78872 7.6 3.25ZM4.4575 8.9375C3.2625 8.9375 2.22 9.59004 1.6525 10.5625C1.4375 10.9281 1.2925 11.342 1.2325 11.7812H2.45H8.75H9.97C9.96 11.7127 9.95 11.6467 9.935 11.5781C9.8625 11.215 9.73 10.8723 9.5475 10.5625C8.98 9.59004 7.9375 8.9375 6.7425 8.9375H4.4575ZM15.2325 13H11.81C11.9325 12.7766 12 12.5201 12 12.2459C12 10.5955 11.2625 9.11777 10.1025 8.1377C10.21 8.12754 10.32 8.125 10.4325 8.125H11.9675C14.195 8.125 16 9.9582 16 12.2205C16 12.6521 15.655 13 15.2325 13ZM10.8 6.5C10.025 6.5 9.325 6.18008 8.8175 5.66465C9.31 4.98926 9.6 4.15391 9.6 3.25C9.6 2.56953 9.435 1.92715 9.1425 1.36348C9.6075 1.01816 10.18 0.8125 10.8 0.8125C12.3475 0.8125 13.6 2.08457 13.6 3.65625C13.6 5.22793 12.3475 6.5 10.8 6.5Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-sup"><rect width="16" height="13" fill="white"/></clipPath></defs>
  </svg>
)

const ScheduleIcon = () => (
  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-sch)">
      <path d="M3.55556 0C3.925 0 4.22222 0.292578 4.22222 0.65625V1.75H8.22222V0.65625C8.22222 0.292578 8.51944 0 8.88889 0C9.25833 0 9.55556 0.292578 9.55556 0.65625V1.75H10.6667C11.6472 1.75 12.4444 2.53477 12.4444 3.5V3.9375V5.25H11.1111H10.6667H1.33333V12.25C1.33333 12.4906 1.53333 12.6875 1.77778 12.6875H7.29167L7.15 13.2398C7.08611 13.4969 7.1 13.7594 7.18889 14H1.77778C0.797222 14 0 13.2152 0 12.25V5.25V3.9375V3.5C0 2.53477 0.797222 1.75 1.77778 1.75H2.88889V0.65625C2.88889 0.292578 3.18611 0 3.55556 0ZM3.33333 7H8.22222C8.59167 7 8.88889 7.29258 8.88889 7.65625C8.88889 8.01992 8.59167 8.3125 8.22222 8.3125H3.33333C2.96389 8.3125 2.66667 8.01992 2.66667 7.65625C2.66667 7.29258 2.96389 7 3.33333 7ZM2.66667 10.2812C2.66667 9.91758 2.96389 9.625 3.33333 9.625H6.44444C6.81389 9.625 7.11111 9.91758 7.11111 10.2812C7.11111 10.6449 6.81389 10.9375 6.44444 10.9375H3.33333C2.96389 10.9375 2.66667 10.6449 2.66667 10.2812ZM15.2722 6.44492L15.6722 6.83867C16.1056 7.26523 16.1056 7.95703 15.6722 8.38633L14.8556 9.19023L12.8833 7.24883L13.7 6.44492C14.1333 6.01836 14.8361 6.01836 15.2722 6.44492ZM8.66389 11.4023L12.2528 7.86953L14.225 9.81094L10.6361 13.341C10.5222 13.4531 10.3806 13.5324 10.2222 13.5707L8.55278 13.9809C8.4 14.0191 8.24167 13.9754 8.13056 13.866C8.01944 13.7566 7.975 13.6008 8.01389 13.4504L8.43056 11.807C8.46944 11.6539 8.55 11.5117 8.66389 11.3996V11.4023Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-sch"><rect width="16" height="14" fill="white"/></clipPath></defs>
  </svg>
)

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-set)">
      <path d="M8.00082 0C8.53207 0 9.05082 0.053125 9.55707 0.15C9.80395 0.196875 10.2383 0.340625 10.4758 0.778125C10.5383 0.89375 10.5883 1.01563 10.6196 1.14688L10.9102 2.35C10.9539 2.53125 11.2602 2.70938 11.4383 2.65625L12.6258 2.30625C12.7508 2.26875 12.8789 2.25 13.0071 2.24688C13.5102 2.23125 13.8508 2.54063 14.0164 2.72813C14.7071 3.5125 15.2383 4.43438 15.5758 5.425C15.6571 5.6625 15.7508 6.10625 15.4914 6.53125C15.4227 6.64375 15.3383 6.75 15.2414 6.84375L14.3446 7.69688C14.2133 7.82188 14.2133 8.18125 14.3446 8.30625L15.2414 9.15938C15.3383 9.25313 15.4227 9.35938 15.4914 9.47188C15.7477 9.89688 15.6539 10.3406 15.5758 10.5781C15.2383 11.5688 14.7071 12.4875 14.0164 13.275C13.8508 13.4625 13.5071 13.7719 13.0071 13.7563C12.8789 13.7531 12.7508 13.7312 12.6258 13.6969L11.4383 13.3438C11.2602 13.2906 10.9539 13.4687 10.9102 13.65L10.6196 14.8531C10.5883 14.9844 10.5383 15.1094 10.4758 15.2219C10.2352 15.6594 9.80082 15.8 9.55707 15.85C9.05082 15.9469 8.53207 16 8.00082 16C7.46957 16 6.95082 15.9469 6.44457 15.85C6.1977 15.8031 5.76332 15.6594 5.52582 15.2219C5.46332 15.1063 5.41332 14.9844 5.38207 14.8531L5.09145 13.65C5.0477 13.4687 4.74145 13.2906 4.56332 13.3438L3.37582 13.6938C3.25082 13.7313 3.1227 13.75 2.99457 13.7531C2.49145 13.7688 2.15082 13.4594 1.9852 13.2719C1.2977 12.4875 0.763324 11.5656 0.425824 10.575C0.344574 10.3375 0.250824 9.89375 0.510199 9.46875C0.578949 9.35625 0.663324 9.25 0.760199 9.15625L1.65707 8.30313C1.78832 8.17813 1.78832 7.81875 1.65707 7.69375L0.757074 6.84062C0.660199 6.74687 0.575824 6.64062 0.507074 6.52812C0.250824 6.10312 0.344574 5.65938 0.425824 5.425C0.763324 4.43438 1.29457 3.51563 1.9852 2.72813C2.15082 2.54063 2.49457 2.23125 2.99457 2.24688C3.1227 2.25 3.25082 2.27188 3.37582 2.30625L4.56332 2.65625C4.74145 2.70938 5.0477 2.53125 5.09145 2.35L5.38207 1.14688C5.41332 1.01563 5.46332 0.890625 5.52582 0.778125C5.76645 0.340625 6.20082 0.2 6.44457 0.15C6.95082 0.053125 7.46957 0 8.00082 0ZM6.81645 1.60625L6.55082 2.70312C6.30707 3.7125 5.1352 4.3875 4.13832 4.09688L3.0602 3.77813C2.54457 4.38125 2.13832 5.08125 1.8727 5.83125L2.69145 6.60938C3.44145 7.32187 3.44145 8.67813 2.69145 9.39062L1.8727 10.1687C2.13832 10.9187 2.54457 11.6188 3.0602 12.2219L4.14145 11.9031C5.1352 11.6094 6.3102 12.2875 6.55395 13.2969L6.81957 14.3938C7.58832 14.5344 8.4227 14.5344 9.19145 14.3938L9.45707 13.2969C9.70082 12.2875 10.8727 11.6125 11.8696 11.9031L12.9508 12.2219C13.4664 11.6188 13.8727 10.9187 14.1383 10.1687L13.3196 9.39062C12.5696 8.67813 12.5696 7.32187 13.3196 6.60938L14.1383 5.83125C13.8727 5.08125 13.4664 4.38125 12.9508 3.77813L11.8696 4.09688C10.8758 4.39063 9.70082 3.7125 9.45707 2.70312L9.19145 1.60625C8.4227 1.46563 7.58832 1.46563 6.81957 1.60625H6.81645ZM6.50082 8C6.50082 8.39782 6.65886 8.77936 6.94016 9.06066C7.22147 9.34196 7.603 9.5 8.00082 9.5C8.39865 9.5 8.78018 9.34196 9.06148 9.06066C9.34279 8.77936 9.50082 8.39782 9.50082 8C9.50082 7.60218 9.34279 7.22064 9.06148 6.93934C8.78018 6.65804 8.39865 6.5 8.00082 6.5C7.603 6.5 7.22147 6.65804 6.94016 6.93934C6.65886 7.22064 6.50082 7.60218 6.50082 8ZM8.00082 11C7.20517 11 6.44211 10.6839 5.8795 10.1213C5.3169 9.55871 5.00082 8.79565 5.00082 8C5.00082 7.20435 5.3169 6.44129 5.8795 5.87868C6.44211 5.31607 7.20517 5 8.00082 5C8.79647 5 9.55954 5.31607 10.1221 5.87868C10.6848 6.44129 11.0008 7.20435 11.0008 8C11.0008 8.79565 10.6848 9.55871 10.1221 10.1213C9.55954 10.6839 8.79647 11 8.00082 11Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-set"><rect width="16" height="16" fill="white"/></clipPath></defs>
  </svg>
)

const MessagesIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 1.5C1.725 1.5 1.5 1.725 1.5 2V2.69063L6.89062 7.11563C7.5375 7.64688 8.46563 7.64688 9.1125 7.11563L14.5 2.69063V2C14.5 1.725 14.275 1.5 14 1.5H2ZM1.5 4.63125V10C1.5 10.275 1.725 10.5 2 10.5H14C14.275 10.5 14.5 10.275 14.5 10V4.63125L10.0625 8.275C8.8625 9.25937 7.13437 9.25937 5.9375 8.275L1.5 4.63125ZM0 2C0 0.896875 0.896875 0 2 0H14C15.1031 0 16 0.896875 16 2V10C16 11.1031 15.1031 12 14 12H2C0.896875 12 0 11.1031 0 10V2Z" fill="currentColor"/>
  </svg>
)

const BreakdownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.75 1C1.16563 1 1.5 1.33437 1.5 1.75V12.75C1.5 13.1656 1.83437 13.5 2.25 13.5H15.25C15.6656 13.5 16 13.8344 16 14.25C16 14.6656 15.6656 15 15.25 15H2.25C1.00625 15 0 13.9937 0 12.75V1.75C0 1.33437 0.334375 1 0.75 1ZM4 4.25C4 3.83437 4.33437 3.5 4.75 3.5H11.25C11.6656 3.5 12 3.83437 12 4.25C12 4.66563 11.6656 5 11.25 5H4.75C4.33437 5 4 4.66563 4 4.25ZM4.75 6.5H9.25C9.66563 6.5 10 6.83437 10 7.25C10 7.66563 9.66563 8 9.25 8H4.75C4.33437 8 4 7.66563 4 7.25C4 6.83437 4.33437 6.5 4.75 6.5ZM4.75 9.5H13.25C13.6656 9.5 14 9.83437 14 10.25C14 10.6656 13.6656 11 13.25 11H4.75C4.33437 11 4 10.6656 4 10.25C4 9.83437 4.33437 9.5 4.75 9.5Z" fill="currentColor"/>
  </svg>
)

const BidAnalysisIcon = () => (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-ba)">
      <path d="M2 14.5C1.725 14.5 1.5 14.275 1.5 14V2C1.5 1.725 1.725 1.5 2 1.5H7V4C7 4.55313 7.44687 5 8 5H10.5V14C10.5 14.275 10.275 14.5 10 14.5H2ZM2 0C0.896875 0 0 0.896875 0 2V14C0 15.1031 0.896875 16 2 16H10C11.1031 16 12 15.1031 12 14V4.82812C12 4.29688 11.7906 3.7875 11.4156 3.4125L8.58438 0.584375C8.20938 0.209375 7.70312 0 7.17188 0H2ZM8.5 9.5C8.5 7.84375 7.15625 6.5 5.5 6.5C3.84375 6.5 2.5 7.84375 2.5 9.5C2.5 11.1562 3.84375 12.5 5.5 12.5C6.05625 12.5 6.575 12.35 7.02187 12.0875L8.21875 13.2844C8.5125 13.5781 8.9875 13.5781 9.27812 13.2844C9.56875 12.9906 9.57187 12.5156 9.27812 12.225L8.08125 11.0281C8.34688 10.5812 8.49687 10.0594 8.49687 9.5H8.5ZM5.5 8C5.89782 8 6.27936 8.15804 6.56066 8.43934C6.84196 8.72064 7 9.10218 7 9.5C7 9.89782 6.84196 10.2794 6.56066 10.5607C6.27936 10.842 5.89782 11 5.5 11C5.10218 11 4.72064 10.842 4.43934 10.5607C4.15804 10.2794 4 9.89782 4 9.5C4 9.10218 4.15804 8.72064 4.43934 8.43934C4.72064 8.15804 5.10218 8 5.5 8Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-ba"><rect width="12" height="16" fill="white"/></clipPath></defs>
  </svg>
)

const RFIAnalysisIcon = () => (
  <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-ra)">
      <path d="M10 2H8.75H8.45C8.21875 0.859375 7.20938 0 6 0C4.79062 0 3.78125 0.859375 3.55 2H3.25H2C0.896875 2 0 2.89688 0 4V14C0 15.1031 0.896875 16 2 16H10C11.1031 16 12 15.1031 12 14V4C12 2.89688 11.1031 2 10 2ZM2.5 3.5V4.25C2.5 4.66563 2.83437 5 3.25 5H6H8.75C9.16563 5 9.5 4.66563 9.5 4.25V3.5H10C10.275 3.5 10.5 3.725 10.5 4V14C10.5 14.275 10.275 14.5 10 14.5H2C1.725 14.5 1.5 14.275 1.5 14V4C1.5 3.725 1.725 3.5 2 3.5H2.5ZM5.25 2.5C5.25 2.30109 5.32902 2.11032 5.46967 1.96967C5.61032 1.82902 5.80109 1.75 6 1.75C6.19891 1.75 6.38968 1.82902 6.53033 1.96967C6.67098 2.11032 6.75 2.30109 6.75 2.5C6.75 2.69891 6.67098 2.88968 6.53033 3.03033C6.38968 3.17098 6.19891 3.25 6 3.25C5.80109 3.25 5.61032 3.17098 5.46967 3.03033C5.32902 2.88968 5.25 2.69891 5.25 2.5ZM3.30625 7.16563L3.29375 7.20312C3.15625 7.59375 3.35938 8.02188 3.75 8.15938C4.14062 8.29688 4.56875 8.09375 4.70625 7.70312L4.71875 7.66563C4.75313 7.56563 4.85 7.5 4.95312 7.5H6.775C7.0375 7.5 7.24687 7.7125 7.24687 7.97188C7.24687 8.14063 7.15625 8.29688 7.00938 8.38125L5.625 9.175C5.39062 9.30938 5.24687 9.55625 5.24687 9.825V10.2469C5.24687 10.6625 5.58125 10.9969 5.99687 10.9969C6.40625 10.9969 6.74062 10.6687 6.74687 10.2594L7.75625 9.68125C8.36875 9.32812 8.74687 8.675 8.74687 7.96875C8.74687 6.87812 7.8625 5.99687 6.775 5.99687H4.95312C4.2125 5.99687 3.55312 6.4625 3.30312 7.1625L3.30625 7.16563ZM7 13C7 12.7348 6.89464 12.4804 6.70711 12.2929C6.51957 12.1054 6.26522 12 6 12C5.73478 12 5.48043 12.1054 5.29289 12.2929C5.10536 12.4804 5 12.7348 5 13C5 13.2652 5.10536 13.5196 5.29289 13.7071C5.48043 13.8946 5.73478 14 6 14C6.26522 14 6.51957 13.8946 6.70711 13.7071C6.89464 13.5196 7 13.2652 7 13Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-ra"><rect width="12" height="16" fill="white"/></clipPath></defs>
  </svg>
)

const ScenarioIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#mm-sc)">
      <path d="M6.5 1.5C7.82608 1.5 9.09785 2.02678 10.0355 2.96447C10.9732 3.90215 11.5 5.17392 11.5 6.5C11.5 7.82608 10.9732 9.09785 10.0355 10.0355C9.09785 10.9732 7.82608 11.5 6.5 11.5C5.17392 11.5 3.90215 10.9732 2.96447 10.0355C2.02678 9.09785 1.5 7.82608 1.5 6.5C1.5 5.17392 2.02678 3.90215 2.96447 2.96447C3.90215 2.02678 5.17392 1.5 6.5 1.5ZM6.5 13C8.025 13 9.42813 12.475 10.5344 11.5969L14.7188 15.7812C15.0125 16.075 15.4875 16.075 15.7781 15.7812C16.0687 15.4875 16.0719 15.0125 15.7781 14.7219L11.5969 10.5344C12.475 9.42813 13 8.025 13 6.5C13 2.90937 10.0906 0 6.5 0C2.90937 0 0 2.90937 0 6.5C0 10.0906 2.90937 13 6.5 13ZM3.25 6.75V8.75C3.25 9.16563 3.58437 9.5 4 9.5C4.41563 9.5 4.75 9.16563 4.75 8.75V6.75C4.75 6.33437 4.41563 6 4 6C3.58437 6 3.25 6.33437 3.25 6.75ZM5.75 3.75V8.75C5.75 9.16563 6.08437 9.5 6.5 9.5C6.91563 9.5 7.25 9.16563 7.25 8.75V3.75C7.25 3.33437 6.91563 3 6.5 3C6.08437 3 5.75 3.33437 5.75 3.75ZM8.25 5.75V8.75C8.25 9.16563 8.58437 9.5 9 9.5C9.41563 9.5 9.75 9.16563 9.75 8.75V5.75C9.75 5.33437 9.41563 5 9 5C8.58437 5 8.25 5.33437 8.25 5.75Z" fill="currentColor"/>
    </g>
    <defs><clipPath id="mm-sc"><rect width="16" height="16" fill="white"/></clipPath></defs>
  </svg>
)

// ── Data ─────────────────────────────────────────────────────────────────────

type Tab = 'design' | 'bidding' | 'analysis'

const TABS: { key: Tab; label: string; Icon: React.FC }[] = [
  { key: 'design',   label: 'Design',   Icon: DesignTabIcon },
  { key: 'bidding',  label: 'Bidding',  Icon: BiddingTabIcon },
  { key: 'analysis', label: 'Analysis', Icon: AnalysisTabIcon },
]

interface MenuItem { label: string; Icon: React.FC }

const MENU_COLS: MenuItem[][] = [
  [
    { label: 'Event info',  Icon: EventInfoIcon },
    { label: 'Bid sheet',   Icon: BidSheetIcon },
    { label: 'RFI',         Icon: RFIIcon },
    { label: 'Suppliers',   Icon: SuppliersIcon },
    { label: 'Schedule',    Icon: ScheduleIcon },
    { label: 'Settings',    Icon: SettingsIcon },
  ],
  [
    { label: 'Messages',    Icon: MessagesIcon },
    { label: 'Breakdown',   Icon: BreakdownIcon },
  ],
  [
    { label: 'Bid analysis',      Icon: BidAnalysisIcon },
    { label: 'RFI analysis',      Icon: RFIAnalysisIcon },
    { label: 'Scenario analysis', Icon: ScenarioIcon },
  ],
]

const COL_PARENTS: Tab[] = ['design', 'bidding', 'analysis']

// ── Component ────────────────────────────────────────────────────────────────

export default function MegaMenuTile() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('design')
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<{ parent: string; page?: string }>({ parent: 'Design' })

  const tileRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // ── Slider positioning ───────────────────────────────────────────────────
  const moveSlider = useCallback(() => {
    const pill = pillRef.current
    const slider = sliderRef.current
    if (!pill || !slider) return
    const activeBtn = tabRefs.current[TABS.findIndex(t => t.key === activeTab)]
    if (!activeBtn) return
    const pillRect = pill.getBoundingClientRect()
    const btnRect  = activeBtn.getBoundingClientRect()
    slider.style.left  = (btnRect.left - pillRect.left) + 'px'
    slider.style.width = btnRect.width + 'px'
  }, [activeTab])

  useEffect(() => {
    moveSlider()
  }, [moveSlider])

  // Reposition on font/layout settle
  useEffect(() => {
    const id = requestAnimationFrame(moveSlider)
    return () => cancelAnimationFrame(id)
  }, [moveSlider])

  // ── Filtered items (flat list for keyboard nav) ──────────────────────────
  const filteredCols = MENU_COLS.map(col =>
    col.filter(item =>
      !searchQuery || item.label.toLowerCase().startsWith(searchQuery.toLowerCase())
    )
  )

  const flatFiltered: { item: MenuItem; colIndex: number; rowIndex: number }[] = []
  filteredCols.forEach((col, ci) => {
    col.forEach((item, ri) => {
      flatFiltered.push({ item, colIndex: ci, rowIndex: ri })
    })
  })

  // ── Open / close ─────────────────────────────────────────────────────────
  const open = useCallback(() => {
    setIsOpen(true)
    setSearchQuery('')
    setHighlightedIndex(flatFiltered.length > 0 ? 0 : null)
    setTimeout(() => {
      searchRef.current?.focus()
    }, 160)
  }, [flatFiltered.length])

  const close = useCallback(() => {
    setIsOpen(false)
    setSearchQuery('')
    setHighlightedIndex(null)
  }, [])

  // Highlight first item when search changes
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(flatFiltered.length > 0 ? 0 : null)
    }
  // flatFiltered changes when searchQuery changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isOpen])

  // ── Outside click to close ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      const navControls = pillRef.current?.closest('[data-nav-controls]')
      if (navControls && navControls.contains(e.target as Node)) return
      close()
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isOpen, close])

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const tile = tileRef.current
    if (!tile) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        isOpen ? close() : open()
        return
      }
      if (e.key === 'Escape' && isOpen) {
        close()
        return
      }
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex(prev => {
          if (prev === null || flatFiltered.length === 0) return 0
          return (prev + 1) % flatFiltered.length
        })
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex(prev => {
          if (prev === null || flatFiltered.length === 0) return 0
          return (prev - 1 + flatFiltered.length) % flatFiltered.length
        })
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const dir = e.key === 'ArrowRight' ? 1 : -1
        if (highlightedIndex === null) return
        const current = flatFiltered[highlightedIndex]
        if (!current) return
        let targetColIdx = current.colIndex + dir
        while (targetColIdx >= 0 && targetColIdx < filteredCols.length) {
          if (filteredCols[targetColIdx].length > 0) {
            const targetRowIdx = Math.min(current.rowIndex, filteredCols[targetColIdx].length - 1)
            const newFlat = flatFiltered.findIndex(
              f => f.colIndex === targetColIdx && f.rowIndex === targetRowIdx
            )
            if (newFlat !== -1) setHighlightedIndex(newFlat)
            return
          }
          targetColIdx += dir
        }
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (highlightedIndex !== null && flatFiltered[highlightedIndex]) {
          const { item, colIndex } = flatFiltered[highlightedIndex]
          const parent = COL_PARENTS[colIndex]
          setActiveTab(parent)
          setBreadcrumb({ parent: TABS.find(t => t.key === parent)!.label, page: item.label })
          close()
        }
      }
    }

    tile.addEventListener('keydown', handleKeyDown)
    return () => tile.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, open, close, flatFiltered, highlightedIndex, filteredCols])

  // ── Tab click ────────────────────────────────────────────────────────────
  function handleTabClick(tab: Tab) {
    setActiveTab(tab)
    setBreadcrumb({ parent: TABS.find(t => t.key === tab)!.label })
  }

  // ── Menu item click ──────────────────────────────────────────────────────
  function handleItemClick(item: MenuItem, colIndex: number) {
    const parent = COL_PARENTS[colIndex]
    setActiveTab(parent)
    setBreadcrumb({ parent: TABS.find(t => t.key === parent)!.label, page: item.label })
    close()
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={tileRef}
      tabIndex={0}
      className="relative w-full outline-none focus-visible:shadow-[0_0_0_3px_rgba(68,67,180,0.2)]"
      style={{ height: 560, background: 'white', border: '1px solid #E4E4E7', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >

      {/* ── App header ── */}
      <div
        style={{
          width: '100%',
          height: 64,
          background: 'white',
          borderBottom: '1px solid #E4E4E7',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          padding: '0 16px',
        }}
      >
        {/* Nav controls — pill centred, chevron absolute right */}
        <div data-nav-controls style={{ position: 'relative' }}>

          {/* Pill nav */}
          <div
            ref={pillRef}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#FAFAFA',
              border: '1px solid #F4F4F5',
              borderRadius: 16,
              padding: 4,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {/* Sliding active indicator */}
            <div
              ref={sliderRef}
              style={{
                position: 'absolute',
                top: 4,
                height: 34,
                borderRadius: 12,
                background: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)',
                outline: '1px solid rgba(0,0,0,0.02)',
                transition: 'left 0.27s ease-in-out, width 0.27s ease-in-out',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {TABS.map((tab, i) => (
              <button
                key={tab.key}
                ref={el => { tabRefs.current[i] = el }}
                onClick={e => { e.stopPropagation(); handleTabClick(tab.key) }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 12px',
                  height: 34,
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 500,
                  color: activeTab === tab.key ? '#4443B4' : '#71717A',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  fontFamily: 'inherit',
                  transition: 'color 0.2s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1,
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.key) (e.currentTarget as HTMLButtonElement).style.color = '#3F3F46'
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.key) (e.currentTarget as HTMLButtonElement).style.color = '#71717A'
                }}
              >
                <tab.Icon />
                {tab.label}
              </button>
            ))}

            {/* Mega menu anchor — 4px below pill */}
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                pointerEvents: 'none',
              }}
            >
              <div
                ref={panelRef}
                style={{
                  width: 660,
                  background: 'white',
                  border: '1px solid #E4E4E7',
                  borderRadius: 16,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                  opacity: isOpen ? 1 : 0,
                  pointerEvents: isOpen ? 'all' : 'none',
                  transform: isOpen ? 'scale(1)' : 'scale(0.9)',
                  transformOrigin: 'top center',
                  transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  overflow: 'hidden',
                }}
              >
                {/* Search */}
                <div style={{ padding: '12px 12px 8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      height: 36,
                      border: '1px solid #E4E4E7',
                      borderRadius: 10,
                      padding: '0 12px',
                      background: '#FAFAFA',
                      transition: 'border-color 0.13s, box-shadow 0.13s, background 0.13s',
                    }}
                    onFocus={e => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.borderColor = '#4443B4'
                      el.style.boxShadow = '0 0 0 3px rgba(68,67,180,0.12)'
                      el.style.background = 'white'
                    }}
                    onBlur={e => {
                      const el = e.currentTarget as HTMLDivElement
                      el.style.borderColor = '#E4E4E7'
                      el.style.boxShadow = 'none'
                      el.style.background = '#FAFAFA'
                    }}
                  >
                    <span style={{ color: '#A1A1AA', flexShrink: 0, display: 'flex' }}>
                      <SearchIcon />
                    </span>
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search..."
                      tabIndex={-1}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        color: '#27272A',
                        background: 'transparent',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      {['⌘', 'K'].map(k => (
                        <span
                          key={k}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'white',
                            border: '1px solid #E4E4E7',
                            borderRadius: 6,
                            padding: '0 7px',
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#71717A',
                            fontFamily: 'inherit',
                            height: 24,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                          }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3-column grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
                    padding: '0 4px 0',
                  }}
                >
                  {filteredCols.flatMap((col, ci) => {
                    const colEl = (
                      <div key={`col-${ci}`} style={{ padding: '4px 8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {col.map(item => {
                          const flatIdx = flatFiltered.findIndex(f => f.colIndex === ci && f.item.label === item.label)
                          const isHighlighted = flatIdx !== -1 && flatIdx === highlightedIndex
                          return (
                            <button
                              key={item.label}
                              onClick={() => handleItemClick(item, ci)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: 8,
                                borderRadius: 12,
                                cursor: 'pointer',
                                border: 'none',
                                background: isHighlighted ? '#FAFAFA' : 'none',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                                width: '100%',
                                transition: 'background 0.1s',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = '#FAFAFA'
                                const icon = (e.currentTarget as HTMLButtonElement).querySelector('[data-icon]') as HTMLElement
                                if (icon) icon.style.background = '#E4E4E7'
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = isHighlighted ? '#FAFAFA' : 'none'
                                const icon = (e.currentTarget as HTMLButtonElement).querySelector('[data-icon]') as HTMLElement
                                if (icon) icon.style.background = isHighlighted ? '#E4E4E7' : '#F4F4F5'
                              }}
                            >
                              <div
                                data-icon
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 8,
                                  background: isHighlighted ? '#E4E4E7' : '#F4F4F5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  transition: 'background 0.1s',
                                  color: '#52525B',
                                }}
                              >
                                <item.Icon />
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 500, color: '#27272A' }}>
                                {item.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )
                    return ci < 2
                      ? [colEl, <div key={`div-${ci}`} style={{ background: '#F4F4F5', margin: '4px 0 12px' }} />]
                      : [colEl]
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Chevron button — 4px right of pill */}
          <button
            onClick={e => { e.stopPropagation(); isOpen ? close() : open() }}
            aria-label="Toggle menu"
            style={{
              position: 'absolute',
              left: 'calc(100% + 4px)',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 12,
              border: 'none',
              background: isOpen ? '#FAFAFA' : 'transparent',
              cursor: 'pointer',
              color: '#71717A',
              transition: 'background 0.15s ease-out',
              fontFamily: 'inherit',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#F4F4F5'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = isOpen ? '#FAFAFA' : 'transparent'
            }}
          >
            <ChevronDownIcon open={isOpen} />
          </button>
        </div>
      </div>

      {/* ── Page body ── */}
      <div
        style={{
          flex: 1,
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #ffffff 0%, rgba(167,139,250,0.05) 100%)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.28, pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{ height: 12, background: '#D4D4D8', borderRadius: 4, width: '52%' }} />
          <div style={{ height: 12, background: '#D4D4D8', borderRadius: 4, width: '33%' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ height: 56, background: '#E4E4E7', borderRadius: 8 }} />
            <div style={{ height: 56, background: '#E4E4E7', borderRadius: 8 }} />
            <div style={{ height: 56, background: '#E4E4E7', borderRadius: 8 }} />
          </div>
          <div style={{ height: 12, background: '#D4D4D8', borderRadius: 4, width: '68%' }} />
          <div style={{ height: 12, background: '#D4D4D8', borderRadius: 4, width: '44%' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ height: 56, background: '#E4E4E7', borderRadius: 8 }} />
            <div style={{ height: 56, background: '#E4E4E7', borderRadius: 8 }} />
            <div style={{ height: 56, background: '#E4E4E7', borderRadius: 8 }} />
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#A1A1AA',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          Page location
        </span>
        <div style={{ width: 1, height: 14, background: '#E4E4E7', flexShrink: 0 }} />
        <Breadcrumb>
          <BreadcrumbList className="gap-1.5 text-[13px] font-medium flex-nowrap">
            {breadcrumb.page ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={e => { e.preventDefault(); setBreadcrumb({ parent: breadcrumb.parent }) }}
                    className="text-[#A1A1AA] hover:text-[#3F3F46] transition-colors text-[13px] font-medium"
                  >
                    {breadcrumb.parent}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-[#D4D4D8]">
                  <ChevronRightIcon />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[#3F3F46] text-[13px] font-medium">
                    {breadcrumb.page}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#3F3F46] text-[13px] font-medium">
                  {breadcrumb.parent}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

    </div>
  )
}
