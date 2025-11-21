import React from 'react';

export interface Plan {
  id: number;
  speed: string;
  price: string;
  cents: string;
  period: string;
  fullPrice?: string;
  benefits: string[];
  highlight?: boolean;
  description?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

export interface ServiceStatusItem {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'down'; // operational = normal, warning = instability, down = offline
  reports?: number;
  updatedAt: string;
  type: 'social' | 'bank' | 'gaming' | 'streaming';
}