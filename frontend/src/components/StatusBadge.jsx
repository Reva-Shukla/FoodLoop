import React from 'react';
import { Clock, CheckCircle2, Truck, Check, XCircle, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const norm = (status || 'PENDING').toUpperCase();

  switch (norm) {
    case 'PENDING':
      return (
        <span className="badge badge-pending">
          <Clock size={12} /> Pending
        </span>
      );
    case 'ACCEPTED':
      return (
        <span className="badge badge-accepted">
          <Check size={12} /> Accepted
        </span>
      );
    case 'PICKUP_IN_PROGRESS':
      return (
        <span className="badge badge-in_progress">
          <Truck size={12} /> Pickup En Route
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="badge badge-completed">
          <CheckCircle2 size={12} /> Completed
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="badge badge-cancelled">
          <XCircle size={12} /> Cancelled
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="badge badge-expired">
          <AlertTriangle size={12} /> Expired
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
}
