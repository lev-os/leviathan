"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCw, AlertCircle } from "lucide-react";

type ServiceStatus = 'stopped' | 'starting' | 'running' | 'error';

type Service = {
  id: string;
  name: string;
  status: ServiceStatus;
  healthCheck?: string;
  lastError?: string;
};

export default function ServiceDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      // @ts-expect-error - serviceBridge is exposed from preload with base64 encoding
      const serviceList = await window.c2VydmljZUJyaWRnZQ.listServices();
      setServices(serviceList);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleStart = async (serviceId: string) => {
    setLoading({ ...loading, [serviceId]: true });
    try {
      // @ts-expect-error - serviceBridge API not in global types
      await window.c2VydmljZUJyaWRnZQ.startService(serviceId);
      await loadServices();
    } catch (error) {
      console.error(`Failed to start service ${serviceId}:`, error);
    } finally {
      setLoading({ ...loading, [serviceId]: false });
    }
  };

  const handleStop = async (serviceId: string) => {
    setLoading({ ...loading, [serviceId]: true });
    try {
      // @ts-expect-error - serviceBridge API not in global types
      await window.c2VydmljZUJyaWRnZQ.stopService(serviceId);
      await loadServices();
    } catch (error) {
      console.error(`Failed to stop service ${serviceId}:`, error);
    } finally {
      setLoading({ ...loading, [serviceId]: false });
    }
  };

  const handleRestart = async (serviceId: string) => {
    setLoading({ ...loading, [serviceId]: true });
    try {
      // @ts-expect-error - serviceBridge API not in global types
      await window.c2VydmljZUJyaWRnZQ.restartService(serviceId);
      await loadServices();
    } catch (error) {
      console.error(`Failed to restart service ${serviceId}:`, error);
    } finally {
      setLoading({ ...loading, [serviceId]: false });
    }
  };

  const getStatusBadge = (status: ServiceStatus) => {
    const variants: Record<ServiceStatus, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      stopped: { variant: "secondary", label: "Stopped" },
      starting: { variant: "outline", label: "Starting..." },
      running: { variant: "default", label: "Running" },
      error: { variant: "destructive", label: "Error" }
    };
    
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leviathan Services</h1>
      <Card>
        <CardHeader>
          <CardTitle>Service Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health Check</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(service.status)}
                      {service.lastError && (
                        <div title={service.lastError}>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.healthCheck && (
                      <span className="text-sm text-muted-foreground">{service.healthCheck}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {service.status === 'stopped' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStart(service.id)}
                          disabled={loading[service.id]}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {service.status === 'running' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestart(service.id)}
                            disabled={loading[service.id]}
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStop(service.id)}
                            disabled={loading[service.id]}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
