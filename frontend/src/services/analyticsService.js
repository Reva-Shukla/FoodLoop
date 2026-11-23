/**
 * Central Analytics Service for Campus Supervisor Portal
 * 
 * Architectural Role:
 * - Single source of truth for Campus Supervisor analytics, hostel comparisons, and sustainability reporting.
 * - Enforces the exact mathematical definitions:
 *     Surplus = Prepared - Served
 *     Donated = Portions associated with completed pickups (PICKED_UP / COMPLETED)
 *     Wasted = Actual recorded discarded unserved surplus
 *     Remaining = Surplus - Donated - Wasted
 *     Active Reserved = Portions in AVAILABLE or CLAIMED donations
 *     Unallocated = Remaining - Active Reserved
 *     Redistribution Rate = (Donated / Surplus) * 100%
 *     Surplus Wastage Rate = (Wasted / Surplus) * 100%
 *     Serving Utilisation = (Served / Prepared) * 100%
 * - Reporting Date Consistency Convention:
 *     Allocation-based analytics group records by their source meal's service date.
 *     Associated donations, completed pickups, and discarded quantities contribute to the
 *     lifecycle totals of their source meal cohort.
 * - All food quantities are measured exclusively in integer PORTIONS.
 */

import { foodLoopService, getTodayDateString } from './foodLoopService';
import { CHITKARA_CAMPUS_DIRECTORY } from '../data/hostels';

