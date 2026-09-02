# Haandi by Yumto — Firebase Database & Authentication Setup Guide

This guide details how to activate and automatically seed **Cloud Firestore** and **Firebase Authentication** for project `haandi-web-app`.

---

## ⚡ 2-Minute Activation in Firebase Console

Before automated scripts or apps can write to Firebase, the two services must be toggled on in the Firebase Console:

### Step 1: Enable Firebase Authentication
1. Open the [Firebase Authentication Console](https://console.firebase.google.com/project/haandi-web-app/authentication)
2. Click **Get Started** (if not already clicked).
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Toggle **Enable** to ON and click **Save**.

---

### Step 2: Enable Cloud Firestore Database
1. Open the [Cloud Firestore Console](https://console.firebase.google.com/project/haandi-web-app/firestore)
2. Click **Create database**.
3. Choose your database location: **`asia-south1` (Mumbai)** or default.
4. For security rules, select **Start in test mode** (allows read/write during setup) and click **Enable**.

---

## 🚀 Step 3: Run the Automated Database Seeder

Once the two toggles above are enabled, run this single command in your terminal:

```bash
npm run seed:firebase
```

### What `npm run seed:firebase` Does Automatically:
1. **Creates All 6 Authentication Accounts** in Firebase Auth with default password `Haandi@2026`:
   - `owner@haandi.yumto.com` (Owner)
   - `manager@haandi.yumto.com` (Manager)
   - `cashier@haandi.yumto.com` (Cashier)
   - `kitchen@haandi.yumto.com` (Kitchen Chef)
   - `rider@haandi.yumto.com` (Rider)
   - `customer@haandi.yumto.com` (Customer)
2. **Populates Firestore Collections:**
   - `branches/br-isb`: Single active location locked to **Gulberg Greens Civic Center, Islamabad** (GPS coordinates: `33.5932, 73.1365`, phone `0330 0500600`, NTN `4585147-3`, 2.5 km radius, 5% card / 16% cash sales tax).
   - `floors`: Ground Floor (Main Dining), First Floor (Family Section), Rooftop (VIP Majlis & Executive Cabins).
   - `tables`: All 16 tables across the Islamabad branch with capacities and types.
   - `users`: User profiles with roles, names, phone numbers, and branch links.
   - `menu`: Complete authentic Haandi menu (Desi Murgh Handi, Paneer Reshmi Handi, Mutton Shinwari Karahi, Charcoal BBQ, Platters, Dum Biryani, Naan, Desserts & Beverages).
   - `settings/system_rules`: System policies and operational configurations.

---

## 🛡️ Recommended Firestore Security Rules

Once seeded, paste these rules in the **Rules** tab of Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can view branches, menu, and floors/tables
    match /branches/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /floors/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /tables/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /menu/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User profile access
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders & Reservations
    match /orders/{orderId} {
      allow read, write: if true;
    }
    match /reservations/{reservationId} {
      allow read, write: if true;
    }
  }
}
```
