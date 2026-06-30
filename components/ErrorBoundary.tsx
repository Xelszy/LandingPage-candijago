'use client';
import React from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8 bg-black/20 backdrop-blur border border-white/5 rounded-xl border-dashed">
          <p className="text-white/50 font-imprima text-sm tracking-widest text-center">3D MODEL UNAVAILABLE</p>
        </div>
      );
    }

    return this.props.children;
  }
}
