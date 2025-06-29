'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Square, RefreshCw, Activity } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'stopped' | 'starting' | 'running' | 'error';
  pid?: number;
  port?: number;
  uptime?: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/services/status');
      const data = await response.json();
      setServices(data.services);
    } catch (error) {
      console.error('Failed to fetch service status:', error);
    }
  };

  const handleServiceAction = async (serviceName: string, action: 'start' | 'stop' | 'restart') => {
    setLoading(true);
    try {
      await fetch('/api/services/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: serviceName, action })
      });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to control service:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      stopped: 'default',
      starting: 'warning',
      running: 'success',
      error: 'destructive'
    };
    
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatUptime = (ms?: number) => {
    if (!ms) return 'N/A';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const serviceInfo: Record<string, { description: string; icon: string }> = {
    'telegram-bot': { 
      description: 'Monitors Telegram channels for trading signals',
      icon: '💬'
    },
    'crypto-hedge-fund': { 
      description: 'AI agents for token analysis and consensus',
      icon: '🤖'
    },
    'trading-engine': { 
      description: 'Executes trades on Solana DEXs',
      icon: '💱'
    },
    'data-pipeline': { 
      description: 'Real-time blockchain data ingestion',
      icon: '📊'
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Services</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleServiceAction('all', 'start')}
            disabled={loading}
          >
            <Play className="mr-2 h-4 w-4" />
            Start All
          </Button>
          <Button 
            onClick={() => handleServiceAction('all', 'stop')}
            variant="destructive"
            disabled={loading}
          >
            <Square className="mr-2 h-4 w-4" />
            Stop All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <Card key={service.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <span className="text-2xl mr-2">
                  {serviceInfo[service.name]?.icon || '⚙️'}
                </span>
                {service.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </CardTitle>
              {getStatusBadge(service.status)}
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-4">
                {serviceInfo[service.name]?.description || 'Service'}
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="space-y-1">
                  {service.pid && (
                    <div>PID: <span className="font-mono">{service.pid}</span></div>
                  )}
                  {service.port && (
                    <div>Port: <span className="font-mono">{service.port}</span></div>
                  )}
                  {service.status === 'running' && (
                    <div>Uptime: <span className="font-mono">{formatUptime(service.uptime)}</span></div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {service.status === 'stopped' ? (
                    <Button
                      size="sm"
                      onClick={() => handleServiceAction(service.name, 'start')}
                      disabled={loading}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleServiceAction(service.name, 'restart')}
                        disabled={loading}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleServiceAction(service.name, 'stop')}
                        disabled={loading}
                      >
                        <Square className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Services</span>
              <span className="font-mono">{services.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Running</span>
              <span className="font-mono text-green-600">
                {services.filter(s => s.status === 'running').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Stopped</span>
              <span className="font-mono text-gray-600">
                {services.filter(s => s.status === 'stopped').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Errors</span>
              <span className="font-mono text-red-600">
                {services.filter(s => s.status === 'error').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}