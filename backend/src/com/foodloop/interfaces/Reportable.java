package com.foodloop.interfaces;

import java.io.IOException;
import java.util.Map;

/**
 * Interface: Reportable
 * Syllabus Concept: Java Interfaces & File Handling contracts
 * 
 * Defines contracts for generating summaries and downloadable reports
 * (such as CSV export for donations).
 */
public interface Reportable {
    Map<String, Object> generateSummaryStats(Long entityId);
    String generateCsvReport(Long entityId) throws IOException;
}
