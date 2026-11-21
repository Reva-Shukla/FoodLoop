# FoodLoop — Future Enhancements Roadmap

**Evaluation Phase:** Post-Phase 6 / Future Roadmap  
**Document Purpose:** Cataloging deliberately postponed frontend features to keep Phase 7 Java & MySQL integration simple, focused, and directly achievable.

---

## 1. Overview of Deferred Scope

During architectural planning for FoodLoop, several advanced verification and logistics features were evaluated. To prioritize core system reliability, mathematical conservation, and clean integration with the existing Java backend, the following capabilities have been deliberately postponed to post-launch evaluation cycles.

---

## 2. Deferred Capabilities

### 2.1 Dynamic QR-Code Donation Passes
- **Concept:** Generating a dynamic client-rendered SVG/Canvas QR code containing encoded verification tokens for each published surplus donation batch.
- **Reason for Postponement:** The current evaluation prioritizes operational speed and lightweight bundle sizes. Handover is cleanly documented through authenticated NGO portal confirmation without requiring barcode scanning hardware.
- **Future Integration:** Can be implemented in Phase 8 via `qrcode.react` or server-generated PNG tokens stored in MySQL.

### 2.2 Pickup Verification Codes (OTP / Handover Codes)
- **Concept:** Auto-generating a 6-character alpha-numeric verification code (e.g. `FL-89-K2`) sent to the NGO, which the Mess Manager must enter to finalize handover.
- **Reason for Postponement:** The existing Java backend `Pickup` model does not currently feature verification code fields or SMS/email gateway integrations.
- **Future Integration:** Can be added by extending the Java `Pickup` model with `verificationCode` and `verifiedAt` attributes.

### 2.3 Server-Side Handover Verification & Cryptographic Token Exchange
- **Concept:** Mutual cryptographic challenge-response protocol between the Mess Manager's device and the NGO volunteer's mobile device.
- **Reason for Postponement:** Unnecessary architectural complexity for a campus-scale pilot.

### 2.4 In-App Camera-Based QR Scanning
- **Concept:** Accessing the device's web camera via `navigator.mediaDevices.getUserMedia` to scan volunteer passes in real-time.
- **Reason for Postponement:** Requires browser camera permissions, HTTPS origin requirements, and specialized scanning libraries (`html5-qrcode`). Postponed in favor of simple one-click handover confirmation.

### 2.5 Live GPS & Logistics Tracking
- **Concept:** Real-time map displaying volunteer transit from Patiala / Chandigarh along NH-7 to the Rajpura campus.
- **Reason for Postponement:** Third-party mapping APIs (Google Maps / Mapbox) introduce external dependencies and API keys not suitable for an offline-first academic evaluation.

---

## 3. Preserved Active Scope Summary

The active production scope remains:
- **Portions standard:** All food volume measured exclusively in integer servings.
- **Dietary standard:** Strictly `VEG` and `NON_VEG`.
- **7 Campus Messes:** Franklin, Alfred, Magellan, Archimedes, Pi, IBN, Nightingale.
- **Direct Handover:** Authenticated NGO partner collection confirmation.
- **Live Conservation:** $\text{Total Surplus} = \text{Donated} + \text{Wasted} + \text{Remaining}$.
- **Sustainability Reports:** Verified RFC 4180 CSV export and printable audit views.