export const analyticsService = {
  /**
   * Helper: checks if a record date falls within the selected period filter.
   * Periods: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL' | custom [startDate, endDate]
   */
  isDateInFilter: (dateStr, periodFilter = 'TODAY', customRange = null) => {
    if (!dateStr) return false;
    const now = new Date();
    const todayStr = getTodayDateString();

    if (customRange && customRange.start && customRange.end) {
      const d = new Date(dateStr);
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    }

    if (periodFilter === 'TODAY') {
      return dateStr.startsWith(todayStr);
    }
    if (periodFilter === 'WEEK') {
      const d = new Date(dateStr);
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    if (periodFilter === 'MONTH') {
      const d = new Date(dateStr);
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30;
    }
    return true; // 'ALL'
  },

  /**
   * Fetches meals filtered by period, hostel category, and specific mess.
   */
  getFilteredMeals: async (filter = {}) => {
    const { period = 'TODAY', category = 'ALL', messId = 'ALL', customRange = null } = filter;
    let meals = await foodLoopService.getMealRecords();

    // 1. Date filter (based on source meal date)
    meals = meals.filter((m) =>
      analyticsService.isDateInFilter(m.date || m.createdAt, period, customRange)
    );

    // 2. Hostel category filter (BOYS / GIRLS / ALL)
    if (category !== 'ALL') {
      meals = meals.filter((m) => {
        const h = CHITKARA_CAMPUS_DIRECTORY.find((dir) => dir.id === m.messId);
        return h && h.category === category;
      });
    }

    // 3. Individual mess filter
    if (messId !== 'ALL') {
      meals = meals.filter((m) => m.messId === messId);
    }

    return meals;
  },

  /**
   * 1. Campus Overview Metrics (Aggregated by Meal Service Cohort)
   */
  getCampusMetrics: async (filter = {}) => {
    await foodLoopService.refreshExpiredDonations();
    const meals = await analyticsService.getFilteredMeals(filter);
    const allDonations = await foodLoopService.getDonations();
    const allWaste = await foodLoopService.getWasteRecords();

    let totalPrepared = 0;
    let totalServed = 0;
    let totalSurplus = 0;
    let foodDonated = 0;
    let foodWasted = 0;
    let activeReserved = 0;

    // Aggregate by meal cohort to maintain mathematical consistency
    for (const meal of meals) {
      const prep = meal.preparedPortions ?? meal.prepared ?? 0;
      const srv = meal.servedPortions ?? meal.served ?? 0;
      const sur = Math.max(0, prep - srv);
      const mId = String(meal.id ?? meal.mealId);

      totalPrepared += prep;
      totalServed += srv;
      totalSurplus += sur;

      // Associated donations for this meal
      const mealDons = allDonations.filter((d) => String(d.mealRecordId) === mId);
      for (const d of mealDons) {
        const qty = parseInt(d.portions ?? d.quantity, 10) || 0;
        if (d.status === 'PICKED_UP' || d.status === 'COMPLETED') {
          foodDonated += qty;
        } else if (d.status === 'AVAILABLE' || d.status === 'CLAIMED') {
          activeReserved += qty;
        }
      }

      // Associated waste for this meal
      const mealWsts = allWaste.filter((w) => String(w.mealRecordId) === mId);
      for (const w of mealWsts) {
        foodWasted += parseInt(w.portionsDiscarded, 10) || 0;
      }
    }

    // Remaining Food = Surplus - Donated - Wasted
    const remainingFood = Math.max(0, totalSurplus - foodDonated - foodWasted);

    // Unallocated = Remaining - Active Reserved
    const unallocatedSurplus = Math.max(0, remainingFood - activeReserved);

    // Percentage rates with graceful zero-handling
    const redistributionRate =
      totalSurplus > 0 ? ((foodDonated / totalSurplus) * 100).toFixed(1) : null;
    const surplusWastageRate =
      totalSurplus > 0 ? ((foodWasted / totalSurplus) * 100).toFixed(1) : null;
    const servingUtilisation =
      totalPrepared > 0 ? ((totalServed / totalPrepared) * 100).toFixed(1) : null;

    return {
      totalPrepared,
      totalServed,
      totalSurplus,
      foodDonated,
      foodWasted,
      remainingFood,
      activeReserved,
      unallocatedSurplus,
      redistributionRate: redistributionRate !== null ? `${redistributionRate}%` : 'N/A',
      redistributionRateNum: redistributionRate !== null ? parseFloat(redistributionRate) : 0,
      surplusWastageRate: surplusWastageRate !== null ? `${surplusWastageRate}%` : 'N/A',
      surplusWastageRateNum: surplusWastageRate !== null ? parseFloat(surplusWastageRate) : 0,
      servingUtilisation: servingUtilisation !== null ? `${servingUtilisation}%` : 'N/A',
      servingUtilisationNum: servingUtilisation !== null ? parseFloat(servingUtilisation) : 0,
      mealCount: meals.length,
      reportingNote:
        'Allocation metrics are grouped by source meal cohort to preserve lifecycle integrity.',
    };
  },

  /**
   * 2. Hostel Comparison Performance (All 7 Messes)
   */
  getHostelComparison: async (filter = {}) => {
    await foodLoopService.refreshExpiredDonations();
    const { period = 'TODAY', category = 'ALL', customRange = null } = filter;
    const allMeals = await foodLoopService.getMealRecords();
    const allDonations = await foodLoopService.getDonations();
    const allWaste = await foodLoopService.getWasteRecords();

    const results = CHITKARA_CAMPUS_DIRECTORY.map((mess) => {
      // Filter meals for this mess & period
      const messMeals = allMeals.filter((m) => {
        if (m.messId !== mess.id) return false;
        return analyticsService.isDateInFilter(m.date || m.createdAt, period, customRange);
      });

      let prep = 0;
      let srv = 0;
      let sur = 0;
      let don = 0;
      let wst = 0;
      let reserved = 0;

      for (const meal of messMeals) {
        const p = meal.preparedPortions ?? meal.prepared ?? 0;
        const s = meal.servedPortions ?? meal.served ?? 0;
        const mId = String(meal.id ?? meal.mealId);
        prep += p;
        srv += s;
        sur += Math.max(0, p - s);

        const mDons = allDonations.filter((d) => String(d.mealRecordId) === mId);
        for (const d of mDons) {
          const q = parseInt(d.portions ?? d.quantity, 10) || 0;
          if (d.status === 'PICKED_UP' || d.status === 'COMPLETED') {
            don += q;
          } else if (d.status === 'AVAILABLE' || d.status === 'CLAIMED') {
            reserved += q;
          }
        }

        const mWst = allWaste.filter((w) => String(w.mealRecordId) === mId);
        for (const w of mWst) {
          wst += parseInt(w.portionsDiscarded, 10) || 0;
        }
      }

      const rem = Math.max(0, sur - don - wst);
      const unalloc = Math.max(0, rem - reserved);

      const redistRate = sur > 0 ? parseFloat(((don / sur) * 100).toFixed(1)) : null;
      const wasteRate = sur > 0 ? parseFloat(((wst / sur) * 100).toFixed(1)) : null;
      const utilRate = prep > 0 ? parseFloat(((srv / prep) * 100).toFixed(1)) : null;

      return {
        messId: mess.id,
        messName: mess.name,
        category: mess.category,
        categoryLabel: mess.categoryLabel,
        totalPrepared: prep,
        totalServed: srv,
        totalSurplus: sur,
        foodDonated: don,
        foodWasted: wst,
        remainingFood: rem,
        activeReserved: reserved,
        unallocatedSurplus: unalloc,
        redistributionRate: redistRate !== null ? `${redistRate}%` : 'N/A',
        redistributionRateNum: redistRate !== null ? redistRate : 0,
        surplusWastageRate: wasteRate !== null ? `${wasteRate}%` : 'N/A',
        surplusWastageRateNum: wasteRate !== null ? wasteRate : 0,
        servingUtilisation: utilRate !== null ? `${utilRate}%` : 'N/A',
        mealCount: messMeals.length,
      };
    });

    if (category !== 'ALL') {
      return results.filter((r) => r.category === category);
    }
    return results;
  },

  /**
   * 3. Prepared vs Served Trend (Grouped by Meal Service Date)
   */
  getMealTrendData: async (filter = {}) => {
    const meals = await analyticsService.getFilteredMeals(filter);
    const allDonations = await foodLoopService.getDonations();
    const allWaste = await foodLoopService.getWasteRecords();

    // Group meals by date string
    const map = {};
    meals.forEach((m) => {
      const dateKey = m.date || (m.createdAt ? m.createdAt.split('T')[0] : 'Unknown');
      if (!map[dateKey]) {
        map[dateKey] = {
          date: dateKey,
          prepared: 0,
          served: 0,
          surplus: 0,
          donated: 0,
          wasted: 0,
        };
      }
      const prep = m.preparedPortions || 0;
      const srv = m.servedPortions || 0;
      map[dateKey].prepared += prep;
      map[dateKey].served += srv;
      map[dateKey].surplus += Math.max(0, prep - srv);

      // Associated donations & waste
      const mDons = allDonations.filter((d) => d.mealRecordId === m.id);
      mDons.forEach((d) => {
        if (d.status === 'PICKED_UP' || d.status === 'COMPLETED') {
          map[dateKey].donated += parseInt(d.portions, 10) || 0;
        }
      });
      const mWst = allWaste.filter((w) => w.mealRecordId === m.id);
      mWst.forEach((w) => {
        map[dateKey].wasted += parseInt(w.portionsDiscarded, 10) || 0;
      });
    });

    // Convert map to sorted array
    const sorted = Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted;
  },

  /**
   * 4. Waste Breakdown by Disposal Reason
   */
  getWasteBreakdown: async (filter = {}) => {
    const { period = 'TODAY', category = 'ALL', messId = 'ALL', customRange = null } = filter;
    let waste = await foodLoopService.getWasteRecords();

    // Filter waste records
    waste = waste.filter((w) => {
      if (!analyticsService.isDateInFilter(w.discardedAt, period, customRange)) return false;
      if (category !== 'ALL') {
        const h = CHITKARA_CAMPUS_DIRECTORY.find((dir) => dir.id === w.messId);
        if (!h || h.category !== category) return false;
      }
      if (messId !== 'ALL' && w.messId !== messId) return false;
      return true;
    });

    const totalDiscarded = waste.reduce((acc, w) => acc + (parseInt(w.portionsDiscarded, 10) || 0), 0);

    // Group by reason
    const reasonMap = {};
    const messMap = {};

    waste.forEach((w) => {
      const reason = w.reason || 'Unspecified';
      const qty = parseInt(w.portionsDiscarded, 10) || 0;
      reasonMap[reason] = (reasonMap[reason] || 0) + qty;

      const mName = w.messName || 'Unknown Mess';
      messMap[mName] = (messMap[mName] || 0) + qty;
    });

    const reasonsList = Object.entries(reasonMap).map(([reason, portions]) => ({
      reason,
      portions,
      percentage: totalDiscarded > 0 ? ((portions / totalDiscarded) * 100).toFixed(1) : '0.0',
    }));

    // Find highest discarding mess
    let highestMess = { messName: 'None', portions: 0 };
    Object.entries(messMap).forEach(([name, portions]) => {
      if (portions > highestMess.portions) {
        highestMess = { messName: name, portions };
      }
    });

    // Find most frequent reason
    let topReason = { reason: 'None', portions: 0 };
    reasonsList.forEach((r) => {
      if (r.portions > topReason.portions) {
        topReason = r;
      }
    });

    return {
      totalDiscarded,
      reasons: reasonsList.sort((a, b) => b.portions - a.portions),
      highestMess,
      topReason,
      recordsCount: waste.length,
      records: waste.sort((a, b) => new Date(b.discardedAt) - new Date(a.discardedAt)),
    };
  },

  /**
   * 5. Donation Activity Breakdown (Status & Portion Quantities)
   */
  getDonationStatusSummary: async (filter = {}) => {
    await foodLoopService.refreshExpiredDonations();
    const { period = 'TODAY', category = 'ALL', messId = 'ALL', customRange = null } = filter;
    let donations = await foodLoopService.getDonations();

    donations = donations.filter((d) => {
      if (!analyticsService.isDateInFilter(d.createdAt, period, customRange)) return false;
      if (category !== 'ALL') {
        const h = CHITKARA_CAMPUS_DIRECTORY.find((dir) => dir.id === d.messId);
        if (!h || h.category !== category) return false;
      }
      if (messId !== 'ALL' && d.messId !== messId) return false;
      return true;
    });

    const summary = {
      available: { count: 0, portions: 0 },
      claimed: { count: 0, portions: 0 },
      pickedUp: { count: 0, portions: 0 },
      expired: { count: 0, portions: 0 },
      totalBatches: donations.length,
      totalPortions: 0,
    };

    donations.forEach((d) => {
      const q = parseInt(d.portions, 10) || 0;
      summary.totalPortions += q;

      if (d.status === 'AVAILABLE') {
        summary.available.count += 1;
        summary.available.portions += q;
      } else if (d.status === 'CLAIMED') {
        summary.claimed.count += 1;
        summary.claimed.portions += q;
      } else if (d.status === 'PICKED_UP' || d.status === 'COMPLETED') {
        summary.pickedUp.count += 1;
        summary.pickedUp.portions += q;
      } else if (d.status === 'EXPIRED') {
        summary.expired.count += 1;
        summary.expired.portions += q;
      }
    });

    return summary;
  },

  /**
   * 6. Operational Attention Panel (Deterministic Insights)
   */
  getOperationalAttention: async (filter = {}) => {
    const comparison = await analyticsService.getHostelComparison(filter);
    const wasteSummary = await analyticsService.getWasteBreakdown(filter);
    const pickups = await foodLoopService.getPickups();
    const now = new Date();

    // 1. Highest discarded surplus mess
    const highestWasteMess = [...comparison].sort((a, b) => b.foodWasted - a.foodWasted)[0] || null;

    // 2. Highest surplus wastage rate mess (with minimum 10 portions surplus)
    const activeSurplusMesses = comparison.filter((c) => c.totalSurplus >= 10);
    const highestWasteRateMess =
      activeSurplusMesses.sort((a, b) => b.surplusWastageRateNum - a.surplusWastageRateNum)[0] || null;

    // 3. Most redistributed portions mess
    const topRedistributor = [...comparison].sort((a, b) => b.foodDonated - a.foodDonated)[0] || null;

    // 4. Scheduled pickups approaching deadline (within 3 hours)
    const approachingPickups = pickups.filter((p) => {
      if (p.status !== 'SCHEDULED') return false;
      const msLeft = new Date(p.pickupDeadline) - now;
      return msLeft > 0 && msLeft <= 3 * 60 * 60 * 1000;
    });

    // 5. Missed or expired pickups
    const missedPickups = pickups.filter((p) => {
      if (p.status === 'MISSED') return true;
      if (p.status === 'SCHEDULED' && new Date(p.pickupDeadline) <= now) return true;
      return false;
    });

    return {
      highestWasteMess:
        highestWasteMess && highestWasteMess.foodWasted > 0
          ? `${highestWasteMess.messName} (${highestWasteMess.foodWasted} portions discarded)`
          : 'None recorded',
      highestWasteRateMess:
        highestWasteRateMess && highestWasteRateMess.surplusWastageRateNum > 0
          ? `${highestWasteRateMess.messName} (${highestWasteRateMess.surplusWastageRate})`
          : 'None',
      topRedistributor:
        topRedistributor && topRedistributor.foodDonated > 0
          ? `${topRedistributor.messName} (${topRedistributor.foodDonated} portions collected)`
          : 'None',
      approachingCount: approachingPickups.length,
      approachingPickups,
      missedCount: missedPickups.length,
      missedPickups,
    };
  },

  /**
   * 7. CSV Export Utility with Safe Escaping & Formula Injection Protection
   */
  exportReportCsv: async (reportType, filter = {}) => {
    let filename = '';
    let csvContent = '';
    const todayStr = getTodayDateString();

    // Helper: Escape CSV cell, handle commas, quotes, formula injection
    const escapeCell = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).trim();
      // Formula injection prevention: if starts with '=', '+', '-', '@', prepend a single quote
      if (/^[=+\-@]/.test(str)) {
        str = `'${str}`;
      }
      // Escape double quotes by doubling them
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    if (reportType === 'CAMPUS_SUMMARY') {
      filename = `foodloop-campus-summary-${todayStr}.csv`;
      const m = await analyticsService.getCampusMetrics(filter);
      const headers = [
        'Reporting Period',
        'Cohort Meals Count',
        'Total Prepared (Portions)',
        'Total Served (Portions)',
        'Total Surplus (Portions)',
        'Food Donated (Portions)',
        'Food Wasted (Portions)',
        'Remaining Surplus (Portions)',
        'Active Reserved (Portions)',
        'Unallocated Surplus (Portions)',
        'Redistribution Rate',
        'Surplus Wastage Rate',
        'Serving Utilisation',
      ];
      const row = [
        filter.period || 'TODAY',
        m.mealCount,
        m.totalPrepared,
        m.totalServed,
        m.totalSurplus,
        m.foodDonated,
        m.foodWasted,
        m.remainingFood,
        m.activeReserved,
        m.unallocatedSurplus,
        m.redistributionRate,
        m.surplusWastageRate,
        m.servingUtilisation,
      ];
      csvContent = `${headers.map(escapeCell).join(',')}\r\n${row.map(escapeCell).join(',')}\r\n`;
    } else if (reportType === 'HOSTEL_PERFORMANCE') {
      filename = `foodloop-hostel-performance-${todayStr}.csv`;
      const list = await analyticsService.getHostelComparison(filter);
      const headers = [
        'Hostel Mess',
        'Hostel Category',
        'Meal Batches',
        'Total Prepared (Portions)',
        'Total Served (Portions)',
        'Total Surplus (Portions)',
        'Food Donated (Portions)',
        'Food Wasted (Portions)',
        'Remaining Surplus (Portions)',
        'Active Reserved (Portions)',
        'Unallocated Surplus (Portions)',
        'Redistribution Rate',
        'Surplus Wastage Rate',
        'Serving Utilisation',
      ];
      const rows = list.map((item) => [
        item.messName,
        item.categoryLabel,
        item.mealCount,
        item.totalPrepared,
        item.totalServed,
        item.totalSurplus,
        item.foodDonated,
        item.foodWasted,
        item.remainingFood,
        item.activeReserved,
        item.unallocatedSurplus,
        item.redistributionRate,
        item.surplusWastageRate,
        item.servingUtilisation,
      ]);
      csvContent = `${headers.map(escapeCell).join(',')}\r\n${rows.map((r) => r.map(escapeCell).join(',')).join('\r\n')}\r\n`;
    } else if (reportType === 'WASTE_RECORDS') {
      filename = `foodloop-waste-records-${todayStr}.csv`;
      const wasteData = await analyticsService.getWasteBreakdown(filter);
      const headers = [
        'Disposal Date & Time',
        'Hostel Mess',
        'Food Item Name',
        'Dietary Classification',
        'Portions Discarded',
        'Disposal Reason',
        'Audit Notes',
      ];
      const rows = wasteData.records.map((w) => [
        w.discardedAt ? new Date(w.discardedAt).toLocaleString() : 'N/A',
        w.messName,
        w.foodName,
        w.foodType === 'NON_VEG' ? 'Non-Veg' : 'Veg',
        w.portionsDiscarded,
        w.reason,
        w.notes || '',
      ]);
      csvContent = `${headers.map(escapeCell).join(',')}\r\n${rows.map((r) => r.map(escapeCell).join(',')).join('\r\n')}\r\n`;
    } else if (reportType === 'DONATION_RECORDS') {
      filename = `foodloop-donations-${todayStr}.csv`;
      let donations = await foodLoopService.getDonations();
      if (filter.messId && filter.messId !== 'ALL') {
        donations = donations.filter((d) => d.messId === filter.messId);
      }
      const headers = [
        'Donation ID',
        'Food Item Name',
        'Source Mess',
        'Dietary Classification',
        'Portions Offered',
        'Pickup Deadline',
        'Pickup Location',
        'Status',
        'Claiming NGO',
        'Published At',
      ];
      const rows = donations.map((d) => [
        d.id,
        d.foodName,
        d.messName,
        d.foodType === 'NON_VEG' ? 'Non-Veg' : 'Veg',
        d.portions,
        d.pickupDeadline ? new Date(d.pickupDeadline).toLocaleString() : 'N/A',
        d.pickupLocation || '',
        d.status,
        d.claimedByNGO ? d.claimedByNGO.name : 'Unclaimed',
        d.createdAt ? new Date(d.createdAt).toLocaleString() : 'N/A',
      ]);
      csvContent = `${headers.map(escapeCell).join(',')}\r\n${rows.map((r) => r.map(escapeCell).join(',')).join('\r\n')}\r\n`;
    } else if (reportType === 'CLAIMS_PICKUPS') {
      filename = `foodloop-pickups-${todayStr}.csv`;
      const pickups = await foodLoopService.getPickups();
      const headers = [
        'Pickup ID',
        'Claim Reference',
        'Food Item Name',
        'Source Mess',
        'Portions',
        'NGO Partner',
        'Pickup Location',
        'Collection Deadline',
        'Status',
        'Completed Timestamp',
      ];
      const rows = pickups.map((p) => [
        p.id,
        p.claimId || 'N/A',
        p.foodName,
        p.messName,
        p.portions,
        p.ngoName || 'NGO Partner',
        p.pickupLocation || '',
        p.pickupDeadline ? new Date(p.pickupDeadline).toLocaleString() : 'N/A',
        p.status,
        p.completedAt ? new Date(p.completedAt).toLocaleString() : 'Pending',
      ]);
      csvContent = `${headers.map(escapeCell).join(',')}\r\n${rows.map((r) => r.map(escapeCell).join(',')).join('\r\n')}\r\n`;
    }

    // Trigger browser download via Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { filename, rowsCount: csvContent.split('\r\n').length - 2 };
  },
};
